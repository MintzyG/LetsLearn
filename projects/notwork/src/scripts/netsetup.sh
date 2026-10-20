#!/usr/bin/env bash
#
# netsetup.sh: get a Linux machine ready for Notwork, and put it back afterwards.
#
#   sudo ./netsetup.sh setup       probe the network if needed, then set everything up
#   sudo ./netsetup.sh teardown    undo everything setup did
#
#   sudo ./netsetup.sh --probe     only look at the network and save what it found
#        ./netsetup.sh --status    show what is set up right now
#   sudo ./netsetup.sh --grant BIN let a program open raw sockets without sudo
#
# Options for setup and --probe:
#   --iface IF    the real interface to use (default: the one the default route uses)
#   --ip ADDR     the stack's own IPv4 address on that network (default: picked by the probe)
#   --veth-only   only set up the test pair, leave the real interface alone
#
# Nothing here survives a reboot: links, routes and offload settings all reset.

set -euo pipefail

# The test pair. The kernel owns one end and has an address on it; the stack opens
# the other end with an AF_PACKET socket and uses its own address. The kernel's end
# lives in its own network namespace, so the desktop's services (mDNS, LLMNR, SSDP,
# ...) never see it and the cable carries only what you send on purpose. The tests
# rely on these names and addresses.
NETNS=notwork
VETH_KERNEL=nw-kernel
VETH_STACK=nw-stack
VETH_KERNEL_IP=10.77.0.1
VETH_STACK_IP=10.77.0.2
VETH_PREFIX=24

# The probe is kept across reboots, so the stack keeps its address on a known network.
# What setup changed lives in /run, which is cleared at boot, like the changes themselves.
PROBE_FILE=${NOTWORK_PROBE_FILE:-/var/lib/notwork/probe.json}
APPLIED_FILE=${NOTWORK_APPLIED_FILE:-/run/notwork/applied.json}

# Offloads let the card (or the kernel, on a veth) merge, split and checksum packets
# for us, so what a raw socket sees isn't what goes on the wire. We turn these off.
# The order matters when turning them back on: the card can only segment (tso) if it
# also checksums (tx).
OFFLOADS=(tx tso gso gro lro)

# --- small helpers ------------------------------------------------------------

say() { printf '%s\n' "$*"; }
step() { printf '  - %s\n' "$*"; }
die() { printf 'netsetup: %s\n' "$*" >&2; exit 1; }

need_root() {
	[[ $EUID -eq 0 ]] || die "this needs root: run it with sudo"
}

need_tools() {
	local tool
	for tool in ip ethtool ping; do
		command -v "$tool" >/dev/null || die "'$tool' is missing: install it with your package manager"
	done
}

ip_to_int() {
	local a b c d
	IFS=. read -r a b c d <<<"$1"
	echo $(((a << 24) | (b << 16) | (c << 8) | d))
}

int_to_ip() {
	echo "$((($1 >> 24) & 255)).$((($1 >> 16) & 255)).$((($1 >> 8) & 255)).$(($1 & 255))"
}

# The files are flat JSON, one "key": "value" per line, so a few lines of sed can
# read them back without depending on jq.
json_escape() {
	local s=${1//\\/\\\\}
	printf '%s' "${s//\"/\\\"}"
}

write_json() { # file key value key value ...
	local file=$1
	shift
	mkdir -p "$(dirname "$file")"
	{
		echo "{"
		while (($# > 0)); do
			printf '  "%s": "%s"' "$1" "$(json_escape "$2")"
			shift 2
			(($# > 0)) && echo "," || echo
		done
		echo "}"
	} >"$file"
}

read_json() { # file key
	sed -n "s/^  \"$2\": \"\(.*\)\",\{0,1\}$/\1/p" "$1"
}

# Runs a command in a network namespace, or right here when the namespace is "".
run_in() { # netns command...
	local ns=$1
	shift
	if [[ -n $ns ]]; then
		ip netns exec "$ns" "$@"
	else
		"$@"
	fi
}

# --- looking at the network -----------------------------------------------------

default_iface() {
	ip -4 route show default | sed -n 's/.* dev \([^ ]*\).*/\1/p' | head -n 1
}

# Prints "on", "off", or nothing when the setting can't be changed on this card.
offload_state() { # netns iface feature
	local long
	case $3 in
		tx) long=tx-checksumming ;;
		tso) long=tcp-segmentation-offload ;;
		gso) long=generic-segmentation-offload ;;
		gro) long=generic-receive-offload ;;
		lro) long=large-receive-offload ;;
	esac
	run_in "$1" ethtool -k "$2" 2>/dev/null | sed -n "s/^$long: \(on\|off\)$/\1/p"
}

