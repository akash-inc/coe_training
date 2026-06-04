import {
  buildLargeSeedPayload,
  buildSmallSeedPayload,
  type PopulatePayload,
} from './seedData'

async function postPopulate(payload: PopulatePayload): Promise<{
  message: string
  students_added: number
  courses_added: number
  enrollments_added: number
}> {
  const response = await fetch('/populate-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Seed failed (${response.status})`)
  }
  return response.json()
}

export async function seedSmallDemoData() {
  return postPopulate(buildSmallSeedPayload())
}

export async function seedLargeDemoData() {
  const payload = buildLargeSeedPayload(50, 200, 40)
  return postPopulate(payload)
}

/** @deprecated Use seedSmallDemoData */
export async function seedDemoData() {
  return seedSmallDemoData()
}
