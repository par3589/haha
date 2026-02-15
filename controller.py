import requests
import time
import pyautogui
import os

SERVER_URL = "https://haha-production-9b07.up.railway.app/command"

print("控制程序启动成功...")

while True:
    try:
        response = requests.get(SERVER_URL)
        command = response.text.strip()

        if command == "open_notepad":
            print("收到打开记事本指令")
            os.system("notepad")
            time.sleep(2)

        elif command == "move_mouse":
            print("收到移动鼠标指令")
            pyautogui.moveTo(500, 500, duration=1)

        time.sleep(2)

    except Exception as e:
        print("错误:", e)
        time.sleep(5)

