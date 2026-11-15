import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import katex from 'katex';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import {
  Aside,
  Bitfield,
  Challenge,
  Check,
  Cite,
  Deepening,
  Derivation,
  DoneWhen,
  Figure,
  Grammar,
  HexDump,
  Hint,
  Hints,
  Idea,
  ImageCompare,
  Kbd,
  Ladder,
  Matrix,
  MemoryMap,
  OpcodeTable,
  Pinout,
  Pipeline,
  PixelGrid,
  Plane,
  Recap,
  Reference,
  Register,
  RegisterFile,
  ShowOff,
  Spec,
  Spoiler,
  StateMachine,
  Tape,
  Task,
  Term,
  Terminal,
  Timing,
  Tokens,
  Tree,
  Waveform,
} from '@/components/book';
import { catalog, groups } from '@/components/book/catalog';
import { mintDark, mintLight } from '@/lib/code-themes';

// The component showcase. What each component is for, its props and its MDX come from
// components/book/catalog.ts; this page adds a live demo of each.
// The examples are made up or plain facts from public specs; none of them is a book's answer.

export const metadata: Metadata = { title: 'Book components' };

const ipv4 = [
  { name: 'Version', bits: 4 },
  { name: 'IHL', bits: 4 },
  { name: 'Type of Service', bits: 8 },
  { name: 'Total Length', bits: 16 },
  { name: 'Identification', bits: 16 },
  { name: 'Flags', bits: 3 },
  { name: 'Fragment Offset', bits: 13 },
  { name: 'Time to Live', bits: 8, highlight: true },
  { name: 'Protocol', bits: 8 },
  { name: 'Header Checksum', bits: 16 },
  { name: 'Source Address', bits: 32 },
  { name: 'Destination Address', bits: 32 },
  { name: 'Options', bits: 'variable' as const },
];

