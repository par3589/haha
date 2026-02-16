from fastapi import FastAPI
from pydantic import BaseModel
from playwright.async_api import async_playwright

app = FastAPI()

class Command(BaseModel):
    action: str
    url: str | None = None

@app.post("/execute")
async def execute(cmd: Command):
    return {"result": "test ok"}
