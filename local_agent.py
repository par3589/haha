from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI()

class Command(BaseModel):
    action: str
    url: str | None = None

@app.post("/execute")
async def execute(cmd: Command):

    if cmd.action == "open" and cmd.url:
        os.system(f'start {cmd.url}')
        return {"result": f"打开成功：{cmd.url}"}

    return {"result": "未知指令"}
