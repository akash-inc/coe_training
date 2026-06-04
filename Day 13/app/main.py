from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload, selectinload, subqueryload
from sqlalchemy.exc import SQLAlchemyError
from schemas import (
    BulkUpdatePayload,
    CourseCreate,
    CourseResponse,
    EnrollmentCreate,
    EnrollmentResponse,
    PopulateAllCreate,
    StudentCreate,
    StudentResponse,
)
from database import (
    Base,
    engine,
    get_db,
    get_db_unpooled,
    get_pool_status,
    ping_database,
)
from middleware import EXPOSED_HEADERS, SqlQueryCountMiddleware
from models import Student, Course, Enrollment
from queries import ENROLLMENT_COUNT_BY_COURSE_SLOW_SQL, ENROLLMENT_COUNT_BY_COURSE_SQL
from raw_db import fetch_enrollment_counts_raw

app = FastAPI(title="School Management System")
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

app.add_middleware(SqlQueryCountMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=EXPOSED_HEADERS,
)

Base.metadata.create_all(bind=engine)


def _upsert_student(student: StudentCreate, db: Session) -> Student:
    student_record = db.query(Student).filter(Student.email == student.email).first()
    if student_record is None:
        student_record = Student(**student.model_dump())
        db.add(student_record)
    else:
        student_record.name = student.name
        student_record.age = student.age
        student_record.phone = student.phone
        student_record.subjects = student.subjects
        student_record.subject_grades = student.subject_grades

    db.commit()
    db.refresh(student_record)
    return student_record


def _upsert_course(course: CourseCreate, db: Session) -> Course:
    course_record = db.query(Course).filter(Course.name == course.name).first()
    if course_record is None:
        course_record = Course(**course.model_dump())
        db.add(course_record)
    else:
        course_record.description = course.description
        course_record.subjects = course.subjects

    db.commit()
    db.refresh(course_record)
    return course_record


def _upsert_enrollment(enrollment: EnrollmentCreate, db: Session) -> Enrollment:
    student = db.query(Student).filter(Student.id == enrollment.student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment_record = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == enrollment.student_id,
            Enrollment.course_id == enrollment.course_id,
        )
        .first()
    )
    if enrollment_record is None:
        enrollment_record = Enrollment(**enrollment.model_dump())
        db.add(enrollment_record)

    db.commit()
    db.refresh(enrollment_record)
    return enrollment_record


def _build_courses_with_students_response(courses: list[Course]) -> list[dict]:
    result = []
    for course in courses:
        students = []
        for enrollment in course.enrollments:
            student = enrollment.student
            if student is None:
                continue
            students.append(
                {
                    "id": student.id,
                    "name": student.name,
                    "email": student.email,
                }
            )

        result.append(
            {
                "id": course.id,
                "name": course.name,
                "description": course.description,
                "subjects": course.subjects,
                "students": students,
            }
        )
    return result


@app.get("/health")
def health():
    return {"message": "Hello, World!"}


@app.get("/health/pool")
def health_pool():
    return get_pool_status()


@app.get("/benchmark/db-ping-pooled")
def benchmark_db_ping_pooled(db: Session = Depends(get_db)):
    ping_database(db)
    return {
        "mode": "pooled",
        "description": "Shared QueuePool — connections are checked out and returned",
        "pool": get_pool_status(),
    }


@app.get("/benchmark/db-ping-unpooled")
def benchmark_db_ping_unpooled(db: Session = Depends(get_db_unpooled)):
    ping_database(db)
    return {
        "mode": "unpooled",
        "description": "NullPool — opens a new TCP connection per request",
        "pool": {
            "pool_class": "NullPool",
            "pool_size": 0,
            "checked_out": 0,
            "checked_in": 0,
            "overflow": 0,
            "total_connections": 0,
        },
    }

