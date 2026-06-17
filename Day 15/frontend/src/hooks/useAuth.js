import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout } from '../api/auth'
import { queryKeys } from '../api/queryKeys'
import { UnauthorizedError } from '../lib/apiClient'
import { getAccessToken, setTokens } from '../lib/tokenStorage'
import { fetchMe } from '../api/user'

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken())
  const [accessToken, setAccessToken] = useState(() => getAccessToken())
  const queryClient = useQueryClient()

  const handleSessionExpired = useCallback(async () => {
    await logout()
    setAccessToken(null)
    setIsLoggedIn(false)
    queryClient.removeQueries({ queryKey: queryKeys.me })
    queryClient.removeQueries({ queryKey: queryKeys.tasks })
    queryClient.removeQueries({ queryKey: queryKeys.commentsAll })
  }, [queryClient])

  const { mutate: loginMutate, isPending: loginPending, error: loginError } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setAccessToken(data.access_token)
      setIsLoggedIn(true)
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    },
  })

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: isLoggedIn,
    retry: (_, error) => !(error instanceof UnauthorizedError),
  })

  useEffect(() => {
    if (userError instanceof UnauthorizedError) {
      queueMicrotask(() => {
        void handleSessionExpired()
      })
    }
  }, [userError, handleSessionExpired])

  function handleLogin({ email, password }) {
    loginMutate({ email, password })
  }

  return {
    isLoggedIn,
    accessToken,
    user,
    userLoading,
    loginPending,
    loginError,
    handleLogin,
    handleSessionExpired,
  }
}
