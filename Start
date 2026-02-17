// start.js - 同时启动 Python FastAPI 和 Node.js Discord Bot
const { spawn } = require("child_process");

// 启动 Python FastAPI（local_agent.py）
const python = spawn("uvicorn", ["local_agent:app", "--host", "0.0.0.0", "--port", "8000"], {
  stdio: "inherit",
  shell: true
});

python.on("error", (err) => {
  console.error("Python 启动失败:", err.message);
});

// 等待 Python 服务就绪后再启动 Node
setTimeout(() => {
  const node = spawn("node", ["index.js"], {
    stdio: "inherit",
    shell: true
  });

  node.on("error", (err) => {
    console.error("Node 启动失败:", err.message);
  });
}, 3000); // 等 3 秒让 Python 先起来
