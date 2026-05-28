from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas import (
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

@app.post("/populate-all", response_model=PopulateAllCreate)
def populate_all(payload: PopulateAllCreate, db: Session = Depends(get_db)):
    if payload.reset:
        db.query(Student).delete()
        db.query(Course).delete()
        db.query(Enrollment).delete()
    db.commit()
    seeded_students = [create_student(student, db) for student in payload.students]
    seeded_courses = [create_course(course, db) for course in payload.courses]
    seeded_enrollments = [create_enrollment(enrollment, db) for enrollment in payload.enrollments]
    db.add_all(seeded_students + seeded_courses + seeded_enrollments)
    db.commit()
    return payload