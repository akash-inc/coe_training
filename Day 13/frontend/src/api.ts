import {
  buildLargeSeedPayload,
  buildSmallSeedPayload,
  type PopulatePayload,
} from './seedData'

async function postPopulate(
  path: string,
  payload: PopulatePayload,
): Promise<{
  message: string
  students_added: number
  courses_added: number
  enrollments_added: number
}> {
  const response = await fetch(path, {
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
  return postPopulate('/populate-all', buildSmallSeedPayload())
}

export async function seedLargeDemoData() {
  return postPopulate('/populate-all', buildLargeSeedPayload(50, 200, 40))
}

export async function seedLargeBulkDemoData() {
  return postPopulate('/populate-all-bulk', buildLargeSeedPayload(50, 200, 40))
}

/** @deprecated Use seedSmallDemoData */
export async function seedDemoData() {
  return seedSmallDemoData()
}