offloads_of() { # netns iface: prints e.g. "tx=on tso=on gro=on"
	local feature state list=()
	for feature in "${OFFLOADS[@]}"; do
		state=$(offload_state "$1" "$2" "$feature")
		[[ -n $state ]] && list+=("$feature=$state")
	done
	echo "${list[*]}"
}

ssid_of() {
	if command -v iw >/dev/null; then
		iw dev "$1" link 2>/dev/null | sed -n 's/^\s*SSID: //p'
	fi
}

gateway_mac() { # iface gateway
	ping -c 1 -W 1 -I "$1" "$2" >/dev/null 2>&1 || true
	ip neigh show "$2" dev "$1" | sed -n 's/.* lladdr \([^ ]*\).*/\1/p'
}

# An address is free if nothing answers when the kernel asks for it on the LAN.
# This sends a ping, which makes the kernel send an ARP request first; any device
# that holds the address answers the ARP even if it ignores pings.
ip_is_free() { # iface ip
	ping -c 1 -W 1 -I "$1" "$2" >/dev/null 2>&1 && return 1
	! ip neigh show "$2" dev "$1" | grep -q lladdr
}

# Picks a free address near the top of the network: home routers usually hand out
# DHCP leases from the bottom or the middle of the range.
pick_stack_ip() { # iface network prefix host_ip gateway
	local net size top candidate tries=0
	net=$(ip_to_int "$2")
	size=$((1 << (32 - $3)))
	((size >= 16)) || die "the network is too small to pick an address: pass one with --ip"
	top=$((net + size - 6))
	for ((candidate = top; candidate > net + size / 2 && tries < 20; candidate--, tries++)); do
		local addr
		addr=$(int_to_ip "$candidate")
		[[ $addr == "$4" || $addr == "$5" ]] && continue
		if ip_is_free "$1" "$addr"; then
			echo "$addr"
			return
		fi
	done
	die "found no free address near the top of the network: pass one with --ip"
}

probe() { # iface stack_ip(optional)
	local iface=$1 stack_ip=$2
	local kind=wired cidr host_ip prefix network gateway mask

	say "Probing $iface..."
	ip link show "$iface" >/dev/null 2>&1 || die "no interface called '$iface'"
	[[ -d /sys/class/net/$iface/wireless ]] && kind=wifi

	cidr=$(ip -4 -o addr show dev "$iface" | awk '{print $4}' | head -n 1)
	[[ -n $cidr ]] || die "$iface has no IPv4 address: is it connected?"
	host_ip=${cidr%/*}
	prefix=${cidr#*/}
	mask=$(((0xffffffff << (32 - prefix)) & 0xffffffff))
	network=$(int_to_ip $(($(ip_to_int "$host_ip") & mask)))
	gateway=$(ip -4 route show default dev "$iface" | awk '{print $3}' | head -n 1)
	[[ -n $gateway ]] || die "no default gateway on $iface"

	if [[ -z $stack_ip ]]; then
		stack_ip=$(pick_stack_ip "$iface" "$network" "$prefix" "$host_ip" "$gateway")
	elif ! ip_is_free "$iface" "$stack_ip"; then
		die "$stack_ip is already in use on this network"
	fi

	write_json "$PROBE_FILE" \
		probed_at "$(date -Iseconds)" \
		iface "$iface" \
		kind "$kind" \
		ssid "$(ssid_of "$iface")" \
		mac "$(cat "/sys/class/net/$iface/address")" \
		host_ip "$host_ip" \
		prefix "$prefix" \
		network "$network" \
		gateway "$gateway" \
		gateway_mac "$(gateway_mac "$iface" "$gateway")" \
		stack_ip "$stack_ip" \
		ip_forward "$(cat /proc/sys/net/ipv4/ip_forward)" \
		offloads "$(offloads_of "" "$iface")" \
		netns "$NETNS" \
		veth_kernel "$VETH_KERNEL" \
		veth_kernel_ip "$VETH_KERNEL_IP/$VETH_PREFIX" \
		veth_stack "$VETH_STACK" \
		veth_stack_ip "$VETH_STACK_IP"

	say "Saved to $PROBE_FILE:"
	sed 's/^/  /' "$PROBE_FILE"
}

