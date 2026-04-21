import { useEffect } from "react"
import Board from "./components/Board/Board"
import {
  getDefaultBoardId,
  isSupabaseConfigured,
} from "./lib/supabase/client"
import { useKanbanStore } from "./store"
import "./App.css"

export default function App() {
  useEffect(() => {
    if (isSupabaseConfigured() && getDefaultBoardId()) {
      void useKanbanStore.getState().hydrateFromRemote()
    }
  }, [])

  return (
    <div className="app-shell">
      <Board />
    </div>
  )
}