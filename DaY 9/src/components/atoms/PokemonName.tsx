import { formatPokemonDisplayName } from '../../lib/pokeapi/formatPokemonDisplayName'
import { cn } from '../../lib/cn'

type PokemonNameProps = {
  name: string
  as?: 'h1' | 'h2' | 'span' | 'p'
  className?: string
}

export function PokemonName({
  name,
  as: Tag = 'span',
  className,
}: PokemonNameProps) {
  const label = formatPokemonDisplayName(name)
  return (
    <Tag
      className={cn('font-semibold text-foreground', className)}
    >
      {label}
    </Tag>
  )
}
