import { useEffect, useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { PokedexApp } from './components/pokedex/PokedexApp'
import { ThemeControls } from './components/organisms/ThemeControls'
import { ComponentsShowcase } from './components/showcase/ComponentsShowcase'
import { useThemePreferences } from './hooks/useThemePreferences'
import { headlessTabClass, headlessTabListClass } from './lib/headlessTabClass'

function App() {
  const [view, setView] = useState(0)
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
    <div className="min-h-svh">
      <TabGroup selectedIndex={view} onChange={setView} className="w-full">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0 sm:flex-1">
            <TabList aria-label="App" className={headlessTabListClass}>
              <Tab className={headlessTabClass}>Pokédex</Tab>
              <Tab className={headlessTabClass}>Component lab</Tab>
            </TabList>
          </div>
          <ThemeControls
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            visualStyle={visualStyle}
            onVisualStyleChange={setVisualStyle}
            resolved={resolvedColorMode}
          />
        </div>
        <TabPanels>
          <TabPanel className="pt-0 focus:outline-none">
            <PokedexApp />
          </TabPanel>
          <TabPanel className="pt-0 focus:outline-none">
            <ComponentsShowcase />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}

export default App
