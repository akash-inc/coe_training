import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { Session } from "@supabase/supabase-js"
import { AuthContext, type AuthContextValue } from "./authContext"
import { getAuthDisplayName } from "../lib/auth/getAuthDisplayName"
import { fetchProfileRole, type AppRole } from "../lib/supabase/fetchProfileRole"
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase/client"

type AuthProviderProps = { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = getSupabaseClient()
  const authRequired = isSupabaseConfigured() && supabase != null

  const [isReady, setIsReady] = useState(!authRequired)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<AppRole>("user")
  const activeUserIdRef = useRef<string | null>(null)

  const loadSessionAndRole = useCallback(
    async (s: Session | null) => {
      const nextUserId = s?.user.id ?? null
      activeUserIdRef.current = nextUserId
      setSession(s)
      if (s == null || supabase == null) {
        setRole("user")
        return
      }
      const userId = s.user.id
      const r = await fetchProfileRole(supabase, userId)
      if (activeUserIdRef.current !== userId) {
        return
      }
      setRole(r)
    },
    [supabase],
  )

  useEffect(() => {
    if (!authRequired || supabase == null) {
      return
    }

    let cancelled = false

    void (async () => {
      const { data } = await supabase.auth.getSession()
      if (cancelled) {
        return
      }
      await loadSessionAndRole(data.session)
      setIsReady(true)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (cancelled) {
          return
        }
        if (event === "SIGNED_OUT" || newSession == null) {
          await loadSessionAndRole(null)
          setIsReady(true)
          return
        }
        await loadSessionAndRole(newSession)
        setIsReady(true)
      },
    )

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [authRequired, supabase, loadSessionAndRole])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (supabase == null) {
        return { error: "Supabase is not configured." }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error != null) {
        return { error: error.message }
      }
      return { error: null }
    },
    [supabase],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (supabase == null) {
        return { error: "Supabase is not configured." }
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error != null) {
        return { error: error.message }
      }
      if (data.session != null) {
        return { error: null, needsEmailConfirmation: false }
      }
      return { error: null, needsEmailConfirmation: true }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    if (supabase == null) {
      return
    }
    await supabase.auth.signOut()
    const {
      data: { session: after },
    } = await supabase.auth.getSession()
    await loadSessionAndRole(after)
  }, [supabase, loadSessionAndRole])

  const user = session?.user ?? null
  const displayName = useMemo(
    () => (user == null ? "" : getAuthDisplayName(user)),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      authRequired,
      isReady,
      user,
      session,
      displayName: authRequired ? displayName : "",
      role: authRequired ? role : "user",
      isAdmin: authRequired && role === "admin",
      signIn,
      signUp,
      signOut,
    }),
    [
      authRequired,
      isReady,
      user,
      session,
      displayName,
      role,
      signIn,
      signUp,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
