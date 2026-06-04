export interface PopulatePayload {
  reset: boolean
  students: Array<{
    name: string
    age: number
    email: string
    phone: string
    subjects: string[]
    subject_grades: Record<string, string>
  }>
  courses: Array<{
    name: string
    description: string
    subjects: string[]
  }>
  enrollments: Array<{ student_ref: number; course_ref: number }>
}

const SMALL_SEED: PopulatePayload = {
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

export function buildSmallSeedPayload(): PopulatePayload {
  return structuredClone(SMALL_SEED)
}

export function buildLargeSeedPayload(
  courseCount = 50,
  enrollmentCount = 200,
  studentCount = 40,
): PopulatePayload {
  const students = Array.from({ length: studentCount }, (_, index) => ({
    name: `Student ${index + 1}`,
    age: 18 + (index % 10),
    email: `student${index + 1}@lab.example`,
    phone: `+1415555${String(3000 + index).padStart(4, '0')}`,
    subjects: ['Math'] as string[],
    subject_grades: { Math: 'B+' },
  }))

  const courses = Array.from({ length: courseCount }, (_, index) => ({
    name: `Course ${String(index + 1).padStart(3, '0')}`,
    description: `Benchmark course ${index + 1} for N+1 and report demos`,
    subjects: ['Math'] as string[],
  }))

  const enrollments: Array<{ student_ref: number; course_ref: number }> = []
  const seen = new Set<string>()
  let studentRef = 0
  let courseRef = 0

  while (enrollments.length < enrollmentCount) {
    const key = `${studentRef}-${courseRef}`
    if (!seen.has(key)) {
      seen.add(key)
      enrollments.push({ student_ref: studentRef, course_ref: courseRef })
    }
    courseRef = (courseRef + 1) % courseCount
    if (courseRef === 0) {
      studentRef = (studentRef + 1) % studentCount
    }
  }

  return {
    reset: true,
    students,
    courses,
    enrollments,
  }
}