# The network we're on now, as the probe identifies it. Two homes can both be
# 192.168.0.0/24 behind 192.168.0.1, so the gateway's MAC and the SSID count too.
same_network_as_probe() { # iface
	local iface=$1 gateway
	[[ -f $PROBE_FILE ]] || return 1
	[[ $(read_json "$PROBE_FILE" iface) == "$iface" ]] || return 1
	gateway=$(ip -4 route show default dev "$iface" | awk '{print $3}' | head -n 1)
	[[ $(read_json "$PROBE_FILE" gateway) == "$gateway" ]] || return 1
	[[ $(read_json "$PROBE_FILE" gateway_mac) == "$(gateway_mac "$iface" "$gateway")" ]] || return 1
	[[ $(read_json "$PROBE_FILE" ssid) == "$(json_escape "$(ssid_of "$iface")")" ]] || return 1
}

# --- setting up and tearing down ---------------------------------------------

set_offloads() { # netns iface "tx=off tso=off ..."
	local pair
	for pair in $3; do
		run_in "$1" ethtool -K "$2" "${pair%=*}" "${pair#*=}" >/dev/null 2>&1 || step "couldn't set ${pair%=*} on $2, leaving it"
	done
}

all_off() { # "tx=on tso=off" -> "tx=off tso=off"
	sed 's/=on/=off/g' <<<"$1"
}

setup_veth() {
	say "Test pair: $VETH_KERNEL ($VETH_KERNEL_IP, the kernel, in namespace $NETNS) <-> $VETH_STACK (your stack, $VETH_STACK_IP)"

	ip netns add "$NETNS"
	ip link add "$VETH_STACK" type veth peer name "$VETH_KERNEL" netns "$NETNS"
	step "created the veth pair, with the kernel's end in namespace $NETNS"

	# Before the links come up, so the kernel never sends IPv6 noise on them.
	sysctl -qw "net.ipv6.conf.$VETH_STACK.disable_ipv6=1"
	run_in "$NETNS" sysctl -qw "net.ipv6.conf.$VETH_KERNEL.disable_ipv6=1"
	step "turned IPv6 off on both ends"

	# The stack's end belongs to the stack. The kernel still sees every frame that
	# arrives there; this stops it forwarding them or answering ARP on that end.
	sysctl -qw "net.ipv4.conf.$VETH_STACK.forwarding=0"
	ip link set dev "$VETH_STACK" arp off
	step "told the kernel to stay quiet on $VETH_STACK"

	ip -n "$NETNS" addr add "$VETH_KERNEL_IP/$VETH_PREFIX" dev "$VETH_KERNEL"
	set_offloads "$NETNS" "$VETH_KERNEL" "$(all_off "$(offloads_of "$NETNS" "$VETH_KERNEL")")"
	set_offloads "" "$VETH_STACK" "$(all_off "$(offloads_of "" "$VETH_STACK")")"
	step "turned offloads off on both ends"

	if command -v nmcli >/dev/null && nmcli -t general status >/dev/null 2>&1; then
		nmcli device set "$VETH_STACK" managed no 2>/dev/null || true
		step "asked NetworkManager to leave $VETH_STACK alone"
	fi

	ip -n "$NETNS" link set dev lo up
	ip -n "$NETNS" link set dev "$VETH_KERNEL" up
	ip link set dev "$VETH_STACK" up
	step "brought both ends up"
}

setup_real() { # iface stack_ip before
	local iface=$1 stack_ip=$2 before=$3
	say "Real network: your stack is $stack_ip on $iface"

	set_offloads "" "$iface" "$(all_off "$before")"
	step "turned offloads off on $iface (they were: $before)"

	# The stack's IP isn't the kernel's, so the kernel never answers for it: no RSTs,
	# no port-unreachables, no duplicate pings. But it still sees those packets, and with
	# IP forwarding on (Docker turns it on) it would route a copy back onto the LAN and
	# send ICMP redirects. A blackhole route makes it drop its copy silently. The stack's
	# AF_PACKET socket gets its own copy before the kernel's IP code runs, so it isn't affected.
	ip route add blackhole "$stack_ip/32"
	step "added a blackhole route for $stack_ip, so the kernel ignores it"
}

