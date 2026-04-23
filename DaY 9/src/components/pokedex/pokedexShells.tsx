/* eslint-disable react-refresh/only-export-components -- withCardSurface() wrappers for shells */
import type { HTMLAttributes, ReactNode } from 'react'
import { withCardSurface } from '../patterns/withCardSurface'

const loadingShell =
  'rounded-md border border-dashed border-border/60 bg-background/50 p-3'
const errorShell =
  'rounded-md border border-accent-border/50 bg-[var(--accent-bg)] p-3'
const detailEmptyShell =
  'flex min-h-40 min-w-0 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border/60 p-4'

type StatusDivProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode }

function StatusBlock({ className, children, ...rest }: StatusDivProps) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  )
}

StatusBlock.displayName = 'PokedexShellBlock'

export const ListFetchLoading = withCardSurface(loadingShell)(StatusBlock)
export const ListFetchError = withCardSurface(errorShell)(StatusBlock)
export const DetailSelectPrompt = withCardSurface(detailEmptyShell)(StatusBlock)
