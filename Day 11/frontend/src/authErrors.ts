const GITHUB_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'GitHub sign-in was cancelled',
  invalid_oauth_state: 'GitHub sign-in expired. Please try again',
  github_auth_failed: 'GitHub sign-in failed. Check your OAuth app settings',
}

export function githubAuthErrorMessage(code: string): string {
  return GITHUB_ERROR_MESSAGES[code] ?? `GitHub sign-in failed (${code})`
}
