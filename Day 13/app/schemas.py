from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator

Name = Annotated[str, Field(min_length=1, max_length=100)]
CourseDescription = Annotated[str, Field(min_length=1, max_length=500)]
Email = Annotated[str, Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
Phone = Annotated[str, Field(pattern=r"^\+?[1-9]\d{7,14}$")]
SubjectName = Annotated[str, Field(min_length=1, max_length=100)]
SubjectList = Annotated[list[SubjectName], Field(min_length=1, max_length=20)]
PositiveId = Annotated[int, Field(ge=1)]
Age = Annotated[int, Field(ge=3, le=120)]
GradeValue = Annotated[str, Field(pattern=r"^(A\+|A|B\+|B|C|D|F)$")]
SubjectGrades = dict[SubjectName, GradeValue]


class StudentBase(BaseModel):
    name: Name
    age: Age
    email: Email
    phone: Phone
    subjects: SubjectList
    subject_grades: SubjectGrades = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_subject_grades(self):
        if not self.subject_grades:
            return self

        subjects_set = set(self.subjects)
        grade_subjects_set = set(self.subject_grades.keys())

        extra_subjects = grade_subjects_set - subjects_set
        missing_subjects = subjects_set - grade_subjects_set

        if extra_subjects:
            raise ValueError(
                "subject_grades contains subjects not present in subjects: "
                f"{sorted(extra_subjects)}"
            )
        if missing_subjects:
            raise ValueError(
                "subject_grades is missing grades for subjects: "
                f"{sorted(missing_subjects)}"
            )
        return self


class StudentResponse(StudentBase):
    id: PositiveId
    model_config = ConfigDict(from_attributes=True)


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Name | None = None
    age: Age | None = None
    email: Email | None = None
    phone: Phone | None = None
    subjects: SubjectList | None = None
    subject_grades: SubjectGrades | None = None


class CourseBase(BaseModel):
    name: Name
    description: CourseDescription
    subjects: SubjectList


class CourseResponse(CourseBase):
    id: PositiveId
    model_config = ConfigDict(from_attributes=True)


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Name | None = None
    description: CourseDescription | None = None
    subjects: SubjectList | None = None


class EnrollmentResponse(BaseModel):
    id: PositiveId
    student_id: PositiveId
    course_id: PositiveId
    model_config = ConfigDict(from_attributes=True)


class EnrollmentCreate(BaseModel):
    student_id: PositiveId
    course_id: PositiveId


class EnrollmentUpdate(BaseModel):
    student_id: PositiveId | None = None
    course_id: PositiveId | None = None


class EnrollmentBulkLinkCreate(BaseModel):
    student_ref: Annotated[int, Field(ge=0)]
    course_ref: Annotated[int, Field(ge=0)]


class PopulateAllCreate(BaseModel):
    reset: bool = True
    students: list[StudentCreate] = Field(default_factory=list)
    courses: list[CourseCreate] = Field(default_factory=list)
    enrollments: list[EnrollmentBulkLinkCreate] = Field(default_factory=list)