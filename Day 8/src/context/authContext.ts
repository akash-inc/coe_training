import { createContext } from "react"
import type { Session, User } from "@supabase/supabase-js"
import type { AppRole } from "../lib/supabase/fetchProfileRole"

export type SignUpResult =
  | { error: null; needsEmailConfirmation: boolean }
  | { error: string; needsEmailConfirmation?: never }

export type AuthContextValue = {
  authRequired: boolean
  isReady: boolean
  user: User | null
  session: Session | null
  /** Name for UI: metadata `full_name` / `name`, else email local part. */
  displayName: string
  role: AppRole
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
