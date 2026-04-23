import { useState } from 'react'
import { PokedexApp } from './components/pokedex/PokedexApp'
import { ComponentsShowcase } from './components/showcase/ComponentsShowcase'
import { Tabs } from './components/ui/tabs/Tabs'

function App() {
  const [view, setView] = useState('pokedex')

  return (
    <div className="min-h-svh">
      <Tabs value={view} onValueChange={setView} className="w-full">
        <div className="px-4 pt-4">
          <Tabs.List aria-label="App">
            <Tabs.Tab value="pokedex">Pokédex</Tabs.Tab>
            <Tabs.Tab value="showcase">Component lab</Tabs.Tab>
          </Tabs.List>
        </div>
        <Tabs.Panel value="pokedex" className="pt-0">
          <PokedexApp />
        </Tabs.Panel>
        <Tabs.Panel value="showcase" className="pt-0">
          <ComponentsShowcase />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default App
