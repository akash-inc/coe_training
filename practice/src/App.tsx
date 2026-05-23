import { useState } from 'react'

function App() {
  const [name, setName] = useState('')

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 md:p-10">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Tailwind Practice Page
          </h1>
          <p className="mt-3 text-slate-600">
            Compare default HTML with Tailwind-styled UI. Edit classes in{' '}
            <code>src/App.tsx</code> and use hot reload to learn quickly.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What to practice</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Change spacing classes (`p-`, `m-`, `gap-`) and observe layout shifts.</li>
            <li>Try typography classes (`text-`, `font-`, `tracking-`, `leading-`).</li>
            <li>Customize colors for normal, hover, and focus states.</li>
            <li>
              Test responsive behavior with breakpoints (`sm:`, `md:`, `lg:`) by resizing
              the browser.
            </li>
            <li>
              Add and remove visual depth (`border`, `rounded`, `shadow`) to see contrast.
            </li>
          </ol>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Unstyled (default HTML)</h3>
            <p className="mt-1 text-sm text-slate-500">
              No Tailwind classes on the elements below.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <button type="button">Default Button</button>
              </div>

              <form>
                <label htmlFor="plain-name">Name</label>
                <br />
                <input
                  id="plain-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Type your name"
                />
              </form>

              <article>
                <h4>Default Card Title</h4>
                <p>This block uses browser defaults with no utility classes.</p>
              </article>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Styled (Tailwind)</h3>
            <p className="mt-1 text-sm text-slate-500">
              Same structure, styled with utility classes.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Tailwind Button
                </button>
              </div>

              <form className="space-y-2">
                <label
                  htmlFor="styled-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="styled-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Type your name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </form>

              <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900">Styled Card Title</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Utility classes control spacing, color, border, and typography.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Try this challenge</h2>
          <p className="mt-2 text-amber-800">
            Create a dark mode version of the styled column using `dark:` classes and
            test it with your system theme.
          </p>
          <p className="mt-2 text-amber-800">
            Bonus: Add one responsive change so the button becomes full-width on small
            screens (`w-full sm:w-auto`).
          </p>
        </section>
      </div>
    </main>
  )
}

export default App