setup() { # iface stack_ip veth_only
	local iface=$1 stack_ip=$2 veth_only=$3 before="" real=no

	[[ -f $APPLIED_FILE ]] && die "already set up (see --status); run teardown first"

	if [[ $veth_only == no ]]; then
		if [[ -n $stack_ip ]]; then
			probe "$iface" "$stack_ip"
		elif ! same_network_as_probe "$iface"; then
			say "No probe for this network yet (or you moved networks)."
			probe "$iface" ""
		else
			stack_ip=$(read_json "$PROBE_FILE" stack_ip)
			ip_is_free "$iface" "$stack_ip" || {
				say "$stack_ip is taken now; probing again."
				probe "$iface" ""
			}
		fi
		stack_ip=$(read_json "$PROBE_FILE" stack_ip)
		say
	fi

	# Write down what we're about to change first, so teardown can undo even a
	# setup that stopped halfway.
	if [[ $veth_only == no ]]; then
		real=yes
		before=$(offloads_of "" "$iface")
	fi
	write_json "$APPLIED_FILE" \
		applied_at "$(date -Iseconds)" \
		veth yes \
		real "$real" \
		iface "$iface" \
		stack_ip "$stack_ip" \
		offloads_before "$before"

	setup_veth
	if [[ $real == yes ]]; then
		say
		setup_real "$iface" "$stack_ip" "$before"
	fi

	say
	say "Done. Undo it all with: sudo $0 teardown"
}

teardown() {
	local iface stack_ip before
	if [[ ! -f $APPLIED_FILE ]]; then
		say "Nothing is set up. Cleaning up leftovers, if any."
		ip netns del "$NETNS" 2>/dev/null && step "removed the test pair and namespace $NETNS" || true
		return
	fi

	if ip netns list | grep -qw "$NETNS"; then
		ip netns del "$NETNS" # takes the kernel's end with it, and with it the whole pair
		step "removed the test pair and namespace $NETNS"
	fi

	if [[ $(read_json "$APPLIED_FILE" real) == yes ]]; then
		iface=$(read_json "$APPLIED_FILE" iface)
		stack_ip=$(read_json "$APPLIED_FILE" stack_ip)
		before=$(read_json "$APPLIED_FILE" offloads_before)
		ip route del blackhole "$stack_ip/32" 2>/dev/null && step "removed the blackhole route for $stack_ip" || true
		set_offloads "" "$iface" "$before"
		step "restored offloads on $iface ($before)"
	fi

	rm -f "$APPLIED_FILE"
	say "Your machine is back to how it was."
}

status() {
	if [[ -f $APPLIED_FILE ]]; then
		say "Set up ($APPLIED_FILE):"
		sed 's/^/  /' "$APPLIED_FILE"
	else
		say "Not set up."
	fi
	if [[ -f $PROBE_FILE ]]; then
		say "Last probe ($PROBE_FILE):"
		sed 's/^/  /' "$PROBE_FILE"
	fi
	if ip link show "$VETH_STACK" >/dev/null 2>&1; then
		say "Test pair:"
		ip -br link show dev "$VETH_STACK" | sed 's/^/  /'
		ip -n "$NETNS" -br addr show dev "$VETH_KERNEL" 2>/dev/null | sed "s/^/  (in $NETNS) /"
		say "Talk to your stack from the kernel's side with: sudo ip netns exec $NETNS <command>"
	fi
}

grant() { # binary
	[[ -f $1 ]] || die "no such file: $1"
	command -v setcap >/dev/null || die "'setcap' is missing: install libcap (it's often called libcap2-bin)"
	setcap cap_net_raw+ep "$1"
	say "$1 can now open raw sockets without sudo (until you rebuild it)."
}

usage() {
	sed -n '3,17s/^# \{0,1\}//p' "$0"
	exit "${1:-0}"
}

# --- main ---------------------------------------------------------------------

main() {
	local command="" iface="" stack_ip="" veth_only=no binary=""

	while (($# > 0)); do
		case $1 in
			setup | teardown) command=$1 ;;
			--probe) command=probe ;;
			--status) command=status ;;
			--grant) command=grant binary=${2:-} && shift ;;
			--iface) iface=${2:-} && shift ;;
			--ip) stack_ip=${2:-} && shift ;;
			--veth-only) veth_only=yes ;;
			-h | --help) usage ;;
			*) say "unknown argument: $1" >&2 && usage 1 ;;
		esac
		shift
	done
	[[ -n $command ]] || usage 1

	case $command in
		status) status && return ;;
		grant) need_root && grant "$binary" && return ;;
	esac

	[[ $command == probe ]] || need_root
	need_tools
	iface=${iface:-$(default_iface)}
	[[ -n $iface || $veth_only == yes || $command == teardown ]] || die "no default route: pass the interface with --iface"

	case $command in
		setup) setup "$iface" "$stack_ip" "$veth_only" ;;
		teardown) teardown ;;
		probe) probe "$iface" "$stack_ip" ;;
	esac
}

main "$@"
