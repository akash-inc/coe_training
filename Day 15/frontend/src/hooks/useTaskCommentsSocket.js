import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiBaseUrl } from '../lib/apiBase'
import { tracingQueryParams } from '../lib/requestTracing'
import { WS_MESSAGE_TYPES } from '../lib/wsMessageTypes'

const MAX_RECONNECT_DELAY_MS = 30_000

function getWebSocketUrl(taskId, token) {
  const params = new URLSearchParams(
    tracingQueryParams({ token }),
  )

  const wsHost = import.meta.env.VITE_API_WS_HOST
  if (wsHost) {
    return `${wsHost.replace(/\/$/, '')}/ws/tasks/${taskId}?${params}`
  }

  const apiBase = getApiBaseUrl()
  if (apiBase) {
    const wsBase = apiBase.replace(/^http/, 'ws')
    return `${wsBase}/ws/tasks/${taskId}?${params}`
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/tasks/${taskId}?${params}`
}

export function useTaskCommentsSocket(
  taskId,
  token,
  {
    onCommentCreated,
    onCommentUpdated,
    onCommentDeleted,
    onCommentsSnapshot,
    onSocketError,
    onAuthError,
  } = {},
) {
  const wsRef = useRef(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimerRef = useRef(null)
  const onCommentCreatedRef = useRef(onCommentCreated)
  const onCommentUpdatedRef = useRef(onCommentUpdated)
  const onCommentDeletedRef = useRef(onCommentDeleted)
  const onCommentsSnapshotRef = useRef(onCommentsSnapshot)
  const onSocketErrorRef = useRef(onSocketError)
  const onAuthErrorRef = useRef(onAuthError)
  const canConnect = Boolean(taskId && token)
  const [connectionStatus, setConnectionStatus] = useState('closed')
  const status = canConnect ? connectionStatus : 'closed'

  useEffect(() => {
    onCommentCreatedRef.current = onCommentCreated
  }, [onCommentCreated])

  useEffect(() => {
    onCommentUpdatedRef.current = onCommentUpdated
  }, [onCommentUpdated])

  useEffect(() => {
    onCommentDeletedRef.current = onCommentDeleted
  }, [onCommentDeleted])

  useEffect(() => {
    onCommentsSnapshotRef.current = onCommentsSnapshot
  }, [onCommentsSnapshot])

  useEffect(() => {
    onSocketErrorRef.current = onSocketError
  }, [onSocketError])

  useEffect(() => {
    onAuthErrorRef.current = onAuthError
  }, [onAuthError])

  const sendComment = useCallback((body) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false
    }

    ws.send(JSON.stringify({ type: WS_MESSAGE_TYPES.COMMENT_CREATE, body }))
    return true
  }, [])

  useEffect(() => {
    if (!canConnect) {
      return
    }

    let cancelled = false

    function clearReconnectTimer() {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    function detachSocket(ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
    }

    function scheduleReconnect() {
      if (cancelled) return

      const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, MAX_RECONNECT_DELAY_MS)
      reconnectAttemptRef.current += 1
      setConnectionStatus('reconnecting')

      reconnectTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          connect()
        }
      }, delay)
    }

    function connect() {
      if (cancelled) return

      setConnectionStatus(reconnectAttemptRef.current > 0 ? 'reconnecting' : 'connecting')

      const ws = new WebSocket(getWebSocketUrl(taskId, token))
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) {
          detachSocket(ws)
          if (ws.readyState === WebSocket.OPEN) {
            ws.close()
          }
          return
        }

        reconnectAttemptRef.current = 0
        setConnectionStatus('open')
      }

      ws.onmessage = (event) => {
        if (cancelled) return

        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          return
        }

        if (data.type === WS_MESSAGE_TYPES.COMMENTS_SNAPSHOT && Array.isArray(data.comments)) {
          onCommentsSnapshotRef.current?.(data.comments)
          return
        }

        if (data.type === WS_MESSAGE_TYPES.COMMENT_CREATED && data.comment) {
          onCommentCreatedRef.current?.(data.comment)
          return
        }

        if (data.type === WS_MESSAGE_TYPES.COMMENT_UPDATED && data.comment) {
          onCommentUpdatedRef.current?.(data.comment)
          return
        }

        if (data.type === WS_MESSAGE_TYPES.COMMENT_DELETED && data.comment_id != null) {
          onCommentDeletedRef.current?.(data.comment_id)
          return
        }

        if (data.type === WS_MESSAGE_TYPES.ERROR && data.message) {
          onSocketErrorRef.current?.(data.message)
        }
      }

      ws.onclose = (event) => {
        if (wsRef.current === ws) {
          wsRef.current = null
        }

        if (cancelled) return

        if (event.code === 1008) {
          setConnectionStatus('closed')
          onAuthErrorRef.current?.()
          return
        }

        setConnectionStatus('closed')
        scheduleReconnect()
      }

      ws.onerror = () => {
        if (!cancelled) {
          setConnectionStatus('closed')
        }
      }
    }

    reconnectAttemptRef.current = 0
    connect()

    return () => {
      cancelled = true
      clearReconnectTimer()
      reconnectAttemptRef.current = 0

      const ws = wsRef.current
      if (ws) {
        detachSocket(ws)
        // Avoid closing while CONNECTING: React Strict Mode cleanup causes EPIPE on the Vite proxy.
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
      wsRef.current = null
      setConnectionStatus('closed')
    }
  }, [canConnect, taskId, token])

  return { sendComment, status }
}
