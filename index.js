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

  // 原来的 !test 指令（暂时保留）
  if (message.content === "!test") {
    try {
      const response = await axios.post(
        "http://localhost:8000/execute",
        {
          action: "open",
          url: "https://polymarket.com"
        },
        { timeout: 60000 }
      );
      message.reply(response.data.result);
    } catch (err) {
      console.error(err);
      message.reply("失败: " + err.message);
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
