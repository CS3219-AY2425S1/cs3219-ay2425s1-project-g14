import asyncio
import logging
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from parsers import validate_python_code, validate_javascript_code, validate_cpp_code

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


async def run_formatter(command: list, code: str, timeout: int = 5) -> str:
    try:
        if command[0] == "black":
            await validate_python_code(code)
        elif command[0] == "prettier":
            await validate_javascript_code(code)
        elif command[0] == "clang-format":
            await validate_cpp_code(code)

        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(input=code.encode()), timeout=timeout)

        if process.returncode != 0:
            error_message = stderr.decode().strip()
            logger.error(f"Formatter error: {error_message}")
            raise HTTPException(status_code=500, detail=f"Formatter error: {error_message}")

        return stdout.decode().strip()

    except HTTPException as http_err:
        raise http_err
    except asyncio.TimeoutError:
        logger.error("Timed out")
        raise HTTPException(status_code=504, detail="Timed out")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

class CodeFormatRequest(BaseModel):
    code: str

async def run_formatter(command: list, code: str, timeout: int = 5) -> str:
    try:
        if command[0] == "black":
            await validate_python_code(code)

        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(input=code.encode()), timeout=timeout)

        if process.returncode != 0:
            error_message = stderr.decode().strip()
            logger.error(f"Formatter error: {error_message}")
            raise HTTPException(status_code=500, detail=f"Formatter error: {error_message}")

        return stdout.decode().strip()

    except HTTPException as http_err:
        raise http_err
    except asyncio.TimeoutError:
        logger.error("Timed out")
        raise HTTPException(status_code=504, detail="Timed out")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/format/python")
async def format_python(request: CodeFormatRequest):
    print(request.code)
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