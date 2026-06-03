const DEMO_POPULATE_PAYLOAD = {
  reset: true,
  students: [
    {
      name: 'Alice Example',
      age: 20,
      email: 'alice@example.com',
      phone: '+14155552671',
      subjects: ['Math'],
      subject_grades: { Math: 'A' },
    },
    {
      name: 'Bob Example',
      age: 21,
      email: 'bob@example.com',
      phone: '+14155552672',
      subjects: ['Math', 'Physics'],
      subject_grades: { Math: 'B+', Physics: 'A' },
    },
    {
      name: 'Carol Example',
      age: 19,
      email: 'carol@example.com',
      phone: '+14155552673',
      subjects: ['Math'],
      subject_grades: { Math: 'A+' },
    },
  ],
  courses: [
    {
      name: 'CS101',
      description: 'Introduction to computer science',
      subjects: ['Math'],
    },
    {
      name: 'CS201',
      description: 'Data structures',
      subjects: ['Math'],
    },
    {
      name: 'PHYS101',
      description: 'Mechanics',
      subjects: ['Physics'],
    },
  ],
  enrollments: [
    { student_ref: 0, course_ref: 0 },
    { student_ref: 0, course_ref: 1 },
    { student_ref: 1, course_ref: 0 },
    { student_ref: 1, course_ref: 2 },
    { student_ref: 2, course_ref: 1 },
  ],
}

export async function seedDemoData(): Promise<{ message: string }> {
  const response = await fetch('/populate-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(DEMO_POPULATE_PAYLOAD),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Seed failed (${response.status})`)
  }
  return response.json()
}
