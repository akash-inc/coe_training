import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
} from '../api'
import { githubAuthErrorMessage } from '../authErrors'

export type GithubCallbackOutcome =
  | { status: 'error'; message: string }
  | { status: 'ready' }

let loginCompletion: Promise<void> | null = null

function stripCallbackQueryFromUrl(): void {
  window.history.replaceState({}, '', '/auth/callback')
}

export function resolveGithubCallbackFromUrl(): GithubCallbackOutcome {
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')

  if (error) {
    stripCallbackQueryFromUrl()
    clearStoredTokens()
    return { status: 'error', message: githubAuthErrorMessage(error, params.get('detail')) }
  }

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken) {
    setStoredTokens(accessToken, refreshToken)
    stripCallbackQueryFromUrl()
    return { status: 'ready' }
  }

  if (getStoredAccessToken() && getStoredRefreshToken()) {
    return { status: 'ready' }
  }

  stripCallbackQueryFromUrl()
  return { status: 'error', message: 'GitHub sign-in failed' }
}

export async function completeGithubLoginOnce(loadSession: () => Promise<void>): Promise<void> {
  if (!loginCompletion) {
    loginCompletion = loadSession().finally(() => {
      loginCompletion = null
    })
  }
  await loginCompletion
}