@app.get("/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()


@app.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    return _upsert_student(student, db)


@app.get("/courses", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


@app.get("/courses-with-students-eager-joinedload")
def get_courses_with_students_eager_joinedload(db: Session = Depends(get_db)):
    # Best when result size is modest and you want everything in one SQL query.
    courses = (
        db.query(Course)
        .options(joinedload(Course.enrollments).joinedload(Enrollment.student))
        .all()
    )
    return _build_courses_with_students_response(courses)


@app.get("/courses-with-students-naive")
def get_courses_with_students_naive(db: Session = Depends(get_db)):
    # Intentionally lazy: touching relationships below triggers N+1 queries.
    courses = db.query(Course).all()
    return _build_courses_with_students_response(courses)


@app.get("/courses-with-students-selectin")
def get_courses_with_students_selectin(db: Session = Depends(get_db)):
    # Best general-purpose choice for one-to-many collections.
    # Load enrollments in batches, then join student on that secondary query.
    courses = (
        db.query(Course)
        .options(selectinload(Course.enrollments).joinedload(Enrollment.student))
        .all()
    )
    return _build_courses_with_students_response(courses)


@app.get("/courses-with-students-subquery")
def get_courses_with_students_subquery(db: Session = Depends(get_db)):
    # Alternative collection strategy using subquery loading for enrollments.
    courses = (
        db.query(Course)
        .options(subqueryload(Course.enrollments).joinedload(Enrollment.student))
        .all()
    )
    return _build_courses_with_students_response(courses)


@app.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    return _upsert_course(course, db)


@app.get("/enrollments", response_model=list[EnrollmentResponse])
def get_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).all()

@app.post("/enrollments", response_model=EnrollmentResponse)
def create_enrollment(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
    return _upsert_enrollment(enrollment, db)

@app.post("/populate-all")
def populate_all(payload: PopulateAllCreate, db: Session = Depends(get_db)):
    try:
        if payload.reset:
            db.query(Enrollment).delete()
            db.query(Course).delete()
            db.query(Student).delete()
            db.commit()

        seeded_students = [_upsert_student(student, db) for student in payload.students]
        seeded_courses = [_upsert_course(course, db) for course in payload.courses]
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
                _upsert_enrollment(
                    EnrollmentCreate(
                        student_id=seeded_students[enrollment_link.student_ref].id,
                        course_id=seeded_courses[enrollment_link.course_ref].id,
                    ),
                    db,
                )
            )
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to populate data") from error

    return {
        "message": "Database populated successfully",
        "students_added": len(seeded_students),
        "courses_added": len(seeded_courses),
        "enrollments_added": len(seeded_enrollments),
        "student_ids": [item.id for item in seeded_students],
        "course_ids": [item.id for item in seeded_courses],
        "enrollment_ids": [item.id for item in seeded_enrollments],
    }


@app.post("/bulk-update")
def bulk_update(payload: BulkUpdatePayload, db: Session = Depends(get_db)):
    try:
        student_updates = [
            item.model_dump(exclude_unset=True)
            for item in payload.students
            if len(item.model_dump(exclude_unset=True)) > 1
        ]
        course_updates = [
            item.model_dump(exclude_unset=True)
            for item in payload.courses
            if len(item.model_dump(exclude_unset=True)) > 1
        ]
        enrollment_updates = [
            item.model_dump(exclude_unset=True)
            for item in payload.enrollments
            if len(item.model_dump(exclude_unset=True)) > 1
        ]

        if student_updates:
            db.bulk_update_mappings(Student, student_updates)
        if course_updates:
            db.bulk_update_mappings(Course, course_updates)
        if enrollment_updates:
            db.bulk_update_mappings(Enrollment, enrollment_updates)

        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to bulk update data") from error

    return {
        "message": "Bulk update completed",
        "students_updated": len(student_updates),
        "courses_updated": len(course_updates),
        "enrollments_updated": len(enrollment_updates),
    }


def _enrollment_count_rows(db: Session, sql: str) -> list[dict]:
    rows = db.execute(text(sql))
    return [dict(row) for row in rows.mappings().all()]


@app.get("/report/course-enrollment-counts-slow")
def course_enrollment_counts_slow(db: Session = Depends(get_db)):
    return _enrollment_count_rows(db, ENROLLMENT_COUNT_BY_COURSE_SLOW_SQL)


@app.get("/report/course-enrollment-counts")
def course_enrollment_counts(db: Session = Depends(get_db)):
    return _enrollment_count_rows(db, ENROLLMENT_COUNT_BY_COURSE_SQL)


@app.get("/report/course-enrollment-counts-raw")
def course_enrollment_counts_raw(request: Request):
    request.state.db_pool_mode = "raw"
    rows = fetch_enrollment_counts_raw()
    request.state.sql_query_count = 1
    return rows


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")