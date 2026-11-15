// The book components, as data: what each is for, its props and an MDX example.
// The showcase at /components, Fumadocs Studio's insert menu and CATALOG.md (`just catalog`,
// read by writing agents) are all built from this list. Keep it in step with the components.
// Plain data only (no JSX, no imports) so a script can read it.

export interface CatalogEntry {
  name: string;
  group: (typeof groups)[number];
  purpose: string;
  props: string[];
  usage: string;
  /** Used in running text, not as a block: left out of Fumadocs Studio's insert menu. */
  inline?: boolean;
  /** How Fumadocs Studio edits it. */
  studio?: {
    /** Words to find it by in Studio's / menu, shown after the name: "Timing · timing diagram, clock, …". */
    keywords?: string;
    /** It takes block children, edited in place; the text is the placeholder. */
    children?: string;
    /** Its children are this component, repeated (Hints → Hint). */
    childComponent?: string;
    /** Props a fresh insert starts with, so the preview has something to show. */
    starter?: Record<string, unknown>;
  };
}

export const groups = [
  'Writing',
  'Section structure',
  'Bytes and protocols',
  'Languages',
  'Theory',
  'Embedded and hardware',
  'Graphics and math',
  'Media',
] as const;

export const catalog: CatalogEntry[] = [
  {
    name: 'Idea',
    group: 'Writing',
    purpose: 'The one idea a section rests on, said once and large.',
    props: ["children: the idea, one or two sentences"],
    usage: `<Idea>
  A layer only talks to the layers right above and below it.
</Idea>`,
    studio: { keywords: 'key idea, big statement', children: 'The one idea this section rests on…' },
  },
  {
    name: 'Aside',
    group: 'Writing',
    purpose: 'A side remark. type is note (default), tip or warning; title is optional.',
    props: ["type?: 'note' | 'tip' | 'warning' (default note)", "title?: string", "children"],
    usage: `<Aside type="warning" title="Byte order">
  Multi-byte fields go over the wire **big-endian**, whatever your CPU uses.
</Aside>`,
    studio: { keywords: 'note, tip, warning, callout', children: 'A side remark…', starter: { type: 'note', title: 'Title' } },
  },
  {
    name: 'Cite',
    group: 'Writing',
    purpose: 'An inline pointer to the source of a claim.',
    props: ["href: URL of the source", "children: the source, e.g. \"RFC 791 §3.1\""],
    usage: `Every IPv4 header starts with its version <Cite href="https://www.rfc-editor.org/rfc/rfc791#section-3.1">RFC 791 §3.1</Cite>.`,
    inline: true,
  },
  {
    name: 'Term',
    group: 'Writing',
    purpose: 'A word with its definition on hover or keyboard focus.',
    props: ["def: the definition", "children: the word"],
    usage: `Each hop lowers the <Term def="Time to Live: how many more routers may pass the packet on.">TTL</Term> by one.`,
    inline: true,
  },
  {
    name: 'Check',
    group: 'Writing',
    purpose: 'A self-check: answer it in your head, then open the answer, written on the paper underneath.',
    props: ["question", "children: the answer"],
    usage: `<Check question="Two hosts on the same switch: does a frame between them pass through your router?">
  No. The switch forwards it by MAC address, straight from one port to the other.
</Check>`,
    studio: { keywords: 'self-check, question, quiz, answer', children: 'The answer…', starter: { question: 'The question?' } },
  },
  {
    name: 'Bitfield',
    group: 'Bytes and protocols',
    purpose: 'A header laid out bit by bit, RFC style. width defaults to 32; bits can be "variable"; highlight marks the field the text is about.',
    props: ["fields: { name, bits: number | 'variable', highlight? }[]", "width? (default 32)", "caption?"],
    usage: `<Bitfield
  caption="The IPv4 header (RFC 791, section 3.1)."
  fields={[
    { name: 'Version', bits: 4 },
    { name: 'IHL', bits: 4 },
    ...
    { name: 'Time to Live', bits: 8, highlight: true },
    ...
    { name: 'Options', bits: 'variable' },
  ]}
/>`,
    studio: { keywords: 'header diagram, bits, packet layout, RFC', starter: { fields: [{ name: 'Version', bits: 4 }, { name: 'Length', bits: 12 }, { name: 'Checksum', bits: 16 }] } },
  },
  {
    name: 'HexDump',
    group: 'Bytes and protocols',
    purpose: 'Bytes as a hex dump with labelled ranges. Point at a byte or a label to pick out its range.',
    props: ["bytes: hex string, whitespace ignored", "ranges?: { start, length, label }[]", "columns? (default 16)"],
    usage: `<HexDump
  bytes="ff ff ff ff ff ff  02 00 00 00 00 01  08 06  00 01 08 00 06 04 00 01"
  ranges={[
    { start: 0, length: 6, label: 'Destination' },
    { start: 6, length: 6, label: 'Source' },
    { start: 12, length: 2, label: 'EtherType' },
  ]}
/>`,
    studio: { keywords: 'hex, bytes, dump, packet', starter: { bytes: '45 00 00 54', ranges: [{ start: 0, length: 1, label: 'Version and IHL' }] } },
  },
  {
    name: 'Ladder',
    group: 'Bytes and protocols',
    purpose: 'Who sends what to whom, time running down. lost draws a message that never arrives.',
    props: ["parties: string[]", "messages: { from, to, label, note?, lost? }[]", "caption?"],
    usage: `<Ladder
  parties={['Client', 'Server']}
  messages={[
    { from: 'Client', to: 'Server', label: 'SYN', note: 'seq=100' },
    { from: 'Server', to: 'Client', label: 'SYN, ACK', note: 'seq=300 ack=101' },
    { from: 'Client', to: 'Server', label: 'ACK', lost: true },
    { from: 'Server', to: 'Client', label: 'SYN, ACK', note: 'again, after a timeout' },
  ]}
/>`,
    studio: { keywords: 'sequence diagram, messages, handshake, protocol', starter: { parties: ['Client', 'Server'], messages: [{ from: 'Client', to: 'Server', label: 'Hello' }] } },
  },
  {
    name: 'Figure',
    group: 'Writing',
    purpose: 'An image (src, alt) or any diagram as children, with a caption.',
    props: ["src?: image path", "alt?", "caption?", "children?: any diagram instead of src"],
    usage: `<Figure src="/diagrams/layers.svg" alt="The four layers" caption="Each layer wraps the one above it." />`,
    studio: { keywords: 'image, picture, diagram, caption', starter: { src: '/images/diagram.svg', alt: '', caption: 'Caption.' } },
  },
  {
    name: 'Task',
    group: 'Section structure',
    purpose: 'What to build next, in prose. Holds the Spec entries for the section.',
    props: ["title? (default \"What to build\")", "children: prose and <Spec name kind?> entries"],
    usage: `<Task>
  Write a word counter. It works on any text, including empty text.

  <Spec name="Count" kind="function">
    Takes a string and returns how many words it holds. A word is a run
    of characters between whitespace. Never fails.
  </Spec>
  <Spec name="ErrTooLong" kind="error">
    Reported by \`CountFile\` when a line is over 64 KiB.
  </Spec>
</Task>`,
    studio: { keywords: 'what to build, spec, assignment', children: 'What to build, in prose, then <Spec> entries…' },
  },
  {
    name: 'Hints',
    group: 'Section structure',
    purpose: 'Tiered hints, revealed one at a time, smallest nudge first.',
    props: ["children: <Hint> entries, smallest nudge first"],
    usage: `<Hints>
  <Hint>What does your counter do with two spaces in a row?</Hint>
  <Hint>Count the starts of words, not the spaces between them.</Hint>
  <Hint>A word starts where a non-space follows a space, or at the very beginning.</Hint>
</Hints>`,
    studio: { keywords: 'hints, help, nudge, stuck', childComponent: 'Hint' },
  },
  {
    name: 'Terminal',
    group: 'Section structure',
    purpose: 'A command and what it prints. ok/PASS lines turn green, FAIL/panic lines amber.',
    props: ["command", "output?: what it prints", "title?"],
    usage: `<Terminal
  title="Run the tests"
  command="go test ./count"
  output={\`--- FAIL: TestCount/two_spaces (0.00s)
    count_test.go:21: Count("a  b") = 3, want 2
FAIL
FAIL	example/count	0.003s\`}
/>`,
    studio: { keywords: 'command, shell, test output, console', starter: { command: 'go test ./...', output: 'ok' } },
  },
  {
    name: 'DoneWhen',
    group: 'Section structure',
    purpose: "The checks that say a section is finished. Ticks are remembered in the reader's browser.",
    props: ["items: string[]", "title? (default \"You're done when\")"],
    usage: `<DoneWhen
  items={[
    'go test ./count passes',
    'Your count of Moby-Dick matches wc -w',
    'Empty input gives 0, not an error',
  ]}
/>`,
    studio: { keywords: 'checklist, done, finished', starter: { items: ['The tests pass'] } },
  },
  {
    name: 'ShowOff',
    group: 'Section structure',
    purpose: "The moment the code meets the real world. The book's paper at full strength; the loudest block in a chapter.",
    props: ["title? (default \"Show it off\")", "children"],
    usage: `<ShowOff title="Count a real book">
  Download *Moby-Dick* from Project Gutenberg and count it. Compare with \`wc -w\`.
</ShowOff>`,
    studio: { keywords: 'show it off, real world, demo', children: 'Where the code meets the real world…', starter: { title: 'Show it off' } },
  },
  {
    name: 'Recap',
    group: 'Section structure',
    purpose: 'What the reader has now, at the end of a chapter. Write a Markdown list inside; every line gets a tick.',
    props: ["title? (default \"What you have now\")", "children: a Markdown list"],
    usage: `<Recap>
  - A word counter that handles any whitespace
  - Line and byte counts
  - Tests that pin it all down
</Recap>`,
    studio: { keywords: 'summary, recap, what you have now', children: '- What the reader has now' },
  },
  {
    name: 'Reference',
    group: 'Section structure',
    purpose: "The chapter's reference implementation, folded away. title and note are optional.",
    props: ["title?", "note?", "children: a code block"],
    usage: `<Reference>
  \`\`\`go
  ...
  \`\`\`
</Reference>`,
    studio: { keywords: 'reference code, solution, collapsed code', children: 'The reference code block…' },
  },
  {
    name: 'Challenge',
    group: 'Section structure',
    purpose: 'An optional extra: something to build with what you know now. A dashed outline, a sketch to fill in.',
    props: ["title", "children"],
    usage: `<Challenge title="Count lines too">
  Make your counter report lines and bytes as well, like \`wc\`.
  Then make it read from standard input when no file is given.
</Challenge>`,
    studio: { keywords: 'challenge, extra, exercise', children: 'Something to build with what you know now…', starter: { title: 'Title' } },
  },
  {
    name: 'Deepening',
    group: 'Section structure',
    purpose: 'An optional extra: a way to dig further into how the real thing does it. Finer paper, with more sheets underneath.',
    props: ["title", "children"],
    usage: `<Deepening title="What is a word, really?">
  Unicode defines word boundaries in UAX #29. Read it, and find three
  inputs where your counter and the standard disagree.
</Deepening>`,
    studio: { keywords: 'deepening, go further, extra reading', children: 'How the real thing does it…', starter: { title: 'Title' } },
  },
  {
    name: 'Kbd',
    group: 'Writing',
    purpose: 'A key to press.',
    props: ["children: the key"],
    usage: `Stop the capture with <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>.`,
    inline: true,
  },
  {
    name: 'Tokens',
    group: 'Languages',
    purpose: 'A line of source cut into tokens, each with its kind under it. Kinds get a color each; highlight picks tokens by index.',
    props: ['tokens: [kind, text][]', 'source?: the line they came from', 'highlight?: number[] (token indices)', 'caption?'],
    usage: `<Tokens
  source="let total = price * 3;"
  tokens={[
    ['keyword', 'let'], ['ident', 'total'], ['op', '='],
    ['ident', 'price'], ['op', '*'], ['number', '3'], ['punct', ';'],
  ]}
  highlight={[4]}
/>`,
    studio: { keywords: 'lexer, tokens, source code, syntax', starter: { tokens: [['keyword', 'let'], ['ident', 'x'], ['op', '='], ['number', '1']] } },
  },
  {
    name: 'Tree',
    group: 'Languages',
    purpose: 'A tree drawn top-down, written as an S-expression: ASTs, B-trees, scene graphs. A leading ! highlights a node; quote labels with spaces.',
    props: ['data: S-expression string, e.g. "(+ 1 !(* 2 3))", or { label, children?, highlight? }', 'caption?'],
    usage: `<Tree data='(let total (* price 3))' caption="The tree a parser builds for let total = price * 3." />

<Tree data='(+ 1 !(* 2 3))' />`,
    studio: { keywords: 'tree diagram, AST, syntax tree, B-tree, graph', starter: { data: '(+ 1 (* 2 3))' } },
  },
  {
    name: 'Grammar',
    group: 'Languages',
    purpose: 'BNF or EBNF rules, one per line. Nonterminals link to their rule, quoted terminals stand out; highlight picks rules by name.',
    props: ['rules: string, one `name = body ;` (or ::=, →) per line; lines starting with | continue a rule', 'highlight?: string[] (rule names)', 'id?: anchor prefix, for two grammars on a page', 'caption?'],
    usage: `<Grammar
  highlight={['term']}
  rules={\`expr   = term { ("+" | "-") term } ;
term   = factor { ("*" | "/") factor } ;
factor = NUMBER | "(" expr ")" ;\`}
/>`,
    studio: { keywords: 'grammar, BNF, EBNF, syntax rules, parser', starter: { rules: 'expr = term { "+" term } ;\nterm = NUMBER ;' } },
  },
  {
    name: 'Pipeline',
    group: 'Languages',
    purpose: 'Stages in a row and what flows between them. Wraps on narrow screens.',
    props: ['stages: { name, note?, out?: label on the arrow after it, highlight? }[]', 'caption?'],
    usage: `<Pipeline
  stages={[
    { name: 'Source', out: 'text' },
    { name: 'Lexer', out: 'tokens', highlight: true },
    { name: 'Parser', out: 'AST' },
    { name: 'Compiler', out: 'bytecode' },
    { name: 'VM', note: 'runs it' },
  ]}
/>`,
    studio: { keywords: 'pipeline diagram, stages, flow, compiler', starter: { stages: [{ name: 'Input', out: 'data' }, { name: 'Stage' }] } },
  },
  {
    name: 'Derivation',
    group: 'Theory',
    purpose: 'A derivation, one sentential form per line. Brackets mark the symbol rewritten next; rules name the rule used at each step.',
    props: ['steps: string[], e.g. "[E] + T"', 'rules?: string[] (one fewer than steps)', 'caption?'],
    usage: `<Derivation
  steps={['[E]', '[E] + T', '[T] + T', '[F] + T', 'n + [T]', 'n + [F]', 'n + n']}
  rules={['E → E + T', 'E → T', 'T → F', 'F → n', 'T → F', 'F → n']}
/>`,
    studio: { keywords: 'derivation, grammar, rewriting, formal languages', starter: { steps: ['[S]', 'a[S]b', 'ab'], rules: ['S → aSb', 'S → ε'] } },
  },
  {
    name: 'StateMachine',
    group: 'Theory',
    purpose: 'States in a row, transitions as arcs: right-going above, left-going below, self-loops on top. initial and accepting for automata.',
    props: ['states: { id, label?, initial?, accepting?, highlight? }[] (drawn in this order)', 'transitions: { from, to, label, highlight? }[]', 'caption?'],
    usage: `<StateMachine
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
/>`,
    studio: { keywords: 'state machine diagram, automaton, DFA, NFA, FSM', starter: { states: [{ id: 'q0', initial: true }, { id: 'q1', accepting: true }], transitions: [{ from: 'q0', to: 'q1', label: 'a' }] } },
  },
  {
    name: 'Tape',
    group: 'Theory',
    purpose: "A Turing machine's tape, the head over one cell with the state on it. One tape, or steps for a run. _ is a blank cell.",
    props: ['tape?: string, one symbol per character', 'head?: cell index', 'state?', 'steps?: { tape, head, state?, note? }[]', "blank? (default '_')", 'caption?'],
    usage: `<Tape
  steps={[
    { tape: '_101_', head: 1, state: 'q0', note: 'start' },
    { tape: '_101_', head: 2, state: 'q0', note: 'q0, 1 → q0, 1, R' },
    { tape: '_101_', head: 3, state: 'q0', note: 'q0, 0 → q0, 0, R' },
  ]}
/>`,
    studio: { keywords: 'Turing machine, tape, head, computation', starter: { tape: '_101_', head: 1, state: 'q0' } },
  },
  {
    name: 'Register',
    group: 'Embedded and hardware',
    purpose: 'A memory-mapped register as a datasheet draws it: bit numbers counting down, access per field, reset value bit by bit. Fields most significant first.',
    props: ['name', 'address?', 'reset?: e.g. "0xA800_0000"', 'fields: { name?, bits, access?, reserved?, highlight? }[] (MSB first, must sum to width)', 'width? (default 32)', 'row? bits per row (default 16)', 'caption?'],
    usage: `<Register
  name="GPIOA_MODER"
  address="0x4002_0000"
  reset="0xA800_0000"
  fields={[
    { name: 'MODER15', bits: 2, access: 'rw' },
    ...
    { name: 'MODER5', bits: 2, access: 'rw', highlight: true },
    ...
    { name: 'MODER0', bits: 2, access: 'rw' },
  ]}
/>`,
    studio: { keywords: 'register diagram, bits, datasheet, peripheral, MMIO', starter: { name: 'CTRL', address: '0x00', reset: '0x00', width: 8, row: 8, fields: [{ name: 'EN', bits: 1, access: 'rw' }, { reserved: true, bits: 7 }] } },
  },
  {
    name: 'MemoryMap',
    group: 'Embedded and hardware',
    purpose: 'An address space as stacked regions, high addresses on top. Not to scale; each row shows its range and size. Holes are drawn and labelled.',
    props: ['regions: { name, start, end (inclusive), note?, highlight? }[]', 'digits? hex digits per address (default 8)', "gapLabel? (default 'unmapped')", 'caption?'],
    usage: `<MemoryMap
  digits={4}
  gapLabel="not usable"
  regions={[
    { name: 'ROM bank 00', start: '0x0000', end: '0x3FFF' },
    { name: 'VRAM', start: '0x8000', end: '0x9FFF', highlight: true },
    { name: 'OAM', start: '0xFE00', end: '0xFE9F', note: 'sprite attributes' },
    ...
  ]}
/>`,
    studio: { keywords: 'memory map, address space, flash, RAM', starter: { regions: [{ name: 'Flash', start: '0x0800_0000', end: '0x080F_FFFF' }, { name: 'SRAM', start: '0x2000_0000', end: '0x2001_FFFF' }] } },
  },
  {
    name: 'Timing',
    group: 'Embedded and hardware',
    purpose: 'A digital timing diagram, WaveDrom-style: one character per period. p/n clock, 0/1 level, = data, x unknown, z high-Z, . repeat.',
    props: ['signals: { name, wave, data?: string[] (labels for = periods), highlight? }[]', 'ticks?: string[] (labels under periods)', 'caption?'],
    usage: `<Timing
  ticks={['', '7', '6', '5', '4', '3', '2', '1', '0', '']}
  signals={[
    { name: 'CS', wave: '10.......1' },
    { name: 'SCK', wave: '0p.......0', highlight: true },
    { name: 'MOSI', wave: 'x========x', data: ['1', '0', '1', '0', '0', '1', '1', '0'] },
  ]}
/>`,
    studio: { keywords: 'timing diagram, clock, signal, SPI, I2C, waveform', starter: { signals: [{ name: 'CLK', wave: 'p.......' }, { name: 'DATA', wave: 'x=.=.=.x', data: ['A', 'B', 'C'] }] } },
  },
  {
    name: 'Pinout',
    group: 'Embedded and hardware',
    purpose: 'A chip or board with labelled pins. pins in package order lay out like a DIP; or give left and right for two headers.',
    props: ['name?: printed on the chip', "pins?: (string | { name, note?, highlight? })[] in package order", 'left?, right?: the same, each top to bottom', 'caption?'],
    usage: `<Pinout
  name="ATmega328P"
  pins={[
    { name: 'PC6', note: 'RESET' }, { name: 'PD0', note: 'RXD' }, { name: 'PD1', note: 'TXD' },
    ...
    { name: 'PB5', note: 'SCK', highlight: true },
    ...
  ]}
/>`,
    studio: { keywords: 'pinout diagram, pins, chip, microcontroller, GPIO', starter: { name: 'Chip', pins: ['VCC', 'A0', 'A1', 'GND'] } },
  },
  {
    name: 'RegisterFile',
    group: 'Embedded and hardware',
    purpose: "A CPU's registers, one row per group: paired 8-bit registers side by side, 16-bit ones full width.",
    props: ['rows: { name, bits, value?, note?, highlight? }[][]', 'caption?'],
    usage: `<RegisterFile
  rows={[
    [{ name: 'A', bits: 8, value: '0x01', note: 'accumulator' }, { name: 'F', bits: 8, value: '0xB0', note: 'flags Z N H C' }],
    [{ name: 'B', bits: 8, value: '0x00' }, { name: 'C', bits: 8, value: '0x13' }],
    [{ name: 'SP', bits: 16, value: '0xFFFE' }],
    [{ name: 'PC', bits: 16, value: '0x0100', highlight: true }],
  ]}
/>`,
    studio: { keywords: 'CPU registers, emulator, register file', starter: { rows: [[{ name: 'A', bits: 8 }, { name: 'F', bits: 8 }], [{ name: 'PC', bits: 16 }]] } },
  },
  {
    name: 'OpcodeTable',
    group: 'Embedded and hardware',
    purpose: 'An instruction set. list: pattern, mnemonic, effect, with operand letters in color (CHIP-8). grid: a 16×16 opcode map colored by group (Game Boy, 6502).',
    props: ["ops: { code, name, effect?, group?, highlight? }[]", "layout?: 'list' | 'grid' (default list)", 'groups?: { key: label } for the grid legend', 'caption?'],
    usage: `<OpcodeTable
  ops={[
    { code: '00E0', name: 'CLS', effect: 'Clear the display.' },
    { code: '6XNN', name: 'LD Vx, NN', effect: 'Vx = NN.' },
    { code: '8XY4', name: 'ADD Vx, Vy', effect: 'Vx = Vx + Vy; VF = carry.', highlight: true },
  ]}
/>

<OpcodeTable layout="grid" groups={{ load: 'Load', alu: 'Arithmetic' }} ops={[{ code: '0x3E', name: 'LD A,n8', group: 'load' }, ...]} />`,
    studio: { keywords: 'opcodes, instruction set, ISA, emulator, CPU', starter: { ops: [{ code: '00E0', name: 'CLS', effect: 'Clear the display.' }] } },
  },
  {
    name: 'Matrix',
    group: 'Graphics and math',
    purpose: 'A matrix in brackets with optional row and column labels and highlighted cells, rows or columns.',
    props: ['rows: (string | number)[][]', 'name?: written before it, e.g. "T ="', 'rowLabels?, columnLabels?: string[]', 'highlight?: [row, col][]', 'highlightRows?, highlightColumns?: number[]', 'caption?'],
    usage: `<Matrix
  name="T ="
  rows={[[1, 0, 'tx'], [0, 1, 'ty'], [0, 0, 1]]}
  highlightColumns={[2]}
  caption="A 2D translation in homogeneous coordinates."
/>`,
    studio: { keywords: 'matrix, transform, linear algebra, math', starter: { rows: [[1, 0], [0, 1]] } },
  },
  {
    name: 'Plane',
    group: 'Graphics and math',
    purpose: 'A 2D coordinate plane with points, vectors and polygons. yDown flips y for screen and pixel coordinates.',
    props: ['x?, y?: [min, max] (default [-1, 5])', 'step? grid spacing', 'yDown?', 'points?: { at: [x, y], label?, highlight? }[]', 'vectors?: { from?, to, label?, highlight? }[]', 'shapes?: { points: [x, y][], label?, closed?, highlight? }[]', 'caption?'],
    usage: `<Plane
  shapes={[{ points: [[0.5, 0.5], [4, 1], [1.5, 4]], label: 'T' }]}
  points={[{ at: [3, 1.6], label: 'P', highlight: true }]}
  vectors={[{ from: [0.5, 0.5], to: [4, 1], label: 'e0' }]}
/>`,
    studio: { keywords: '2D plot, coordinates, vectors, triangle, geometry, graph', starter: { points: [{ at: [1, 2], label: 'P' }] } },
  },
  {
    name: 'PixelGrid',
    group: 'Graphics and math',
    purpose: 'A small framebuffer, one character per pixel: . empty, # accent, o second series, + ink, - faint. overlay draws polygons in pixel coordinates.',
    props: ['pixels: string[] (one string per row)', 'palette?: { char: CSS color }', 'ruler? (default true)', 'centers?: dot every pixel center', 'overlay?: { points: [x, y][], label? }[]', 'caption?'],
    usage: `<PixelGrid
  centers
  overlay={[{ points: [[1.2, 6.6], [10.6, 1.4], [7.4, 7.6]] }]}
  pixels={[
    '............',
    '..........#.',
    '.........#..',
    ...
  ]}
/>`,
    studio: { keywords: 'pixels, framebuffer, rasterizer, image, grid', starter: { pixels: ['..#..', '.###.', '#####'] } },
  },
  {
    name: 'Waveform',
    group: 'Graphics and math',
    purpose: 'Signals over time: textbook waves or precomputed samples, as lines or stems. Oscillators, aliasing, filters.',
    props: ["signals: { wave?: 'sine' | 'square' | 'saw' | 'triangle', freq?, amp?, phase? (cycles), samples?: number[], stems?, label? }[]", 'duration? (default 2)', "unit? (default 's')", 'caption?'],
    usage: `<Waveform
  signals={[
    { wave: 'sine', label: 'sine, 1 Hz' },
    { wave: 'sine', freq: 1, stems: true, label: 'sampled at 12 Hz' },
  ]}
/>`,
    studio: { keywords: 'waveform, signal, audio, DSP, sine, plot, graph', starter: { signals: [{ wave: 'sine' }] } },
  },
  {
    name: 'Math',
    group: 'Graphics and math',
    purpose: 'Math typeset by KaTeX: $…$ inline, $$…$$ on its own lines. Not a component: plain MDX syntax.',
    props: ['$inline$', '$$ display $$ (on their own lines)'],
    usage: `A point is inside when all three edge functions agree in sign, $E_0, E_1, E_2 \\ge 0$:

$$
E(P) = (b_x - a_x)(P_y - a_y) - (b_y - a_y)(P_x - a_x)
$$`,
    inline: true,
  },
  {
    name: 'Spoiler',
    group: 'Media',
    purpose: 'Hides an image (or any children) behind a blur and a crossed-out eye until the reader clicks. It can be hidden again.',
    props: ['src?: image path', 'alt?', "label? (default 'Click to reveal')", 'caption?', 'children?: any content instead of src'],
    usage: `<Spoiler src="/images/expected-render.png" alt="The triangle, antialiased" label="What your render should look like" />`,
    studio: { keywords: 'spoiler, hide, blur, reveal, answer, image', starter: { src: '/images/answer.png', alt: '' } },
  },
  {
    name: 'ImageCompare',
    group: 'Media',
    purpose: 'Two images of the same size with a bar to slide between them. Drag on the image, or focus it and use the arrow keys.',
    props: ['before, after: image paths', "beforeLabel?, afterLabel? (default 'Before', 'After')", 'alt?', 'start? percent (default 50)', 'pixelated?: keep pixels crisp', 'caption?'],
    usage: `<ImageCompare
  before="/images/aliased.png"
  after="/images/antialiased.png"
  beforeLabel="1 sample"
  afterLabel="16 samples"
  pixelated
/>`,
    studio: { keywords: 'image comparison, before after, slider, compare', starter: { before: '/images/before.png', after: '/images/after.png' } },
  },
];
