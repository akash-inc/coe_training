/* eslint-disable react-refresh/only-export-components -- PokedexPanel is HOC-wrapped <section> */
import type { ComponentProps } from 'react'
import { withCardSurface } from '../patterns/withCardSurface'

const panelShell =
  'min-h-[200px] rounded-lg border border-border bg-card p-4'

function PokedexPanelBase(props: ComponentProps<'section'>) {
  return <section {...props} />
}

PokedexPanelBase.displayName = 'PokedexPanelBase'

export const PokedexPanel = withCardSurface(panelShell)(PokedexPanelBase)
