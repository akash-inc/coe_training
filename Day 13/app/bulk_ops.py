from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import Course, Enrollment, Student
from schemas import PopulateAllCreate


def bulk_populate_all(db: Session, payload: PopulateAllCreate) -> dict:
    if payload.reset:
        db.query(Enrollment).delete()
        db.query(Course).delete()
        db.query(Student).delete()
        db.commit()

    if payload.students:
        db.bulk_insert_mappings(Student, [item.model_dump() for item in payload.students])
    if payload.courses:
        db.bulk_insert_mappings(Course, [item.model_dump() for item in payload.courses])
    db.flush()

    students_by_email = {item.email: item for item in db.query(Student).all()}
    courses_by_name = {item.name: item for item in db.query(Course).all()}

    enrollment_rows: list[dict[str, int]] = []
    for enrollment_link in payload.enrollments:
        if enrollment_link.student_ref >= len(payload.students):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid student_ref: {enrollment_link.student_ref}",
            )
        if enrollment_link.course_ref >= len(payload.courses):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid course_ref: {enrollment_link.course_ref}",
            )

        student = students_by_email[payload.students[enrollment_link.student_ref].email]
        course = courses_by_name[payload.courses[enrollment_link.course_ref].name]
        enrollment_rows.append({"student_id": student.id, "course_id": course.id})

    if enrollment_rows:
        db.bulk_insert_mappings(Enrollment, enrollment_rows)

    db.commit()

    seeded_students = list(students_by_email.values())
    seeded_courses = list(courses_by_name.values())
    seeded_enrollments = db.query(Enrollment).all()

    return {
        "message": "Database populated successfully (bulk insert)",
        "students_added": len(seeded_students),
        "courses_added": len(seeded_courses),
        "enrollments_added": len(seeded_enrollments),
        "student_ids": [item.id for item in seeded_students],
        "course_ids": [item.id for item in seeded_courses],
        "enrollment_ids": [item.id for item in seeded_enrollments],
    }
