import type { ReactNode } from 'react'
import type { Theme } from '@emotion/react'
import styled from '@emotion/styled'

type Themed = { theme: Theme }

const Root = styled.div`
  max-width: 36rem;
  border-radius: 0.5rem;
  border: 1px solid ${(p: Themed) => p.theme.accentBorder};
  background: ${(p: Themed) => p.theme.accentBg};
  color: ${(p: Themed) => p.theme.fg};
  box-shadow: ${(p: Themed) => p.theme.shadow};
  padding: 0.75rem 1rem;
`

const Kicker = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${(p: Themed) => p.theme.mutedFg};
`

const Body = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${(p: Themed) => p.theme.mutedFg};

  & p {
    margin: 0 0 0.5rem 0;
  }

  & p:last-child {
    margin-bottom: 0;
  }
`

type TokenThemedCalloutProps = {
  title: string
  children: ReactNode
}

export function TokenThemedCallout({ title, children }: TokenThemedCalloutProps) {
  return (
    <Root>
      <Kicker>{title}</Kicker>
      <Body>{children}</Body>
    </Root>
  )
}
