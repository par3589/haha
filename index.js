require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials 
} = require("discord.js");
const { GoogleGenAI } = require("@google/genai");

/* ===============================
   创建客户端（全开调试）
================================ */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

/* ===============================
   启动信息
================================ */
console.log("====== 启动终极调试模式 ======");
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "已加载" : "未加载");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "已加载" : "未加载");

/* ===============================
   初始化 Gemini
================================ */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* ===============================
   监听所有原始 Gateway 事件
================================ */
client.on("raw", (packet) => {
  if (packet.t === "MESSAGE_CREATE") {
    console.log("🔥 收到 MESSAGE_CREATE 原始事件");
  }
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
   监听消息
================================ */
client.on("messageCreate", async (message) => {

  console.log("📩 收到 messageCreate 事件");
  console.log("频道：", message.channel?.name);
  console.log("内容：", message.content);
  console.log("服务器：", message.guild?.name);

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

      console.log("Gemini 成功返回");
      return message.reply("🤖 AI回复：\n" + response.text);

    } catch (err) {
      console.error("Gemini 错误：", err);
      return message.reply("❌ AI 调用失败：" + err.message);
    }
  }

});

/* ===============================
   错误监听
================================ */
client.on("error", (err) => {
  console.error("Discord 客户端错误：", err);
});

process.on("unhandledRejection", (err) => {
  console.error("未处理 Promise 错误：", err);
});

/* ===============================
   登录
================================ */
client.login(process.env.DISCORD_TOKEN);
