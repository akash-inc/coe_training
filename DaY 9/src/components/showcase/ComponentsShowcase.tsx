import { Disclosure, DisclosureButton, DisclosurePanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useCallback, useState } from 'react'
import { withCardSurface } from '../patterns/withCardSurface'
import { TriState, type TriStateValue } from '../patterns/TriState'
import { headlessTabClass, headlessTabListClass } from '../../lib/headlessTabClass'
import { TokenThemedCallout } from '../molecules/TokenThemedCallout'
import { cn } from '../../lib/cn'

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
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-10 px-4 pb-10 pt-2">
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Component lab</h1>
        <p className="text-sm text-muted-foreground">
          <a
            className="font-medium text-accent underline-offset-2 hover:underline"
            href="https://headlessui.com"
            rel="noreferrer"
            target="_blank"
          >
            Headless UI
          </a>{' '}
          for tabs, disclosures, listbox, field, input, checkbox, and switch. Global appearance uses{' '}
          <code className="font-mono text-xs">data-color-mode</code> × <code className="font-mono text-xs">data-visual-style</code>, and per-type{' '}
          <code className="font-mono text-xs">data-accent-type</code> in CSS. Local patterns:{' '}
          <code className="rounded-sm bg-code px-1 font-mono text-xs">TriState</code> and{' '}
          <code className="rounded-sm bg-code px-1 font-mono text-xs">withCardSurface</code>. <code className="rounded-sm bg-code px-1 font-mono text-xs">@emotion/styled</code> can read
          the same variables via a shared <code className="rounded-sm bg-code px-1 font-mono text-xs">theme</code> (see below).
        </p>
      </header>

      <section
        className="flex max-w-2xl flex-col gap-3"
        aria-labelledby="showcase-emotion-heading"
      >
        <h2 id="showcase-emotion-heading" className="text-lg font-semibold text-foreground">
          CSS-in-JS: <code className="font-mono text-base">@emotion/styled</code> + design tokens
        </h2>
        <p className="text-sm text-muted-foreground">
          The Emotion <code className="font-mono text-xs">theme</code> in <code className="font-mono text-xs">src/theme/emotionTokenTheme.ts</code> holds{' '}
          <code className="font-mono text-xs">var(--…)</code> strings aligned with <code className="font-mono text-xs">semantic-themes.css</code>, not duplicate hex
          values. Toggling theme controls updates CSS on <code className="font-mono text-xs">&lt;html&gt;</code>, and this callout updates with it.
        </p>
        <TokenThemedCallout title="Emotion + CSS variables">
          <p>
            <span className="font-medium text-foreground">Styled components</span> use{' '}
            <code className="rounded-sm bg-code px-1 font-mono text-xs">theme.accentBorder</code>, <code className="rounded-sm bg-code px-1 font-mono text-xs">theme.accentBg</code>, and
            other keys that resolve the same <code className="font-mono text-xs">--</code> tokens as Tailwind-style utilities.
          </p>
        </TokenThemedCallout>
      </section>

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
          prepends card-like styles. In the Pokédex, the same helper backs <code className="font-mono text-xs">PokedexPanel</code>, list errors, and the empty-detail
          shell in <code className="font-mono text-xs">pokedexShells.tsx</code>.
        </p>
        <FramedLabText line="same props as LabFrame, extra chrome from the HOC" />
      </section>

      <section className="flex max-w-2xl flex-col gap-3" aria-labelledby="showcase-tabs-heading">
        <h2 id="showcase-tabs-heading" className="text-lg font-semibold text-foreground">
          Tabs (<code className="font-mono text-sm">TabGroup</code>)
        </h2>
        <p className="text-sm text-muted-foreground">
          From <code className="font-mono text-xs">@headlessui/react</code>: keyboard navigation, focus management, and ARIA
          roles. The app shell and Pokémon detail use the same pattern.
        </p>
        <TabGroup defaultIndex={0} className="rounded-lg border border-border bg-card p-4">
          <TabList aria-label="Tabs showcase" className={headlessTabListClass}>
            <Tab className={headlessTabClass}>Primitives</Tab>
            <Tab className={headlessTabClass}>Usage</Tab>
          </TabList>
          <TabPanels>
            <TabPanel className="pt-3 text-sm text-muted-foreground focus:outline-none">
              <p>
                Built from <code className="font-mono text-xs">TabGroup</code>, <code className="font-mono text-xs">TabList</code>,{' '}
                <code className="font-mono text-xs">Tab</code>, <code className="font-mono text-xs">TabPanels</code>, and{' '}
                <code className="font-mono text-xs">TabPanel</code>.
              </p>
            </TabPanel>
            <TabPanel className="pt-3 text-sm text-muted-foreground focus:outline-none">
              <p>
                The Pokédex view uses the same Headless tabs for the main shell. The detail panel uses tabs for summary vs. record.
              </p>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </section>

      <section
        className="flex max-w-2xl flex-col gap-4"
        aria-labelledby="showcase-disclosure-heading"
      >
        <h2 id="showcase-disclosure-heading" className="text-lg font-semibold text-foreground">
          Disclosure
        </h2>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-xs">Disclosure</code> + <code className="font-mono text-xs">DisclosureButton</code> +{' '}
          <code className="font-mono text-xs">DisclosurePanel</code> replace the old custom accordion. Each block is independent; the
          Record tab in the detail view uses two disclosures (first open by default).
        </p>

        <div className="rounded-lg border border-border bg-card">
          <Disclosure defaultOpen>
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm font-medium text-foreground">
                  <span>What is headless UI?</span>
                  <span className={cn('text-xs', open && 'rotate-180')} aria-hidden>▼</span>
                </DisclosureButton>
                <DisclosurePanel className="border-b border-border px-3 pb-3 text-sm text-muted-foreground">
                  Markup-agnostic primitives: behavior and accessibility without shipping default styles—pair with Tailwind (or any CSS).
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
          <Disclosure>
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-foreground">
                  <span>Why not style props only?</span>
                  <span className={cn('text-xs', open && 'rotate-180')} aria-hidden>▼</span>
                </DisclosureButton>
                <DisclosurePanel className="px-3 pb-3 text-sm text-muted-foreground">
                  You keep full control of the DOM and design tokens while inheriting focus and screen-reader wiring.
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        </div>
      </section>
    </div>
  )
}
