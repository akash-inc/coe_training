import { cn } from '../../lib/cn'

type TypeBadgeProps = {
  type: string
  className?: string
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-sm border border-border bg-type-badge-bg px-2 py-1 text-type-badge-fg text-xs leading-tight capitalize',
        className,
      )}
      data-type={type}
    >
      {type}
    </span>
  )
}
