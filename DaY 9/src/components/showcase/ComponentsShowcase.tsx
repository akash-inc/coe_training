import { Accordion } from '../ui/accordion/Accordion'
import { Tabs } from '../ui/tabs/Tabs'

export function ComponentsShowcase() {
  return (
    <div className="flex flex-col gap-10 px-4 pb-10 pt-2">
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Component lab</h1>
        <p className="text-sm text-muted-foreground">
          Compound <code className="rounded-sm bg-code px-1 font-mono text-xs">Tabs</code> and{' '}
          <code className="rounded-sm bg-code px-1 font-mono text-xs">Accordion</code> primitives
          used in this project. Both are built with React context, keyboard support (tabs), and
          ARIA roles.
        </p>
      </header>

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
