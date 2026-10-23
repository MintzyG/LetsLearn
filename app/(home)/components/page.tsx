import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import {
  Aside,
  Bitfield,
  Challenge,
  Check,
  Cite,
  Deepening,
  DoneWhen,
  Figure,
  HexDump,
  Hint,
  Hints,
  Idea,
  Kbd,
  Ladder,
  Recap,
  Reference,
  ShowOff,
  Spec,
  Task,
  Term,
  Terminal,
} from '@/components/book';
import { mintDark, mintLight } from '@/lib/code-themes';

// The component showcase.
// The examples are made up or plain facts from public specs; none of them is a book's answer.

export const metadata: Metadata = { title: 'Book components' };

interface Specimen {
  name: string;
  purpose: string;
  usage: string;
  demo: ReactNode;
}

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

const specimens: Specimen[] = [
  {
    name: 'Idea',
    purpose: 'The one idea a section rests on, said once and large.',
    usage: `<Idea>
  A layer only talks to the layers right above and below it.
</Idea>`,
    demo: <Idea>A layer only talks to the layers right above and below it.</Idea>,
  },
  {
    name: 'Aside',
    purpose: 'A side remark. type is note (default), tip or warning; title is optional.',
    usage: `<Aside type="warning" title="Byte order">
  Multi-byte fields go over the wire **big-endian**, whatever your CPU uses.
</Aside>`,
    demo: (
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
  },
  {
    name: 'Cite',
    purpose: 'An inline pointer to the source of a claim.',
    usage: `Every IPv4 header starts with its version <Cite href="https://www.rfc-editor.org/rfc/rfc791#section-3.1">RFC 791 §3.1</Cite>.`,
    demo: (
      <p>
        Every IPv4 header starts with its version{' '}
        <Cite href="https://www.rfc-editor.org/rfc/rfc791#section-3.1">RFC 791 §3.1</Cite>.
      </p>
    ),
  },
  {
    name: 'Term',
    purpose: 'A word with its definition on hover or keyboard focus.',
    usage: `Each hop lowers the <Term def="Time to Live: how many more routers may pass the packet on.">TTL</Term> by one.`,
    demo: (
      <p>
        Each hop lowers the <Term def="Time to Live: how many more routers may pass the packet on.">TTL</Term> by one.
      </p>
    ),
  },
  {
    name: 'Check',
    purpose: 'A self-check: answer it in your head, then open the answer, written on the paper underneath.',
    usage: `<Check question="Two hosts on the same switch: does a frame between them pass through your router?">
  No. The switch forwards it by MAC address, straight from one port to the other.
</Check>`,
    demo: (
      <Check question="Two hosts on the same switch: does a frame between them pass through your router?">
        <p>No. The switch forwards it by MAC address, straight from one port to the other. The router only sees frames addressed to it.</p>
      </Check>
    ),
  },
  {
    name: 'Bitfield',
    purpose:
      'A header laid out bit by bit, RFC style. width defaults to 32; bits can be "variable"; highlight marks the field the text is about.',
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
    demo: <Bitfield caption="The IPv4 header (RFC 791, section 3.1)." fields={ipv4} />,
  },
  {
    name: 'HexDump',
    purpose: 'Bytes as a hex dump with labelled ranges. Point at a byte or a label to pick out its range.',
    usage: `<HexDump
  bytes="ff ff ff ff ff ff  02 00 00 00 00 01  08 06  00 01 08 00 06 04 00 01"
  ranges={[
    { start: 0, length: 6, label: 'Destination' },
    { start: 6, length: 6, label: 'Source' },
    { start: 12, length: 2, label: 'EtherType' },
  ]}
/>`,
    demo: (
      <HexDump
        bytes="ff ff ff ff ff ff 02 00 00 00 00 01 08 06 00 01 08 00 06 04 00 01 02 00 00 00 00 01 c0 a8 01 0a"
        ranges={[
          { start: 0, length: 6, label: 'Destination' },
          { start: 6, length: 6, label: 'Source' },
          { start: 12, length: 2, label: 'EtherType' },
        ]}
      />
    ),
  },
  {
    name: 'Ladder',
    purpose: 'Who sends what to whom, time running down. lost draws a message that never arrives.',
    usage: `<Ladder
  parties={['Client', 'Server']}
  messages={[
    { from: 'Client', to: 'Server', label: 'SYN', note: 'seq=100' },
    { from: 'Server', to: 'Client', label: 'SYN, ACK', note: 'seq=300 ack=101' },
    { from: 'Client', to: 'Server', label: 'ACK', lost: true },
    { from: 'Server', to: 'Client', label: 'SYN, ACK', note: 'again, after a timeout' },
  ]}
/>`,
    demo: (
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
  },
  {
    name: 'Figure',
    purpose: 'An image (src, alt) or any diagram as children, with a caption.',
    usage: `<Figure src="/diagrams/layers.svg" alt="The four layers" caption="Each layer wraps the one above it." />`,
    demo: (
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
  },
  {
    name: 'Task',
    purpose: 'What to build next, in prose. Holds the Spec entries for the section.',
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
    demo: (
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
  },
  {
    name: 'Hints',
    purpose: 'Tiered hints, revealed one at a time, smallest nudge first.',
    usage: `<Hints>
  <Hint>What does your counter do with two spaces in a row?</Hint>
  <Hint>Count the starts of words, not the spaces between them.</Hint>
  <Hint>A word starts where a non-space follows a space, or at the very beginning.</Hint>
</Hints>`,
    demo: (
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
  },
  {
    name: 'Terminal',
    purpose: 'A command and what it prints. ok/PASS lines turn green, FAIL/panic lines amber.',
    usage: `<Terminal
  title="Run the tests"
  command="go test ./count"
  output={\`--- FAIL: TestCount/two_spaces (0.00s)
    count_test.go:21: Count("a  b") = 3, want 2
FAIL
FAIL	example/count	0.003s\`}
/>`,
    demo: (
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
  },
  {
    name: 'DoneWhen',
    purpose: "The checks that say a section is finished. Ticks are remembered in the reader's browser.",
    usage: `<DoneWhen
  items={[
    'go test ./count passes',
    'Your count of Moby-Dick matches wc -w',
    'Empty input gives 0, not an error',
  ]}
/>`,
    demo: (
      <DoneWhen
        items={['go test ./count passes', 'Your count of Moby-Dick matches wc -w', 'Empty input gives 0, not an error']}
      />
    ),
  },
  {
    name: 'ShowOff',
    purpose: "The moment the code meets the real world. The book's paper at full strength; the loudest block in a chapter.",
    usage: `<ShowOff title="Count a real book">
  Download *Moby-Dick* from Project Gutenberg and count it. Compare with \`wc -w\`.
</ShowOff>`,
    demo: (
      <ShowOff title="Count a real book">
        <p>
          Download <em>Moby-Dick</em> from Project Gutenberg and count it. Compare your number with what{' '}
          <code>wc -w</code> says.
        </p>
      </ShowOff>
    ),
  },
  {
    name: 'Recap',
    purpose: 'What the reader has now, at the end of a chapter. Write a Markdown list inside; every line gets a tick.',
    usage: `<Recap>
  - A word counter that handles any whitespace
  - Line and byte counts
  - Tests that pin it all down
</Recap>`,
    demo: (
      <Recap>
        <ul>
          <li>A word counter for any whitespace</li>
          <li>Line and byte counts</li>
          <li>Tests that pin it all down</li>
        </ul>
      </Recap>
    ),
  },
  {
    name: 'Reference',
    purpose: "The chapter's reference implementation, folded away. title and note are optional.",
    usage: `<Reference>
  \`\`\`go
  ...
  \`\`\`
</Reference>`,
    demo: (
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
  },
  {
    name: 'Challenge',
    purpose: 'An optional extra: something to build with what you know now. A dashed outline, a sketch to fill in.',
    usage: `<Challenge title="Count lines too">
  Make your counter report lines and bytes as well, like \`wc\`.
  Then make it read from standard input when no file is given.
</Challenge>`,
    demo: (
      <Challenge title="Count lines too">
        <p>
          Make your counter report lines and bytes as well, like <code>wc</code>.
        </p>
        <p>Then make it read from standard input when no file is given.</p>
      </Challenge>
    ),
  },
  {
    name: 'Deepening',
    purpose: 'An optional extra: a way to dig further into how the real thing does it. Finer paper, with more sheets underneath.',
    usage: `<Deepening title="What is a word, really?">
  Unicode defines word boundaries in UAX #29. Read it, and find three
  inputs where your counter and the standard disagree.
</Deepening>`,
    demo: (
      <Deepening title="What is a word, really?">
        <p>
          Unicode defines word boundaries in <Cite href="https://www.unicode.org/reports/tr29/">UAX #29</Cite>. Read it,
          and find three inputs where your counter and the standard disagree.
        </p>
      </Deepening>
    ),
  },
  {
    name: 'Kbd',
    purpose: 'A key to press.',
    usage: `Stop the capture with <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>.`,
    demo: (
      <p>
        Stop the capture with <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>.
      </p>
    ),
  },

];

export default function ComponentsPage() {
  return (
    <main className="flex-1">
      <section className="mint-grid border-b">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-12">
          <h1 className="font-display text-[clamp(2.75rem,8vw,5rem)] leading-none tracking-tight">Book components</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
            Everything a chapter&apos;s MDX can use, each shown in a chapter&apos;s own type and spacing, with the MDX that
            makes it. Fumadocs&apos; <code className="font-mono text-base">Callout</code>,{' '}
            <code className="font-mono text-base">Cards</code>, <code className="font-mono text-base">Steps</code>,{' '}
            <code className="font-mono text-base">Tabs</code> and <code className="font-mono text-base">Accordions</code>{' '}
            work too.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav aria-label="Components" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm lg:flex-col">
            {specimens.map((s) => (
              <li key={s.name}>
                <a href={`#${s.name}`} className="font-mono text-fd-muted-foreground hover:text-fd-primary">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {specimens.map((s) => (
            <section key={s.name} id={s.name} className="scroll-mt-24 border-t border-fd-primary/25 pt-6 pb-14">
              <h2 className="font-mono text-xl font-semibold text-fd-foreground">&lt;{s.name}&gt;</h2>
              <p className="mt-1 max-w-2xl text-fd-muted-foreground">{s.purpose}</p>
              <div className="mt-6 max-w-[46rem]">
                <div className="prose book-body">{s.demo}</div>
                <div className="mt-6 [&_figure]:my-0">
                  <ServerCodeBlock lang="mdx" themes={{ light: mintLight, dark: mintDark }} code={s.usage} />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
