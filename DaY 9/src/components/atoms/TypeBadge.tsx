import { cn } from '../../lib/cn'

type TypeBadgeProps = {
  type: string
  className?: string
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      className={cn('type-badge inline-block rounded-sm px-2 py-1 text-xs leading-tight capitalize', className)}
      data-type={type}
    >
      {type}
    </span>
  )
}
