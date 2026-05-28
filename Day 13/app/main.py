from fastapi import FastAPI, HTTPException

from schemas import (
    CourseCreate,
    CourseResponse,
    EnrollmentCreate,
    EnrollmentResponse,
    PopulateAllCreate,
    StudentCreate,
    StudentResponse,
)

app = FastAPI(title="School Management System")

student_db = []
course_db = []
enrollment_db = []


def _next_id(items: list[dict]) -> int:
    if not items:
        return 1
    return max(item["id"] for item in items) + 1


@app.get("/")
def home():
    return {"message": "Hello, World!"}

@app.get("/students", response_model=list[StudentResponse])
def get_students():
    return student_db


@app.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate):
    student_record = {"id": _next_id(student_db), **student.model_dump()}
    student_db.append(student_record)
    return student_record


@app.get("/courses", response_model=list[CourseResponse])
def get_courses():
    return course_db


@app.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate):
    course_record = {
        "id": _next_id(course_db),
        "name": course.name,
        "description": course.description,
    }
    course_db.append(course_record)
    return course_record


@app.get("/enrollments", response_model=list[EnrollmentResponse])
def get_enrollments():
    return enrollment_db


@app.post("/populate-all")
def populate_all(payload: PopulateAllCreate):
    if payload.reset:
        student_db.clear()
        course_db.clear()
        enrollment_db.clear()

    seeded_students = [create_student(student) for student in payload.students]
    seeded_courses = [create_course(course) for course in payload.courses]

    seeded_enrollments = []
    for enrollment_link in payload.enrollments:
        if enrollment_link.student_ref >= len(seeded_students):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid student_ref: {enrollment_link.student_ref}",
            )
        if enrollment_link.course_ref >= len(seeded_courses):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid course_ref: {enrollment_link.course_ref}",
            )

        seeded_enrollments.append(
            create_enrollment(
                EnrollmentCreate(
                    student_id=seeded_students[enrollment_link.student_ref]["id"],
                    course_id=seeded_courses[enrollment_link.course_ref]["id"],
                )
            )
        )

    return {
        "message": "Database populated successfully",
        "students_added": len(seeded_students),
        "courses_added": len(seeded_courses),
        "enrollments_added": len(seeded_enrollments),
        "students": seeded_students,
        "courses": seeded_courses,
        "enrollments": seeded_enrollments,
    }


@app.post("/enrollments", response_model=EnrollmentResponse)
def create_enrollment(enrollment: EnrollmentCreate):
    student = next((item for item in student_db if item["id"] == enrollment.student_id), None)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    course = next((item for item in course_db if item["id"] == enrollment.course_id), None)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment_record = {
        "id": _next_id(enrollment_db),
        "student_id": student["id"],
        "course_id": course["id"],
    }
    enrollment_db.append(enrollment_record)
    return enrollment_record