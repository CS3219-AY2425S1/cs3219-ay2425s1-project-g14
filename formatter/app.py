import asyncio
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeFormatRequest(BaseModel):
    code: str

async def run_formatter(command: list, code: str, timeout: int = 5) -> str:
    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(input=code.encode()), timeout=timeout)

        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Formatter error: {stderr.decode().strip()}")

        return stdout.decode().strip()

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Formatter not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/format/python")
async def format_python(request: CodeFormatRequest):
    command = ["black", "-q", "-"]
    formatted_code = await run_formatter(command, request.code)
    return {"formatted_code": formatted_code}

@app.post("/format/cpp")
async def format_cpp(request: CodeFormatRequest):
    command = ["clang-format"]
    formatted_code = await run_formatter(command, request.code)
    return {"formatted_code": formatted_code}

@app.post("/format/javascript")
async def format_javascript(request: CodeFormatRequest):
    command = ["prettier", "--stdin-filepath", "file.js"]
    formatted_code = await run_formatter(command, request.code)
    return {"formatted_code": formatted_code}

@app.get("/")
async def hello_world():
    return {"Status": "Hello from formatter"}