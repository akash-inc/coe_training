from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
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
from database import Base, engine, get_db
from models import Student, Course, Enrollment

app = FastAPI(title="School Management System")
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Hello, World!"}

@app.get("/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()


@app.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    student_record = Student(**student.model_dump())
    db.add(student_record)
    db.commit()
    db.refresh(student_record)
    return student_record


@app.get("/courses", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


@app.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    course_record = Course(**course.model_dump())
    db.add(course_record)
    db.commit()
    db.refresh(course_record)
    return course_record


@app.get("/enrollments", response_model=list[EnrollmentResponse])
def get_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).all()

@app.post("/enrollments", response_model=EnrollmentResponse)
def create_enrollment(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
    enrollment_record = Enrollment(**enrollment.model_dump())
    db.add(enrollment_record)
    db.commit()
    db.refresh(enrollment_record)
    return enrollment_record

@app.post("/populate-all")
def populate_all(payload: PopulateAllCreate, db: Session = Depends(get_db)):
    try:
        if payload.reset:
            db.query(Enrollment).delete()
            db.query(Course).delete()
            db.query(Student).delete()

        student_mappings = [student.model_dump() for student in payload.students]
        course_mappings = [course.model_dump() for course in payload.courses]

        if student_mappings:
            db.bulk_insert_mappings(Student, student_mappings, return_defaults=True)
        if course_mappings:
            db.bulk_insert_mappings(Course, course_mappings, return_defaults=True)

        enrollment_mappings = []
        for enrollment_link in payload.enrollments:
            if enrollment_link.student_ref >= len(student_mappings):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid student_ref: {enrollment_link.student_ref}",
                )
            if enrollment_link.course_ref >= len(course_mappings):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid course_ref: {enrollment_link.course_ref}",
                )

            enrollment_mappings.append(
                {
                    "student_id": student_mappings[enrollment_link.student_ref]["id"],
                    "course_id": course_mappings[enrollment_link.course_ref]["id"],
                }
            )

        if enrollment_mappings:
            db.bulk_insert_mappings(Enrollment, enrollment_mappings, return_defaults=True)

        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to populate data") from error

    return {
        "message": "Database populated successfully",
        "students_added": len(student_mappings),
        "courses_added": len(course_mappings),
        "enrollments_added": len(enrollment_mappings),
        "student_ids": [item["id"] for item in student_mappings],
        "course_ids": [item["id"] for item in course_mappings],
        "enrollment_ids": [item["id"] for item in enrollment_mappings],
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