const demos: Record<string, ReactNode> = {
  Idea: <Idea>A layer only talks to the layers right above and below it.</Idea>,
  Aside: (
      <>
        <Aside title="Why a toy?">
          A real stack handles every corner of the spec. This one follows the happy path, and says what it skips.
        </Aside>
        <Aside type="tip" title="Print it">
          When a test fails, print the bytes you got next to the bytes you expected.
        </Aside>
        <Aside type="warning" title="Byte order">
          Multi-byte fields go over the wire <strong>big-endian</strong>, whatever your CPU uses.
        </Aside>
      </>
    ),
  Cite: (
      <p>
        Every IPv4 header starts with its version{' '}
        <Cite href="https://www.rfc-editor.org/rfc/rfc791#section-3.1">RFC 791 §3.1</Cite>.
      </p>
    ),
  Term: (
      <p>
        Each hop lowers the <Term def="Time to Live: how many more routers may pass the packet on.">TTL</Term> by one.
      </p>
    ),
  Check: (
      <Check question="Two hosts on the same switch: does a frame between them pass through your router?">
        <p>No. The switch forwards it by MAC address, straight from one port to the other. The router only sees frames addressed to it.</p>
      </Check>
    ),
  Bitfield: <Bitfield caption="The IPv4 header (RFC 791, section 3.1)." fields={ipv4} />,
  HexDump: (
      <HexDump
        bytes="ff ff ff ff ff ff 02 00 00 00 00 01 08 06 00 01 08 00 06 04 00 01 02 00 00 00 00 01 c0 a8 01 0a"
        ranges={[
          { start: 0, length: 6, label: 'Destination' },
          { start: 6, length: 6, label: 'Source' },
          { start: 12, length: 2, label: 'EtherType' },
        ]}
      />
    ),
  Ladder: (
      <Ladder
        caption="A TCP handshake whose last ACK is lost (RFC 9293, section 3.5)."
        parties={['Client', 'Server']}
        messages={[
          { from: 'Client', to: 'Server', label: 'SYN', note: 'seq=100' },
          { from: 'Server', to: 'Client', label: 'SYN, ACK', note: 'seq=300 ack=101' },
          { from: 'Client', to: 'Server', label: 'ACK', note: 'ack=301', lost: true },
          { from: 'Server', to: 'Client', label: 'SYN, ACK', note: 'again, after a timeout' },
          { from: 'Client', to: 'Server', label: 'ACK', note: 'ack=301' },
        ]}
      />
    ),
  Figure: (
      <Figure caption="Each layer wraps the one above it.">
        <div className="flex flex-col gap-1.5 p-5 font-mono text-sm">
          {['Ethernet', 'IPv4', 'UDP', 'DNS'].map((layer, i) => (
            <div
              key={layer}
              style={{ marginLeft: `${i * 1.5}rem` }}
              className="rounded-md border border-fd-primary/35 bg-fd-background px-3 py-2"
            >
              {layer}
            </div>
          ))}
        </div>
      </Figure>
    ),
  Task: (
      <Task>
        <p>Write a word counter. It works on any text, including empty text.</p>
        <Spec name="Count" kind="function">
          <p>
            Takes a string and returns how many words it holds. A word is a run of characters between whitespace. Never
            fails.
          </p>
        </Spec>
        <Spec name="ErrTooLong" kind="error">
          <p>
            Reported by <code>CountFile</code> when a line is over 64 KiB.
          </p>
        </Spec>
      </Task>
    ),
  Hints: (
      <Hints>
        <Hint>
          <p>What does your counter do with two spaces in a row?</p>
        </Hint>
        <Hint>
          <p>Count the starts of words, not the spaces between them.</p>
        </Hint>
        <Hint>
          <p>A word starts where a non-space follows a space, or at the very beginning.</p>
        </Hint>
      </Hints>
    ),
  Terminal: (
      <>
        <Terminal
          title="Run the tests"
          command="go test ./count"
          output={`--- FAIL: TestCount/two_spaces (0.00s)
    count_test.go:21: Count("a  b") = 3, want 2
FAIL
FAIL	example/count	0.003s`}
        />
        <Terminal command="go test ./count" output="ok  	example/count	0.002s" />
      </>
    ),
  DoneWhen: (
      <DoneWhen
        items={['go test ./count passes', 'Your count of Moby-Dick matches wc -w', 'Empty input gives 0, not an error']}
      />
    ),
  ShowOff: (
      <ShowOff title="Count a real book">
        <p>
          Download <em>Moby-Dick</em> from Project Gutenberg and count it. Compare your number with what{' '}
          <code>wc -w</code> says.
        </p>
      </ShowOff>
    ),
  Recap: (
      <Recap>
        <ul>
          <li>A word counter for any whitespace</li>
          <li>Line and byte counts</li>
          <li>Tests that pin it all down</li>
        </ul>
      </Recap>
    ),
  Reference: (
      <Reference>
        <ServerCodeBlock
          lang="go"
          themes={{ light: mintLight, dark: mintDark }}
          code={`// A placeholder: the book's real reference code goes here.
func Count(s string) int {
	return len(strings.Fields(s))
}`}
        />
      </Reference>
    ),
  Challenge: (
      <Challenge title="Count lines too">
        <p>
          Make your counter report lines and bytes as well, like <code>wc</code>.
        </p>
        <p>Then make it read from standard input when no file is given.</p>
      </Challenge>
    ),
  Deepening: (
      <Deepening title="What is a word, really?">
        <p>
          Unicode defines word boundaries in <Cite href="https://www.unicode.org/reports/tr29/">UAX #29</Cite>. Read it,
          and find three inputs where your counter and the standard disagree.
        </p>
      </Deepening>
    ),
  Kbd: (
      <p>
        Stop the capture with <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>.
      </p>
    ),
  Tokens: (
    <Tokens
      source="let total = price * 3;"
      tokens={[
        ['keyword', 'let'],
        ['ident', 'total'],
        ['op', '='],
        ['ident', 'price'],
        ['op', '*'],
        ['number', '3'],
        ['punct', ';'],
      ]}
      highlight={[4]}
    />
  ),
  Tree: (
    <>
      <Tree data="(let total (* price 3))" caption="The tree a parser builds for let total = price * 3." />
      <Tree data="(+ 1 !(* 2 3))" />
    </>
  ),
  Grammar: (
    <Grammar
      highlight={['term']}
      rules={`expr   = term { ("+" | "-") term } ;
term   = factor { ("*" | "/") factor } ;
factor = NUMBER | "(" expr ")" ;`}
    />
  ),
  Pipeline: (
    <Pipeline
      stages={[
        { name: 'Source', out: 'text' },
        { name: 'Lexer', out: 'tokens', highlight: true },
        { name: 'Parser', out: 'AST' },
        { name: 'Compiler', out: 'bytecode' },
        { name: 'VM', note: 'runs it' },
      ]}
    />
  ),
  Derivation: (
    <Derivation
      caption="A leftmost derivation of n + n."
      steps={['[E]', '[E] + T', '[T] + T', '[F] + T', 'n + [T]', 'n + [F]', 'n + n']}
      rules={['E → E + T', 'E → T', 'T → F', 'F → n', 'T → F', 'F → n']}
    />
  ),
  StateMachine: (
    <StateMachine
      caption="A DFA for strings over {a, b} that end in ab."
      states={[{ id: 'q0', initial: true }, { id: 'q1' }, { id: 'q2', accepting: true }]}
      transitions={[
        { from: 'q0', to: 'q0', label: 'b' },
        { from: 'q0', to: 'q1', label: 'a' },
        { from: 'q1', to: 'q1', label: 'a' },
        { from: 'q1', to: 'q2', label: 'b', highlight: true },
        { from: 'q2', to: 'q1', label: 'a' },
        { from: 'q2', to: 'q0', label: 'b' },
      ]}
    />
  ),
  Tape: (
    <Tape
      caption="A machine scanning right over its input."
      steps={[
        { tape: '_101_', head: 1, state: 'q0', note: 'start' },
        { tape: '_101_', head: 2, state: 'q0', note: 'q0, 1 → q0, 1, R' },
        { tape: '_101_', head: 3, state: 'q0', note: 'q0, 0 → q0, 0, R' },
      ]}
    />
  ),
  Register: (
    <Register
      name="GPIOA_MODER"
      address="0x4002_0000"
      reset="0xA800_0000"
      caption="GPIO port mode register of an STM32F4 (RM0090, section 8.4.1). MODER5 sets the mode of PA5."
      fields={Array.from({ length: 16 }, (_, i) => ({ name: `MODER${15 - i}`, bits: 2, access: 'rw', highlight: 15 - i === 5 }))}
    />
  ),
  MemoryMap: (
    <MemoryMap
      digits={4}
      gapLabel="not usable"
      caption="The Game Boy's address space (Pan Docs, Memory Map)."
      regions={[
        { name: 'ROM bank 00', start: '0x0000', end: '0x3FFF', note: 'fixed, from the cartridge' },
        { name: 'ROM bank 01–NN', start: '0x4000', end: '0x7FFF', note: 'switchable' },
        { name: 'VRAM', start: '0x8000', end: '0x9FFF', highlight: true },
        { name: 'External RAM', start: '0xA000', end: '0xBFFF' },
        { name: 'Work RAM', start: '0xC000', end: '0xDFFF' },
        { name: 'Echo RAM', start: '0xE000', end: '0xFDFF', note: 'mirror of C000–DDFF' },
        { name: 'OAM', start: '0xFE00', end: '0xFE9F', note: 'sprite attributes' },
        { name: 'I/O registers', start: '0xFF00', end: '0xFF7F' },
        { name: 'High RAM', start: '0xFF80', end: '0xFFFE' },
        { name: 'IE', start: '0xFFFF', end: '0xFFFF', note: 'interrupt enable' },
      ]}
    />
  ),
  Timing: (
    <Timing
      caption="One byte, 0xA6, sent over SPI in mode 0: data is sampled on each rising edge of SCK."
      ticks={['', '7', '6', '5', '4', '3', '2', '1', '0', '']}
      signals={[
        { name: 'CS', wave: '10.......1' },
        { name: 'SCK', wave: '0p.......0', highlight: true },
        { name: 'MOSI', wave: 'x========x', data: ['1', '0', '1', '0', '0', '1', '1', '0'] },
      ]}
    />
  ),
  Pinout: (
    <Pinout
      name="ATmega328P"
      caption="The ATmega328P in its 28-pin DIP (datasheet, section 1.1). PB5 drives the Arduino Uno's LED."
      pins={[
        { name: 'PC6', note: 'RESET' },
        { name: 'PD0', note: 'RXD' },
        { name: 'PD1', note: 'TXD' },
        'PD2',
        'PD3',
        'PD4',
        'VCC',
        'GND',
        { name: 'PB6', note: 'XTAL1' },
        { name: 'PB7', note: 'XTAL2' },
        'PD5',
        'PD6',
        'PD7',
        'PB0',
        'PB1',
        'PB2',
        { name: 'PB3', note: 'MOSI' },
        { name: 'PB4', note: 'MISO' },
        { name: 'PB5', note: 'SCK', highlight: true },
        'AVCC',
        'AREF',
        'GND',
        'PC0',
        'PC1',
        'PC2',
        'PC3',
        { name: 'PC4', note: 'SDA' },
        { name: 'PC5', note: 'SCL' },
      ]}
    />
  ),
  RegisterFile: (
    <RegisterFile
      caption="The Game Boy CPU's registers, with their values after the boot ROM (Pan Docs, Power Up Sequence)."
      rows={[
        [
          { name: 'A', bits: 8, value: '0x01', note: 'accumulator' },
          { name: 'F', bits: 8, value: '0xB0', note: 'flags Z N H C' },
        ],
        [
          { name: 'B', bits: 8, value: '0x00' },
          { name: 'C', bits: 8, value: '0x13' },
        ],
        [
          { name: 'D', bits: 8, value: '0x00' },
          { name: 'E', bits: 8, value: '0xD8' },
        ],
        [
          { name: 'H', bits: 8, value: '0x01' },
          { name: 'L', bits: 8, value: '0x4D' },
        ],
        [{ name: 'SP', bits: 16, value: '0xFFFE', note: 'stack pointer' }],
        [{ name: 'PC', bits: 16, value: '0x0100', note: 'program counter', highlight: true }],
      ]}
    />
  ),
  OpcodeTable: (
    <>
      <OpcodeTable
        caption="A few CHIP-8 instructions (Cowgod's Chip-8 Technical Reference, section 3.1)."
        ops={[
          { code: '00E0', name: 'CLS', effect: 'Clear the display.' },
          { code: '1NNN', name: 'JP addr', effect: 'Jump to address NNN.' },
          { code: '6XNN', name: 'LD Vx, NN', effect: 'Vx = NN.' },
          { code: '8XY4', name: 'ADD Vx, Vy', effect: 'Vx = Vx + Vy; VF = carry.', highlight: true },
          { code: 'DXYN', name: 'DRW Vx, Vy, N', effect: 'Draw an N-byte sprite at (Vx, Vy); VF = collision.' },
        ]}
      />
      <OpcodeTable
        layout="grid"
        caption="Part of the Game Boy's opcode map; only the opcodes listed are filled in."
        groups={{ misc: 'Control', load: 'Load', alu: 'Arithmetic and logic', jump: 'Jumps and calls' }}
        ops={[
          { code: '0x00', name: 'NOP', group: 'misc' },
          { code: '0x01', name: 'LD BC,n16', group: 'load' },
          { code: '0x3E', name: 'LD A,n8', group: 'load' },
          { code: '0x76', name: 'HALT', group: 'misc' },
          { code: '0x80', name: 'ADD A,B', group: 'alu', highlight: true },
          { code: '0xAF', name: 'XOR A,A', group: 'alu' },
          { code: '0xC3', name: 'JP a16', group: 'jump' },
          { code: '0xC9', name: 'RET', group: 'jump' },
          { code: '0xCD', name: 'CALL a16', group: 'jump' },
        ]}
      />
    </>
  ),
  Matrix: (
    <Matrix name="T =" rows={[[1, 0, 'tx'], [0, 1, 'ty'], [0, 0, 1]]} highlightColumns={[2]} caption="A 2D translation in homogeneous coordinates." />
  ),
  Plane: (
    <Plane
      shapes={[{ points: [[0.5, 0.5], [4, 1], [1.5, 4]], label: 'T' }]}
      points={[{ at: [3, 1.6], label: 'P', highlight: true }]}
      vectors={[{ from: [0.5, 0.5], to: [4, 1], label: 'e0' }]}
    />
  ),
  PixelGrid: (
    <PixelGrid
      centers
      caption="The pixels whose centers fall inside the triangle."
      overlay={[{ points: [[1.2, 6.6], [10.6, 1.4], [7.4, 7.6]] }]}
      pixels={['............', '..........#.', '.........#..', '.......###..', '.....####...', '...#####....', '.#######....', '............']}
    />
  ),
  Waveform: (
    <Waveform
      signals={[
        { wave: 'sine', label: 'sine, 1 Hz' },
        { wave: 'sine', freq: 1, stems: true, label: 'sampled at 12 Hz' },
      ]}
    />
  ),
  Math: (
    <>
      <p>
        A point is inside when all three edge functions agree in sign,{' '}
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString('E_0, E_1, E_2 \\ge 0') }} />:
      </p>
      <div
        className="my-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: katex.renderToString('E(P) = (b_x - a_x)(P_y - a_y) - (b_y - a_y)(P_x - a_x)', { displayMode: true }) }}
      />
    </>
  ),
  Spoiler: <Spoiler src="/components/antialiased.png" alt="A green triangle, antialiased" label="What your render should look like" />,
  ImageCompare: (
    <ImageCompare
      before="/components/aliased.png"
      after="/components/antialiased.png"
      beforeLabel="1 sample"
      afterLabel="16 samples"
      alt="a triangle rasterized at low resolution"
      pixelated
    />
  ),
};

