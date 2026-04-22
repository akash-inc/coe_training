import { describe, expect, it } from "vitest"
import type { User } from "@supabase/supabase-js"
import { getAuthDisplayName } from "./getAuthDisplayName"

function u(partial: Partial<User> & { user_metadata?: Record<string, string> }): User {
  return partial as User
}

describe("getAuthDisplayName", () => {
  it("uses full_name from metadata", () => {
    expect(
      getAuthDisplayName(
        u({ user_metadata: { full_name: "  Ada Lovelace  " } }),
      ),
    ).toBe("Ada Lovelace")
  })

  it("uses name if full_name missing", () => {
    expect(
      getAuthDisplayName(
        u({ user_metadata: { name: "Grace" } }),
      ),
    ).toBe("Grace")
  })

  it("uses email local part as fallback", () => {
    expect(
      getAuthDisplayName(
        u({ email: "ada@example.com", user_metadata: {} }),
      ),
    ).toBe("ada")
  })
})
