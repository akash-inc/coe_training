import type { User } from "@supabase/supabase-js"

/** Prefer profile metadata, then the email local part. */
export function getAuthDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fullName =
    typeof meta?.full_name === "string" ? meta.full_name.trim() : ""
  const name = typeof meta?.name === "string" ? meta.name.trim() : ""
  const fromMeta = fullName || name
  if (fromMeta.length > 0) {
    return fromMeta
  }
  const email = user.email?.trim() ?? ""
  if (email.length > 0) {
    const local = email.split("@")[0]
    if (local.length > 0) {
      return local
    }
  }
  return "Account"
}
