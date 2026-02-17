require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

client.once("ready", () => {
  console.log("Bot 已上线");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // 查询服务器 IP
  if (message.content === "!ip") {
    try {
      const res = await axios.get("https://ifconfig.me/ip", {
        headers: { "User-Agent": "curl/7.0" }
      });
      message.reply("🌐 服务器IP：" + res.data);
    } catch (err) {
      message.reply("查询失败：" + err.message);
    }
  }

  // 分析 Polymarket 热门市场
  if (message.content === "!analyze") {
    const thinking = await message.reply("⏳ 正在分析 Polymarket 市场，请稍候...");
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
        await thinking.edit("❌ 无法获取市场数据");
        return;
      }

      // 整理市场信息（修复：outcomes 可能是 JSON 字符串）
      const marketLines = markets.map(m => {
        const question = m.question || "未知";
        const volume = parseFloat(m.volume24hr || 0).toFixed(0);

        // outcomes 和 outcomePrices 可能是字符串需要解析
        let outcomes = m.outcomes || [];
        let prices = m.outcomePrices || [];
        if (typeof outcomes === "string") {
          try { outcomes = JSON.parse(outcomes); } catch { outcomes = []; }
        }
        if (typeof prices === "string") {
          try { prices = JSON.parse(prices); } catch { prices = []; }
        }

        const options = outcomes.map((o, i) => {
          const pct = prices[i] ? (parseFloat(prices[i]) * 100).toFixed(1) : "?";
          return `${o}: ${pct}%`;
        }).join(" | ");

        return `问题：${question}\n24h交易量：$${parseInt(volume).toLocaleString()}\n赔率：${options || "暂无"}`;
      }).join("\n\n");

      // 交给 Gemini 分析
      const prompt = `你是预测市场分析师。以下是 Polymarket 当前交易量最高的10个市场：

${marketLines}

请分析：
1. 哪些市场赔率存在明显偏差或机会？
2. 推荐1-3个最值得关注的市场，说明理由
3. 建议买 Yes 还是 No，理由是什么
4. 风险提示

用中文回复，控制在500字以内。`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt
      });

      const result = response.text;
      const output = `📊 **Polymarket 市场分析**\n\n${result}`;

      if (output.length > 1900) {
        await thinking.edit(output.substring(0, 1900) + "\n...(已截断)");
      } else {
        await thinking.edit(output);
      }

    } catch (err) {
      console.error(err);
      await thinking.edit("❌ 失败: " + err.message);
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
