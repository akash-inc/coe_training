/* eslint-disable react-refresh/only-export-components -- compound Tabs root re-exports List/Tab/Panel */
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '../../../lib/cn'

type TabsContextValue = {
  value: string
  setValue: (next: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(name: string) {
  const ctx = useContext(TabsContext)
  if (!ctx) {
    throw new Error(`${name} must be used within <Tabs>`)
  }
  return ctx
}

type TabsRootProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children: ReactNode
}

function TabsRoot({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  className,
  children,
}: TabsRootProps) {
  const [uncontrolled, setUncontrolled] = useState(() => defaultValue)
  const value = valueProp ?? uncontrolled
  const setValue = useCallback(
    (next: string) => {
      if (valueProp === undefined) {
        setUncontrolled(next)
      }
      onValueChange?.(next)
    },
    [onValueChange, valueProp],
  )
  const baseId = useId()
  const ctx = useMemo(
    () => ({ value, setValue, baseId }),
    [value, setValue, baseId],
  )

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn('w-full', className)} data-slot="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  )
}

type TabsListProps = {
  className?: string
  children: ReactNode
  'aria-label'?: string
}

export function TabsList({
  className,
  children,
  'aria-label': ariaLabel = 'Tab list',
  ...rest
}: TabsListProps & HTMLAttributes<HTMLDivElement>) {
  const { baseId, value, setValue } = useTabsContext('TabsList')

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { key } = e
    if (
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
        key,
      )
    ) {
      return
    }
    e.preventDefault()
    const list = e.currentTarget
    const tabButtons = [
      ...list.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ]
    if (tabButtons.length === 0) return
    const i = tabButtons.findIndex((b) => b.getAttribute('data-tab') === value)
    const from = i >= 0 ? i : 0
    const len = tabButtons.length
    let next: number
    if (key === 'Home') next = 0
    else if (key === 'End') next = len - 1
    else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      next = (from - 1 + len) % len
    } else {
      next = (from + 1) % len
    }
    const val = tabButtons[next]?.getAttribute('data-tab')
    if (val) {
      setValue(val)
      tabButtons[next]?.focus()
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      id={`${baseId}-list`}
      className={cn('flex flex-wrap gap-1 border-b border-border', className)}
      onKeyDown={onKeyDown}
      data-slot="tabs-list"
      {...rest}
    >
      {children}
    </div>
  )
}

type TabsTabProps = {
  value: string
  className?: string
  children: ReactNode
} & Omit<HTMLAttributes<HTMLButtonElement>, 'type' | 'role'>

export function TabsTab({ value: tabValue, className, children, ...rest }: TabsTabProps) {
  const { value, setValue, baseId } = useTabsContext('TabsTab')
  const selected = value === tabValue
  return (
    <button
      type="button"
      data-tab={tabValue}
      role="tab"
      id={`${baseId}-tab-${tabValue}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${tabValue}`}
      tabIndex={selected ? 0 : -1}
      data-state={selected ? 'active' : 'inactive'}
      className={cn(
        '-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
        'hover:text-foreground',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        selected && 'border-accent text-foreground',
        className,
      )}
      onClick={() => setValue(tabValue)}
      data-slot="tabs-tab"
      {...rest}
    >
      {children}
    </button>
  )
}

type TabsPanelProps = {
  value: string
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

export function TabsPanel({
  value: panelValue,
  className,
  children,
  ...rest
}: TabsPanelProps) {
  const { value, baseId } = useTabsContext('TabsPanel')
  if (value !== panelValue) return null
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${panelValue}`}
      aria-labelledby={`${baseId}-tab-${panelValue}`}
      className={cn('pt-3', className)}
      tabIndex={0}
      data-slot="tabs-panel"
      {...rest}
    >
      {children}
    </div>
  )
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
})
