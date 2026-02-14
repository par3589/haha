require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenAI } = require("@google/genai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

client.once('clientReady', () => {
  console.log("机器人上线成功 🚀");
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let content = message.content.trim();
  if (!content.startsWith("帮我")) return;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content
    });

    // ✅ 兼容写法
    const reply =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "没有生成内容";

    await message.reply(reply.slice(0, 1900));

  } catch (error) {
    console.error("详细错误：", error);
    await message.reply("出错了 😢");
  }
});

client.login(process.env.DISCORD_TOKEN);
