import { useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { PokedexApp } from './components/pokedex/PokedexApp'
import { ComponentsShowcase } from './components/showcase/ComponentsShowcase'
import { headlessTabClass, headlessTabListClass } from './lib/headlessTabClass'

function App() {
  const [view, setView] = useState(0)

  return (
    <div className="min-h-svh">
      <TabGroup selectedIndex={view} onChange={setView} className="w-full">
        <div className="px-4 pt-4">
          <TabList aria-label="App" className={headlessTabListClass}>
            <Tab className={headlessTabClass}>Pokédex</Tab>
            <Tab className={headlessTabClass}>Component lab</Tab>
          </TabList>
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
