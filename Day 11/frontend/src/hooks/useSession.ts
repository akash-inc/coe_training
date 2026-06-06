import { useCallback, useEffect, useState } from 'react'
import {
  clearStoredTokens,
  fetchGithubAuthEnabled,
  getStoredAccessToken,
  getStoredRefreshToken,
  logout,
} from '../api'
import { completeGithubLoginOnce, resolveGithubCallbackFromUrl } from '../auth/githubCallback'

interface UseSessionOptions {
  path: string
  navigate: (to: string) => void
  loadData: () => Promise<void>
  clearData: () => void
  showToast: (message: string, isError?: boolean) => void
}

export function useSession({
  path,
  navigate,
  loadData,
  clearData,
  showToast,
}: UseSessionOptions) {
  const [loading, setLoading] = useState(true)
  const [githubCallback, setGithubCallback] = useState(path === '/auth/callback')
  const [githubAuthEnabled, setGithubAuthEnabled] = useState(false)

  const restoreSession = useCallback(async () => {
    if (!getStoredRefreshToken() && !getStoredAccessToken()) {
      if (path === '/dashboard') navigate('/')
      setLoading(false)
      return
    }

    try {
      await loadData()
      if (path !== '/dashboard') navigate('/dashboard')
    } catch {
      clearStoredTokens()
      clearData()
      navigate('/')
      showToast('Session expired', true)
    } finally {
      setLoading(false)
    }
  }, [clearData, loadData, navigate, path, showToast])

  const handleGithubCallback = useCallback(async () => {
    setGithubCallback(true)

    const outcome = resolveGithubCallbackFromUrl()
    if (outcome.status === 'error') {
      navigate('/')
      showToast(outcome.message, true)
      setGithubCallback(false)
      setLoading(false)
      return
    }

    try {
      await completeGithubLoginOnce(async () => {
        await loadData()
        navigate('/dashboard')
        showToast('Logged in with GitHub')
      })
    } catch {
      clearStoredTokens()
      clearData()
      navigate('/')
      showToast('GitHub sign-in failed', true)
    } finally {
      setGithubCallback(false)
      setLoading(false)
    }
  }, [clearData, loadData, navigate, showToast])

  useEffect(() => {
    if (path === '/auth/callback') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- OAuth return URL handled once on load
      void handleGithubCallback()
      return
    }
    void restoreSession()
  }, [handleGithubCallback, path, restoreSession])

  useEffect(() => {
    if (path !== '/' && path !== '/auth/callback') return
    void fetchGithubAuthEnabled().then((result) => setGithubAuthEnabled(result.enabled))
  }, [path])

  const signOut = useCallback(async () => {
    await logout()
    clearData()
    navigate('/')
  }, [clearData, navigate])

  const onLoginSuccess = useCallback(async () => {
    await loadData()
    navigate('/dashboard')
  }, [loadData, navigate])

  return {
    loading,
    githubCallback,
    githubAuthEnabled,
    signOut,
    onLoginSuccess,
  }
}
