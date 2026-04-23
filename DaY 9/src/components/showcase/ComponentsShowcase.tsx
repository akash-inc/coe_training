import { useCallback, useState } from 'react'
import { withCardSurface } from '../patterns/withCardSurface'
import { TriState, type TriStateValue } from '../patterns/TriState'
import { Accordion } from '../ui/accordion/Accordion'
import { Tabs } from '../ui/tabs/Tabs'

type MockPhase = 0 | 1 | 2

const mockTrio: readonly TriStateValue<string, string>[] = [
  { status: 'loading' },
  { status: 'error', error: 'Simulated request failure' },
  { status: 'ready', data: 'PokéAPI data would appear here' },
] as const

type LabFrameProps = { line: string; className?: string }
function LabFrame({ line, className }: LabFrameProps) {
  return <p className={className}>Inner content: {line}</p>
}

const FramedLabText = withCardSurface(
  'rounded-md border border-dashed border-accent-border/50 bg-accent-bg/20 p-3 text-sm text-foreground/90',
)(LabFrame)

export function ComponentsShowcase() {
  const [mockPhase, setMockPhase] = useState<MockPhase>(0)
  const mockValue = mockTrio[mockPhase]

  const advanceMock = useCallback(() => {
    setMockPhase((n) => ((n + 1) % 3) as MockPhase)
  }, [])

  return (
    <div className="flex flex-col gap-10 px-4 pb-10 pt-2">
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Component lab</h1>
        <p className="text-sm text-muted-foreground">
          Compound <code className="rounded-sm bg-code px-1 font-mono text-xs">Tabs</code> and{' '}
          <code className="rounded-sm bg-code px-1 font-mono text-xs">Accordion</code>, a{' '}
          <code className="rounded-sm bg-code px-1 font-mono text-xs">TriState</code> render prop for
          loading / error / data, and a <code className="rounded-sm bg-code px-1 font-mono text-xs">withCardSurface</code>{' '}
          HOC. The real app uses <code className="font-mono text-xs">TriState</code> for the species
          list fetch, and the HOC for main column panels (<code className="font-mono text-xs">PokedexPanel</code>),
          the list error shell, and the empty-detail prompt (loading uses{' '}
          <code className="font-mono text-xs">PokemonGrid</code> skeletons).
        </p>
      </header>

      <section
        className="flex max-w-2xl flex-col gap-3"
        aria-labelledby="showcase-tristate-heading"
      >
        <h2 id="showcase-tristate-heading" className="text-lg font-semibold text-foreground">
          Render prop: <code className="font-mono text-base">TriState</code>
        </h2>
        <p className="text-sm text-muted-foreground">
          A function child receives a discriminated union: narrow on <code className="font-mono text-xs">status</code> and
          TypeScript can enforce every branch. Cycle the mock phase to see each branch.
        </p>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Current mock:{' '}
            <code className="font-mono text-foreground">
              {mockValue.status === 'loading' && 'loading'}
              {mockValue.status === 'error' && 'error'}
              {mockValue.status === 'ready' && 'ready'}
            </code>
          </p>
          <TriState value={mockValue}>
            {(s) => {
              if (s.status === 'loading') {
                return (
                  <p className="m-0 text-sm text-muted-foreground" role="status">
                    Loading (mock)…
                  </p>
                )
              }
              if (s.status === 'error') {
                return (
                  <p className="m-0 text-sm text-foreground" role="alert">
                    {s.error}
                  </p>
                )
              }
              return <p className="m-0 text-sm text-foreground">{s.data}</p>
            }}
          </TriState>
          <button
            type="button"
            className="mt-3 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={advanceMock}
          >
            Next phase
          </button>
        </div>
      </section>

      <section
        className="flex max-w-2xl flex-col gap-3"
        aria-labelledby="showcase-hoc-heading"
      >
        <h2 id="showcase-hoc-heading" className="text-lg font-semibold text-foreground">
          HOC: <code className="font-mono text-base">withCardSurface</code>
        </h2>
        <p className="text-sm text-muted-foreground">
          Wraps any component that takes optional <code className="font-mono text-xs">className</code> and
          prepends card-like styles. The wrapped component is named in devtools as{' '}
          <code className="font-mono text-xs">withCardSurface(…)</code>. In the Pokédex, the same helper
          backs <code className="font-mono text-xs">PokedexPanel</code>, list errors, and the empty-detail
          shell in <code className="font-mono text-xs">pokedexShells.tsx</code>.
        </p>
        <FramedLabText line="same props as LabFrame, extra chrome from the HOC" />
      </section>

      <section className="flex max-w-2xl flex-col gap-3" aria-labelledby="showcase-tabs-heading">
        <h2 id="showcase-tabs-heading" className="text-lg font-semibold text-foreground">
          Tabs
        </h2>
        <p className="text-sm text-muted-foreground">
          Uncontrolled example: choose a section. Focus the tab list and use arrow keys, Home, and
          End.
        </p>
        <Tabs defaultValue="primitives" className="rounded-lg border border-border bg-card p-4">
          <Tabs.List aria-label="Tabs showcase">
            <Tabs.Tab value="primitives">Primitives</Tabs.Tab>
            <Tabs.Tab value="usage">Usage</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="primitives" className="pt-3 text-sm text-muted-foreground">
            <p>
              Built from <span className="text-foreground">Tabs</span>,{' '}
              <span className="text-foreground">Tabs.List</span>,{' '}
              <span className="text-foreground">Tabs.Tab</span>, and{' '}
              <span className="text-foreground">Tabs.Panel</span>. The list dispatches arrow-key
              navigation across tab buttons.
            </p>
          </Tabs.Panel>
          <Tabs.Panel value="usage" className="pt-3 text-sm text-muted-foreground">
            <p>
              The Pokédex view uses the same API for the main app shell. The detail panel uses tabs
              for summary vs. structured record data.
            </p>
          </Tabs.Panel>
        </Tabs>
      </section>

      <section
        className="flex max-w-2xl flex-col gap-4"
        aria-labelledby="showcase-accordion-heading"
      >
        <h2 id="showcase-accordion-heading" className="text-lg font-semibold text-foreground">
          Accordion
        </h2>
        <p className="text-sm text-muted-foreground">
          Single type (one section at a time, collapsible) and multiple type (independent panels).
        </p>

        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Single, collapsible</h3>
          <Accordion type="single" defaultValue="a" collapsible className="bg-card">
            <Accordion.Item value="a">
              <Accordion.Trigger>What is a compound component?</Accordion.Trigger>
              <Accordion.Content>
                A parent exports subcomponents (for example <code className="font-mono text-xs">Accordion.Item</code>) that share
                implicit state through React context instead of prop drilling.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="b">
              <Accordion.Trigger>Why not a single big prop object?</Accordion.Trigger>
              <Accordion.Content>
                Composition keeps call sites readable and lets you wrap triggers with layout or swap
                markup without changing the root API.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">Multiple</h3>
          <Accordion type="multiple" defaultValue={['x']} className="bg-card">
            <Accordion.Item value="x">
              <Accordion.Trigger>Accessibility</Accordion.Trigger>
              <Accordion.Content>
                Triggers use <span className="font-mono text-xs">aria-expanded</span> and pair with
                regions via <span className="font-mono text-xs">aria-controls</span>.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="y">
              <Accordion.Trigger>Styling</Accordion.Trigger>
              <Accordion.Content>
                Visuals use Tailwind with the same design tokens as the rest of Day 9.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
