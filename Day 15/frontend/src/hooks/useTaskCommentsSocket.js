import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiBaseUrl } from '../lib/apiBase'

const MAX_RECONNECT_DELAY_MS = 30_000

function getWebSocketUrl(taskId, token) {
  const wsHost = import.meta.env.VITE_API_WS_HOST
  if (wsHost) {
    return `${wsHost.replace(/\/$/, '')}/ws/tasks/${taskId}?token=${encodeURIComponent(token)}`
  }

  const apiBase = getApiBaseUrl()
  if (apiBase) {
    const wsBase = apiBase.replace(/^http/, 'ws')
    return `${wsBase}/ws/tasks/${taskId}?token=${encodeURIComponent(token)}`
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/tasks/${taskId}?token=${encodeURIComponent(token)}`
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
  const [status, setStatus] = useState('closed')

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

    ws.send(JSON.stringify({ type: 'comment.create', body }))
    return true
  }, [])

  useEffect(() => {
    if (!taskId || !token) {
      setStatus('closed')
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
      setStatus('reconnecting')

      reconnectTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          connect()
        }
      }, delay)
    }

    function connect() {
      if (cancelled) return

      setStatus(reconnectAttemptRef.current > 0 ? 'reconnecting' : 'connecting')

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
        setStatus('open')
      }

      ws.onmessage = (event) => {
        if (cancelled) return

        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          return
        }

        if (data.type === 'comments.snapshot' && Array.isArray(data.comments)) {
          onCommentsSnapshotRef.current?.(data.comments)
          return
        }

        if (data.type === 'comment.created' && data.comment) {
          onCommentCreatedRef.current?.(data.comment)
          return
        }

        if (data.type === 'comment.updated' && data.comment) {
          onCommentUpdatedRef.current?.(data.comment)
          return
        }

        if (data.type === 'comment.deleted' && data.comment_id != null) {
          onCommentDeletedRef.current?.(data.comment_id)
          return
        }

        if (data.type === 'error' && data.message) {
          onSocketErrorRef.current?.(data.message)
        }
      }

      ws.onclose = (event) => {
        if (wsRef.current === ws) {
          wsRef.current = null
        }

        if (cancelled) return

        if (event.code === 1008) {
          setStatus('closed')
          onAuthErrorRef.current?.()
          return
        }

        setStatus('closed')
        scheduleReconnect()
      }

      ws.onerror = () => {
        if (!cancelled) {
          setStatus('closed')
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
      setStatus('closed')
    }
  }, [taskId, token])

  return { sendComment, status }
}
