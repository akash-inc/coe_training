import type { OnboardingContext } from "./onboarding.machine"

/**
 * Build GoTrue `updateUser` payload. The caller fires the request and does
 * not await: `auth.updateUser` can hang in JS after the server has already
 * returned 200, so the UI must not block on that Promise.
 */
export function buildOnboardingUserData(
  context: OnboardingContext,
): Record<string, string> | null {
  const name = context.displayName.trim()
  if (name.length === 0) {
    return null
  }
  const data: Record<string, string> = {
    full_name: name,
  }
  if (context.useCase.length > 0) {
    data.onboarding_use_case = context.useCase
  }
  return data
}
