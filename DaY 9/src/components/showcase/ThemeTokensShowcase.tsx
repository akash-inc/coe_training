import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

const SEMANTIC: {
  label: string
  varName: string
  tailwind: string
  swatch: 'fill' | 'text' | 'border'
}[] = [
  { label: 'Foreground', varName: '--fg', tailwind: 'text-foreground', swatch: 'text' },
  { label: 'Muted', varName: '--muted-fg', tailwind: 'text-muted-foreground', swatch: 'text' },
  { label: 'Background', varName: '--bg', tailwind: 'bg-background', swatch: 'fill' },
  { label: 'Card', varName: '--card-bg', tailwind: 'bg-card', swatch: 'fill' },
  { label: 'Border', varName: '--border', tailwind: 'border-border', swatch: 'border' },
  { label: 'Code', varName: '--code-bg', tailwind: 'bg-code', swatch: 'fill' },
  { label: 'Accent', varName: '--accent', tailwind: 'text-accent / border-accent', swatch: 'fill' },
  { label: 'Accent surface', varName: '--accent-bg', tailwind: 'bg-accent-bg (app)', swatch: 'fill' },
  { label: 'Accent border', varName: '--accent-border', tailwind: 'border-accent-border', swatch: 'border' },
  { label: 'Type badge bg', varName: '--type-badge-bg', tailwind: 'bg-type-badge-bg', swatch: 'fill' },
  { label: 'Type badge fg', varName: '--type-badge-fg', tailwind: 'text-type-badge-fg', swatch: 'text' },
]

const THEME_ALIASES: { tailwindToken: string; cssVar: string }[] = [
  { tailwindToken: 'foreground', cssVar: '--fg' },
  { tailwindToken: 'muted-foreground', cssVar: '--muted-fg' },
  { tailwindToken: 'background', cssVar: '--bg' },
  { tailwindToken: 'card', cssVar: '--card-bg' },
  { tailwindToken: 'border', cssVar: '--border' },
  { tailwindToken: 'code', cssVar: '--code-bg' },
  { tailwindToken: 'accent', cssVar: '--accent' },
  { tailwindToken: 'accent-border', cssVar: '--accent-border' },
  { tailwindToken: 'type-badge-bg', cssVar: '--type-badge-bg' },
  { tailwindToken: 'type-badge-fg', cssVar: '--type-badge-fg' },
]

const SCALE_VARS = [
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
] as const

const TYPE_SLUGS = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const

