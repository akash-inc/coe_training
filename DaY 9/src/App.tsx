import { lazy, Suspense, useEffect, useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { ThemeControls } from './components/organisms/ThemeControls'
import { useNavbarScrollVisible } from './hooks/useNavbarScrollVisible'
import { useThemePreferences } from './hooks/useThemePreferences'
import { cn } from './lib/cn'
import {
  headlessTabClass,
  headlessTabListClassFlush,
} from './lib/headlessTabClass'

const PokedexApp = lazy(() =>
  import('./components/pokedex/PokedexApp').then((m) => ({ default: m.PokedexApp })),
)
const ComponentsShowcase = lazy(() =>
  import('./components/showcase/ComponentsShowcase').then((m) => ({
    default: m.ComponentsShowcase,
  })),
)

function TabPanelFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-4 text-sm text-muted-foreground">
      Loading…
    </div>
  )
}

function App() {
  const [view, setView] = useState(0)
  const navVisible = useNavbarScrollVisible()
  const {
    colorMode,
    setColorMode,
    visualStyle,
    setVisualStyle,
    resolvedColorMode,
  } = useThemePreferences()

  useEffect(() => {
    if (view !== 0) {
      document.documentElement.removeAttribute('data-accent-type')
    }
  }, [view])

  return (
    <div className="flex min-h-svh w-full max-w-full flex-col bg-background">
      <TabGroup
        selectedIndex={view}
        onChange={setView}
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
      >
        <header
          className={cn(
            'sticky top-0 z-30 bg-background',
            'overflow-hidden transition-[max-height,opacity] duration-200 ease-out',
            navVisible
              ? 'max-h-40 opacity-100'
              : 'max-h-0 border-t-0 py-0 opacity-0 [pointer-events:none]',
          )}
          inert={!navVisible}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-1.5 min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between min-[500px]:gap-4 min-[500px]:py-2">
            <div className="min-w-0 min-[500px]:flex-1">
              <TabList aria-label="App" className={headlessTabListClassFlush}>
                <Tab className={headlessTabClass}>Pokédex</Tab>
                <Tab className={headlessTabClass}>Component lab</Tab>
              </TabList>
            </div>
            <div className="w-full min-w-0 min-[500px]:w-auto min-[500px]:shrink-0 min-[500px]:max-w-none">
              <ThemeControls
                colorMode={colorMode}
                onColorModeChange={setColorMode}
                visualStyle={visualStyle}
                onVisualStyleChange={setVisualStyle}
                resolved={resolvedColorMode}
              />
            </div>
          </div>
        </header>
        <TabPanels className="flex min-h-0 flex-1 flex-col">
          <TabPanel className="m-0 flex min-h-0 min-w-0 flex-1 flex-col p-0 outline-none focus:outline-none">
            <Suspense fallback={<TabPanelFallback />}>
              <PokedexApp />
            </Suspense>
          </TabPanel>
          <TabPanel className="m-0 flex min-h-0 min-w-0 flex-1 flex-col p-0 outline-none focus:outline-none">
            <Suspense fallback={<TabPanelFallback />}>
              <ComponentsShowcase />
            </Suspense>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}

export default App
