const GITHUB_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'GitHub sign-in was cancelled',
  invalid_oauth_state: 'GitHub sign-in expired. Please try again',
  github_auth_failed: 'GitHub sign-in failed. Check API logs and database migrations',
}

export function githubAuthErrorMessage(code: string, detail?: string | null): string {
  if (code === 'github_auth_failed' && detail) {
    return `${GITHUB_ERROR_MESSAGES[code]} (${detail.replace(/_/g, ' ')})`
  }
  return GITHUB_ERROR_MESSAGES[code] ?? `GitHub sign-in failed (${code})`
}
