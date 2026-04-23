import { cn } from '../../lib/cn'

type IdChipProps = {
  id: number
  className?: string
}

export function IdChip({ id, className }: IdChipProps) {
  const label = `#${String(id).padStart(3, '0')}`
  return (
    <span
      className={cn('font-mono text-[0.8rem] text-muted-foreground', className)}
      aria-label={`National Pokédex number ${id}`}
    >
      {label}
    </span>
  )
}
