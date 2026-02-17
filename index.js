require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

/* ===============================
   创建 Discord 客户端
================================ */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* ===============================
   初始化 Gemini
================================ */
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "已加载" : "未加载");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* ===============================
   Bot 启动
================================ */
client.once("clientReady", () => {
  console.log("✅ Bot 已上线");
});

/* ===============================
   消息监听
================================ */
client.on("messageCreate", async (message) => {

  console.log("📩 收到消息：", message.content);

  if (message.author.bot) return;

  /* ===============================
     1️⃣ 基础测试
  ================================= */
  if (message.content === "!ping") {
    console.log("执行 !ping");
    return message.reply("🏓 pong");
  }

  /* ===============================
     2️⃣ 测试 Gemini
  ================================= */
  if (message.content === "!test") {

    console.log("执行 !test");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: "请用一句话向我问好" }]
          }
        ]
      });

      console.log("Gemini 返回成功");

      return message.reply("🤖 AI回复：\n" + response.text);

    } catch (err) {
      console.error("Gemini 错误：", err);
      return message.reply("❌ AI 调用失败：" + err.message);
    }
  }

  /* ===============================
     3️⃣ 查询服务器 IP
  ================================= */
  if (message.content === "!ip") {
    try {
      const res = await axios.get("https://ifconfig.me/ip", {
        headers: { "User-Agent": "curl/7.0" }
      });
      return message.reply("🌐 服务器 IP：" + res.data);
    } catch (err) {
      return message.reply("❌ 查询失败：" + err.message);
    }
  }

  /* ===============================
     4️⃣ 分析 Polymarket
  ================================= */
  if (message.content === "!analyze") {

    const thinking = await message.reply("⏳ 正在分析市场...");

    try {

      const resp = await axios.get("https://gamma-api.polymarket.com/markets", {
        params: {
          active: "true",
          closed: "false",
          limit: 10,
          order: "volume24hr",
          ascending: "false"
        },
        timeout: 15000
      });

      const markets = resp.data;

      if (!markets || markets.length === 0) {
        return thinking.edit("❌ 无法获取市场数据");
      }

      const marketLines = markets.map(m => {

        const question = m.question || "未知问题";
        const volume = parseFloat(m.volume24hr || 0).toFixed(0);

        let outcomes = m.outcomes || [];
        let prices = m.outcomePrices || [];

        if (typeof outcomes === "string") {
          try { outcomes = JSON.parse(outcomes); } catch { outcomes = []; }
        }

        if (typeof prices === "string") {
          try { prices = JSON.parse(prices); } catch { prices = []; }
        }

        const options = outcomes.map((o, i) => {
          const pct = prices[i]
            ? (parseFloat(prices[i]) * 100).toFixed(1)
            : "?";
          return `${o}: ${pct}%`;
        }).join(" | ");

        return `问题：${question}
24h交易量：$${parseInt(volume).toLocaleString()}
赔率：${options || "暂无数据"}`;

      }).join("\n\n");

      const prompt = `你是专业预测市场分析师。

以下是当前交易量最高的10个市场：

${marketLines}

请分析：
1. 哪些市场存在赔率偏差？
2. 推荐1-3个值得关注的市场
3. 建议买 Yes 还是 No
4. 风险提示

500字以内中文回答。`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      });

      const output = "📊 市场分析：\n\n" + response.text;

      if (output.length > 1900) {
        return thinking.edit(output.substring(0, 1900) + "\n...(已截断)");
      }

      return thinking.edit(output);

    } catch (err) {
      console.error("分析错误：", err);
      return thinking.edit("❌ 分析失败：" + err.message);
    }
  }

});

/* ===============================
   登录 Discord
================================ */
client.login(process.env.DISCORD_TOKEN);
