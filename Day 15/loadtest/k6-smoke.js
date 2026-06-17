/**
 * Day 15 API load smoke test (k6)
 *
 * Usage:
 *   k6 run loadtest/k6-smoke.js
 *   BASE_URL=https://your-api.up.railway.app k6 run loadtest/k6-smoke.js
 *
 * Prerequisites: backend running with demo credentials from .env.example
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000'
const DEMO_EMAIL = __ENV.DEMO_EMAIL || 'test@example.com'
const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'password'

const errorRate = new Rate('errors')
const taskListDuration = new Trend('task_list_duration', true)
const taskCreateDuration = new Trend('task_create_duration', true)
const commentsListDuration = new Trend('comments_list_duration', true)
const authFailures = new Counter('auth_failures')

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    task_list_duration: ['p(95)<500'],
    task_create_duration: ['p(95)<1000'],
  },
}

function login() {
  const res = http.post(
    `${BASE_URL}/token`,
    JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /token' } },
  )

  const ok = check(res, {
    'login status 200': (r) => r.status === 200,
    'login returns access_token': (r) => {
      try {
        return JSON.parse(r.body).access_token !== undefined
      } catch {
        return false
      }
    },
  })

  if (!ok) {
    authFailures.add(1)
    errorRate.add(1)
    return null
  }

  return JSON.parse(res.body).access_token
}

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export default function () {
  const token = login()
  if (!token) {
    sleep(1)
    return
  }

  const headers = authHeaders(token)

  const listRes = http.get(`${BASE_URL}/tasks`, {
    headers,
    tags: { name: 'GET /tasks' },
  })
  taskListDuration.add(listRes.timings.duration)
  const listOk = check(listRes, { 'list tasks 200': (r) => r.status === 200 })
  errorRate.add(!listOk)

  let taskId = 1
  try {
    const tasks = JSON.parse(listRes.body)
    if (Array.isArray(tasks) && tasks.length > 0) {
      taskId = tasks[0].id
    }
  } catch {
    // use default task id 1 from seed data
  }

  const createRes = http.post(
    `${BASE_URL}/tasks`,
    JSON.stringify({
      title: `Load test ${__VU}-${__ITER}-${Date.now()}`,
      description: 'Created by k6 smoke test',
    }),
    { headers, tags: { name: 'POST /tasks' } },
  )
  taskCreateDuration.add(createRes.timings.duration)
  const createOk = check(createRes, { 'create task 201': (r) => r.status === 201 })
  errorRate.add(!createOk)

  if (createOk) {
    try {
      taskId = JSON.parse(createRes.body).id
    } catch {
      // keep existing taskId
    }
  }

  const commentsRes = http.get(`${BASE_URL}/tasks/${taskId}/comments`, {
    headers,
    tags: { name: 'GET /tasks/{id}/comments' },
  })
  commentsListDuration.add(commentsRes.timings.duration)
  const commentsOk = check(commentsRes, {
    'list comments 200': (r) => r.status === 200,
  })
  errorRate.add(!commentsOk)

  sleep(0.5)
}

export function handleSummary(data) {
  const lines = [
    'Day 15 k6 smoke test summary',
    `BASE_URL: ${BASE_URL}`,
    `http_req_duration p95: ${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) ?? 'n/a'} ms`,
    `errors rate: ${((data.metrics.errors?.values?.rate ?? 0) * 100).toFixed(2)}%`,
    `auth_failures: ${data.metrics.auth_failures?.values?.count ?? 0}`,
  ]
  return {
    stdout: lines.join('\n') + '\n',
  }
}
