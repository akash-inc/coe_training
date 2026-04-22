import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

export type AppRole = "user" | "admin"

export async function fetchProfileRole(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<AppRole> {
  const { data, error } = await client
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error != null || data == null) {
    return "user"
  }
  const role = (data as { role: AppRole }).role
  return role === "admin" ? "admin" : "user"
}
