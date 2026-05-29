from sqlalchemy import ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    age: Mapped[int] = mapped_column(Integer)
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(255))
    subjects: Mapped[list[str]] = mapped_column(JSON, default=list)
    subject_grades: Mapped[dict[str, str]] = mapped_column(JSON, default=dict)
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="student")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))
    subjects: Mapped[list[str]] = mapped_column(JSON, default=list)
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.id"))
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"))
    student: Mapped[Student] = relationship(back_populates="enrollments")
    course: Mapped[Course] = relationship(back_populates="enrollments")