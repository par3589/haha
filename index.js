require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
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
  ],
  partials: [Partials.Channel]
});

/* ===============================
   启动信息
================================ */
console.log("===== 启动调试模式 =====");
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "已加载" : "未加载");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "已加载" : "未加载");

/* ===============================
   初始化 Gemini
================================ */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* ===============================
   Bot Ready
================================ */
client.once("clientReady", () => {
  console.log("✅ Bot 已上线");

  console.log("当前所在服务器数量：", client.guilds.cache.size);

  client.guilds.cache.forEach(guild => {
    console.log("服务器名称：", guild.name);
    console.log("服务器ID：", guild.id);
  });
});

/* ===============================
   监听所有消息
================================ */
client.on("messageCreate", async (message) => {

  console.log("收到消息事件");
  console.log("频道：", message.channel?.name);
  console.log("内容：", message.content);
  console.log("来自服务器：", message.guild?.name);

  if (message.author.bot) return;

  /* ===== !ping ===== */
  if (message.content.trim() === "!ping") {
    console.log("执行 !ping");
    return message.reply("🏓 pong");
  }

  /* ===== !test ===== */
  if (message.content.trim() === "!test") {
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

});

/* ===============================
   登录
================================ */
client.login(process.env.DISCORD_TOKEN);