function readRootVar(name: string): string {
  if (typeof document === 'undefined') {
    return ''
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function Swatch({
  kind,
  varName,
  className,
}: {
  kind: 'fill' | 'text' | 'border'
  varName: string
  className?: string
}) {
  if (kind === 'text') {
    return (
      <div
        className={cn(
          'flex h-10 w-full shrink-0 items-center justify-center rounded-md border border-border/50 bg-card font-mono text-lg font-semibold',
          className,
        )}
        style={{ color: `var(${varName})` }}
        aria-hidden
      >
        Aa
      </div>
    )
  }
  const style =
    kind === 'fill'
      ? { backgroundColor: `var(${varName})` }
      : {
          borderColor: `var(${varName})`,
          borderWidth: 3,
          borderStyle: 'solid',
          backgroundColor: 'transparent',
        }
  return (
    <div
      className={cn('h-10 w-full shrink-0 rounded-md border border-border/50', className)}
      style={style}
      aria-hidden
    />
  )
}

export function ThemeTokensShowcase() {
  const [, setSchemeTick] = useState(0)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const reMeasure = () => setSchemeTick((n) => n + 1)
    mq.addEventListener('change', reMeasure)
    return () => mq.removeEventListener('change', reMeasure)
  }, [])

  const resolved: Record<string, string> = {}
  for (const row of SEMANTIC) {
    resolved[row.varName] = readRootVar(row.varName)
  }
  for (const v of SCALE_VARS) {
    resolved[v] = readRootVar(v)
  }
  for (const slug of TYPE_SLUGS) {
    const n = `--type-${slug}`
    resolved[n] = readRootVar(n)
  }
  resolved['--sans'] = readRootVar('--sans')
  resolved['--heading'] = readRootVar('--heading')
  resolved['--mono'] = readRootVar('--mono')

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-10 px-4 pb-10 pt-2">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Theme &amp; tokens</h1>
        <p className="text-sm text-muted-foreground">
          Live values from <code className="rounded-sm bg-code px-1 font-mono text-xs">document.documentElement</code> for the
          current color mode and visual style. Use the app bar controls to switch Light / Dark and Calm / Vivid.
        </p>
      </header>

      <section className="flex max-w-5xl flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Semantic palette</h2>
        <p className="text-sm text-muted-foreground">
          Defined in <code className="font-mono text-xs">semantic-themes.css</code> per{' '}
          <code className="font-mono text-xs">data-color-mode</code> × <code className="font-mono text-xs">data-visual-style</code>.
        </p>
        <div className="grid gap-3 min-[520px]:grid-cols-2 min-[900px]:grid-cols-3">
          {SEMANTIC.map((row) => (
            <div
              key={row.varName}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card p-3"
            >
              <Swatch kind={row.swatch} varName={row.varName} />
              <p className="mt-2 text-sm font-medium text-foreground">{row.label}</p>
              <code className="mt-1 font-mono text-[11px] text-muted-foreground">{row.varName}</code>
              <code className="mt-0.5 font-mono text-[11px] text-accent">{row.tailwind}</code>
              <p className="mt-2 break-all font-mono text-[10px] leading-snug text-muted-foreground">
                {resolved[row.varName] || '—'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Tailwind theme aliases</h2>
        <p className="text-sm text-muted-foreground">
          From <code className="font-mono text-xs">index.css</code> <code className="font-mono text-xs">@theme inline</code> — use as{' '}
          <code className="font-mono text-xs">bg-*, text-*, border-*</code>.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-3 py-2 font-medium text-foreground">Tailwind</th>
                <th className="px-3 py-2 font-medium text-foreground">CSS variable</th>
              </tr>
            </thead>
            <tbody>
              {THEME_ALIASES.map((row) => (
                <tr key={row.cssVar} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-foreground">{row.tailwindToken}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.cssVar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Layout &amp; type scale</h2>
        <p className="text-sm text-muted-foreground">
          Base scale from <code className="font-mono text-xs">tokens.css</code> (not mode-specific).
        </p>
        <ul className="m-0 list-none space-y-1 rounded-lg border border-border bg-card/40 p-3 font-mono text-xs text-muted-foreground">
          {SCALE_VARS.map((v) => (
            <li key={v}>
              <span className="text-foreground">{v}</span>: {resolved[v] || '—'}
            </li>
          ))}
          <li className="pt-2 text-foreground">--sans</li>
          <li className="pl-2 break-all text-[11px]">{resolved['--sans'] || '—'}</li>
          <li className="pt-1 text-foreground">--heading</li>
          <li className="pl-2 break-all text-[11px]">{resolved['--heading'] || '—'}</li>
          <li className="pt-1 text-foreground">--mono</li>
          <li className="pl-2 break-all text-[11px]">{resolved['--mono'] || '—'}</li>
        </ul>
      </section>

      <section className="flex max-w-5xl flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Pokémon type colors</h2>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-xs">--type-*</code> in <code className="font-mono text-xs">type-tokens.css</code> (per light / dark). On
          the Pokédex tab, <code className="font-mono text-xs">data-accent-type</code> maps these into accent tokens.
        </p>
        <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 min-[700px]:grid-cols-6">
          {TYPE_SLUGS.map((slug) => {
            const varName = `--type-${slug}` as const
            return (
              <div
                key={slug}
                className="flex flex-col overflow-hidden rounded-md border border-border bg-card p-2"
              >
                <div
                  className="h-8 w-full rounded-sm border border-border/50"
                  style={{ backgroundColor: `var(${varName})` }}
                  aria-hidden
                />
                <p className="mt-1.5 capitalize text-xs font-medium text-foreground">{slug}</p>
                <code className="font-mono text-[10px] text-muted-foreground">{varName}</code>
                <p className="mt-1 break-all font-mono text-[9px] leading-tight text-muted-foreground/90">
                  {resolved[varName] || '—'}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
