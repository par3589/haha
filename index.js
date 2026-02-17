require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

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
    const thinking = await message.reply("⏳ 正在分析 Polymarket 市场，请稍候约15秒...");
    try {
      const response = await axios.post(
        "http://localhost:8000/analyze",
        {},
        { timeout: 60000 }
      );
      // Discord 单条消息最多 2000 字，超出就截断
      const result = response.data.result;
      if (result.length > 1900) {
        await thinking.edit(result.substring(0, 1900) + "\n...(内容过长已截断)");
      } else {
        await thinking.edit(result);
      }
    } catch (err) {
      console.error(err);
      await thinking.edit("❌ 失败: " + err.message);
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