export default function ComponentsPage() {
  const missing = catalog.filter((c) => !(c.name in demos)).map((c) => c.name);
  if (missing.length) throw new Error(`No demo for ${missing.join(', ')}`);

  return (
    <main className="flex-1">
      <section className="mint-grid border-b">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-12">
          <h1 className="font-display text-[clamp(2.75rem,8vw,5rem)] leading-none tracking-tight">Book components</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
            Everything a chapter&apos;s MDX can use, each shown in a chapter&apos;s own type and spacing, with its props and the
            MDX that makes it. Fumadocs&apos; <code className="font-mono text-base">Callout</code>,{' '}
            <code className="font-mono text-base">Cards</code>, <code className="font-mono text-base">Steps</code>,{' '}
            <code className="font-mono text-base">Tabs</code> and <code className="font-mono text-base">Accordions</code>{' '}
            work too.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav aria-label="Components" className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
          {groups.map((g) => (
            <div key={g} className="mb-4">
              <p className="mb-1 text-xs font-medium tracking-wide text-fd-foreground uppercase">{g}</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm lg:flex-col">
                {catalog
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <li key={c.name}>
                      <a href={`#${c.name}`} className="font-mono text-fd-muted-foreground hover:text-fd-primary">
                        {c.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          {groups.map((g) => (
            <div key={g}>
              <h2 className="mb-2 font-display text-3xl text-fd-foreground">{g}</h2>
              {catalog
                .filter((c) => c.group === g)
                .map((c) => (
                  <section key={c.name} id={c.name} className="scroll-mt-24 border-t border-fd-primary/25 pt-6 pb-14">
                    <h3 className="font-mono text-xl font-semibold text-fd-foreground">&lt;{c.name}&gt;</h3>
                    <p className="mt-1 max-w-2xl text-fd-muted-foreground">{c.purpose}</p>
                    <ul className="mt-3 flex max-w-2xl flex-wrap gap-1.5">
                      {c.props.map((prop) => (
                        <li key={prop} className="rounded-md bg-fd-muted px-2 py-0.5 font-mono text-xs text-fd-muted-foreground">
                          {prop}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 max-w-[46rem]">
                      <div className="prose book-body">{demos[c.name]}</div>
                      <div className="mt-6 [&_figure]:my-0">
                        <ServerCodeBlock lang="mdx" themes={{ light: mintLight, dark: mintDark }} code={c.usage} />
                      </div>
                    </div>
                  </section>
                ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
