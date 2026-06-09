from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import create_access_token, get_current_user

app = FastAPI()

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

class Task(BaseModel):
    id: int
    title: str
    description: str
    completed: bool

@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

@app.get("/me")
async def current_user(current_user: str = Depends(get_current_user)):
    return {
    "email": current_user,
    }

@app.get("/tasks")
async def get_tasks(current_user: str = Depends(get_current_user)):
    return [
        {
            "id": 1,
            "title": "Task 1",
            "description": "Task 1 description",
            "completed": False,
        },
    ]

@app.post("/token")
async def login(data:LoginRequest):
    if data.email != "test@example.com" or data.password != "password":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({
        "sub": data.email,
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }