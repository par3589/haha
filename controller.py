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

  if (message.content === "!test") {
    try {
      const response = await axios.post(
        "https://saying-veterinary-cdna-police.trycloudflare.com/execute",
        {
          action: "open",
          url: "https://polymarket.com"
        }
      );

      message.reply(response.data.result);
    } catch (err) {
      console.error(err);
      message.reply("失败: " + err.message);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
