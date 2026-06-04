from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from models import Course, Student
from schemas import CourseCreate, StudentCreate


def pg_upsert_student(db: Session, student: StudentCreate) -> Student:
    data = student.model_dump()
    stmt = insert(Student).values(**data)
    excluded = stmt.excluded
    stmt = stmt.on_conflict_do_update(
        index_elements=["email"],
        set_={
            "name": excluded.name,
            "age": excluded.age,
            "phone": excluded.phone,
            "subjects": excluded.subjects,
            "subject_grades": excluded.subject_grades,
        },
    ).returning(Student)
    result = db.execute(stmt).scalar_one()
    db.commit()
    db.refresh(result)
    return result


def pg_upsert_course(db: Session, course: CourseCreate) -> Course:
    data = course.model_dump()
    stmt = insert(Course).values(**data)
    excluded = stmt.excluded
    stmt = stmt.on_conflict_do_update(
        index_elements=["name"],
        set_={
            "description": excluded.description,
            "subjects": excluded.subjects,
        },
    ).returning(Course)
    result = db.execute(stmt).scalar_one()
    db.commit()
    db.refresh(result)
    return result
