import ast
import asyncio
import logging
import subprocess

from fastapi import HTTPException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def validate_python_code(code: str):
    try:
        ast.parse(code)
    except SyntaxError as e:
        logger.error(f"Syntax error: {e}")
        raise HTTPException(status_code=400, detail=f"Syntax error: {e}")


async def validate_javascript_code(code: str):
    try:
        result = subprocess.run(
            ["node", "js_syntax_check.js", code],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail="Failed to parse JavaScript code: " + result.stderr.strip())
    except subprocess.TimeoutExpired:
        logger.error("JavaScript syntax check timed out")
        raise HTTPException(status_code=504, detail="JavaScript syntax check timed out")


async def validate_cpp_code(code: str):
    try:
        result = subprocess.run(
            ["clang", "-fsyntax-only", "-x", "c++", "-"],
            input=code,
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail="Failed to parse C++ code: " + result.stderr.strip())
    except subprocess.TimeoutExpired:
        logger.error("C++ syntax check timed out")
        raise HTTPException(status_code=504, detail="C++ syntax check timed out")
