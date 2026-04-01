import { cn } from '@/utils'
import { createContext, useContext, useState, type ReactNode } from 'react'

/* ── Context ──────────────────────────────────────── */
interface TabsContextValue {
  active: string
  setActive: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>')
  return ctx
}

/* ── Tabs (root) ──────────────────────────────────── */
interface TabsProps {
  defaultValue: string
  children:     ReactNode
  className?:   string
  onChange?:     (value: string) => void
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [active, _setActive] = useState(defaultValue)

  const setActive = (value: string) => {
    _setActive(value)
    onChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

/* ── TabsList ─────────────────────────────────────── */
export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-1 border-b border-gray-200', className)} role="tablist">
      {children}
    </div>
  )
}

/* ── TabsTrigger ──────────────────────────────────── */
interface TabsTriggerProps {
  value:      string
  children:   ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { active, setActive } = useTabsContext()
  const isActive = active === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors',
        isActive
          ? 'border-brand-600 text-brand-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        className
      )}
    >
      {children}
    </button>
  )
}

/* ── TabsContent ──────────────────────────────────── */
interface TabsContentProps {
  value:      string
  children:   ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { active } = useTabsContext()
  if (active !== value) return null

  return (
    <div role="tabpanel" className={cn('pt-4 animate-fade-in', className)}>
      {children}
    </div>
  )
}
