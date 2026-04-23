/* eslint-disable react-refresh/only-export-components -- compound Accordion root re-exports Item/Trigger/Content */
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../../lib/cn'

type AccordionRootContextValue = {
  type: 'single' | 'multiple'
  baseId: string
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
  collapsible: boolean
}

const AccordionRootContext = createContext<AccordionRootContextValue | null>(
  null,
)

type AccordionItemContextValue = { value: string }
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
)

function useAccordion(name: string) {
  const ctx = useContext(AccordionRootContext)
  if (!ctx) {
    throw new Error(`${name} must be used within <Accordion>`)
  }
  return ctx
}

function useAccordionItem(name: string) {
  const ctx = useContext(AccordionItemContext)
  if (!ctx) {
    throw new Error(`${name} must be used within <AccordionItem>`)
  }
  return ctx
}

type AccordionRootProps = {
  type: 'single' | 'multiple'
  defaultValue?: string | string[] | null
  collapsible?: boolean
  className?: string
  children: ReactNode
}

function AccordionRoot({
  type,
  defaultValue,
  collapsible = true,
  className,
  children,
}: AccordionRootProps) {
  const baseId = useId()

  const [single, setSingle] = useState<string | null>(
    type === 'single' && defaultValue
      ? typeof defaultValue === 'string'
        ? defaultValue
        : null
      : null,
  )
  const [multi, setMulti] = useState<Set<string>>(() => {
    if (type === 'multiple' && defaultValue) {
      return new Set(
        Array.isArray(defaultValue) ? defaultValue : [defaultValue],
      )
    }
    return new Set()
  })

  const toggle = useCallback(
    (v: string) => {
      if (type === 'single') {
        setSingle((prev) => {
          if (prev === v) {
            if (!collapsible) {
              return prev
            }
            return null
          }
          return v
        })
      } else {
        setMulti((prev) => {
          const next = new Set(prev)
          if (next.has(v)) {
            next.delete(v)
          } else {
            next.add(v)
          }
          return next
        })
      }
    },
    [type, collapsible],
  )

  const isOpen = useCallback(
    (id: string) => {
      if (type === 'single') {
        return single === id
      }
      return multi.has(id)
    },
    [type, single, multi],
  )

  const ctx = useMemo(
    () => ({
      type,
      baseId,
      isOpen,
      toggle,
      collapsible,
    }),
    [type, baseId, isOpen, toggle, collapsible],
  )

  return (
    <AccordionRootContext.Provider value={ctx}>
      <div
        className={cn('w-full rounded-lg border border-border', className)}
        data-orientation="vertical"
        data-slot="accordion"
      >
        {children}
      </div>
    </AccordionRootContext.Provider>
  )
}

type AccordionItemProps = {
  value: string
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

export function AccordionItem({ value, className, children, ...rest }: AccordionItemProps) {
  const itemCtx = useMemo(() => ({ value }), [value])
  return (
    <AccordionItemContext.Provider value={itemCtx}>
      <div
        className={cn('border-b border-border last:border-b-0', className)}
        data-item={value}
        data-slot="accordion-item"
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

type AccordionTriggerProps = {
  className?: string
  children: ReactNode
} & Omit<HTMLAttributes<HTMLButtonElement>, 'type'>

export function AccordionTrigger({
  className,
  children,
  ...rest
}: AccordionTriggerProps) {
  const { value } = useAccordionItem('AccordionTrigger')
  const { baseId, isOpen, toggle } = useAccordion('AccordionTrigger')
  const open = isOpen(value)
  return (
    <h3 className="m-0">
      <button
        type="button"
        id={`${baseId}-trigger-${value}`}
        aria-expanded={open}
        aria-controls={`${baseId}-content-${value}`}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-foreground',
          'hover:bg-border/20',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          className,
        )}
        onClick={() => toggle(value)}
        data-state={open ? 'open' : 'closed'}
        data-slot="accordion-trigger"
        {...rest}
      >
        <span className="min-w-0">{children}</span>
        <span
          aria-hidden
          className={cn('shrink-0 text-xs text-muted-foreground transition-transform', open && 'rotate-180')}
        >
          ▼
        </span>
      </button>
    </h3>
  )
}

type AccordionContentProps = {
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

export function AccordionContent({ className, children, ...rest }: AccordionContentProps) {
  const { value } = useAccordionItem('AccordionContent')
  const { baseId, isOpen } = useAccordion('AccordionContent')
  const open = isOpen(value)
  if (!open) return null
  return (
    <div
      role="region"
      id={`${baseId}-content-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      className={cn('px-3 pb-3 text-sm text-muted-foreground', className)}
      data-state={open ? 'open' : 'closed'}
      data-slot="accordion-content"
      {...rest}
    >
      {children}
    </div>
  )
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})
