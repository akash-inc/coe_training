import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Board from "./components/Board/Board"
import LoginPage from "./components/Auth/LoginPage"
import SignUpPage from "./components/Auth/SignUpPage"
import OnboardingPage from "./components/Onboarding/OnboardingPage"
import { useAuth } from "./context/useAuth"
import { connectKanbanCrossTabSync } from "./lib/crossTabSync"
import {
  getDefaultBoardId,
  isSupabaseConfigured,
} from "./lib/supabase/client"
import { useKanbanStore } from "./store"
import { useOnboardingStore } from "./store/onboardingStore"
import "./App.css"

export default function App() {
  const { authRequired, isReady, session } = useAuth()
  const persistHydrated = useOnboardingStore((s) => s.persistHydrated)
  const clearOnSignOut = useOnboardingStore((s) => s.clearOnSignOut)
  const sessionUserId = session?.user.id ?? ""
  const onboardingComplete = useOnboardingStore((s) =>
    sessionUserId.length === 0 ? true : s.completedUserIds.includes(sessionUserId),
  )

  useLayoutEffect(() => {
    connectKanbanCrossTabSync(useKanbanStore)
  }, [])
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login")
  const hadSessionRef = useRef(false)

  useEffect(() => {
    if (session != null) {
      hadSessionRef.current = true
      return
    }
    if (hadSessionRef.current) {
      setAuthScreen("login")
    }
  }, [session])

  const canLoadRemote =
    isSupabaseConfigured() &&
    getDefaultBoardId() != null &&
    (!authRequired || session != null)

  useEffect(() => {
    if (!canLoadRemote) {
      return
    }
    void useKanbanStore.getState().hydrateFromRemote()
  }, [canLoadRemote, session?.access_token])

  useEffect(() => {
    if (session == null) {
      clearOnSignOut()
    }
  }, [session, clearOnSignOut])

  if (authRequired && !isReady) {
    return (
      <div className="app-shell app-auth-loading" role="status" aria-live="polite">
        Loading…
      </div>
    )
  }

  if (authRequired && !session) {
    return (
      <div className="app-shell">
        {authScreen === "login" ? (
          <LoginPage onRequestSignUp={() => setAuthScreen("signup")} />
        ) : (
          <SignUpPage onRequestSignIn={() => setAuthScreen("login")} />
        )}
      </div>
    )
  }

  if (authRequired && session != null && !persistHydrated) {
    return (
      <div className="app-shell app-auth-loading" role="status" aria-live="polite">
        Loading…
      </div>
    )
  }

  if (authRequired && session != null && !onboardingComplete) {
    return (
      <div className="app-shell">
        <OnboardingPage userId={sessionUserId} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Board />
    </div>
  )
}