from fastapi import FastAPI
import google.generativeai as genai
import httpx
import asyncio
import os

app = FastAPI()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


@app.post("/analyze")
async def analyze():
    """
    获取 Polymarket 热门市场数据，交给 Gemini 分析，返回投资建议
    """
    try:
        # 第一步：从 Gamma API 获取热门市场（按交易量排序，取前10）
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                "https://gamma-api.polymarket.com/markets",
                params={
                    "active": "true",
                    "closed": "false",
                    "limit": 10,
                    "order": "volume24hr",
                    "ascending": "false"
                }
            )
            markets = resp.json()

        if not markets:
            return {"result": "❌ 无法获取市场数据"}

        # 第二步：整理数据，提取关键信息
        market_info = []
        for m in markets:
            # 每个市场可能有多个选项（outcomes）
            question = m.get("question", "未知")
            volume = m.get("volume24hr", 0)
            outcomes = m.get("outcomes", [])
            prices = m.get("outcomePrices", [])

            # 把选项和价格配对
            options = []
            if outcomes and prices:
                for outcome, price in zip(outcomes, prices):
                    try:
                        pct = round(float(price) * 100, 1)
                        options.append(f"{outcome}: {pct}%")
                    except:
                        pass

            options_str = " | ".join(options) if options else "暂无价格"
            market_info.append(
                f"问题：{question}\n"
                f"24h交易量：${float(volume):,.0f}\n"
                f"当前赔率：{options_str}"
            )

        markets_text = "\n\n".join(market_info)

        # 第三步：交给 Gemini 分析
        analysis = await ask_gemini(markets_text)
        return {"result": analysis}

    except Exception as e:
        return {"result": f"❌ 错误：{str(e)}"}


async def ask_gemini(markets_text: str) -> str:
    if not GEMINI_API_KEY:
        return "❌ 未设置 GEMINI_API_KEY 环境变量"

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17")

    prompt = f"""你是一个预测市场分析师。以下是 Polymarket 当前交易量最高的10个预测市场数据：

{markets_text}

请分析这些市场，重点回答：
1. 哪些市场存在明显的价格偏差或套利机会？（赔率是否合理）
2. 推荐1-3个最值得关注的市场，说明理由
3. 每个推荐市场建议买 Yes 还是 No，以及理由
4. 风险提示

用中文回复，简洁清晰，控制在600字以内。"""

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: model.generate_content(prompt)
    )

    return f"📊 **Polymarket 市场分析**\n\n{response.text}"
