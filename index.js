require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ 改成你自己的 Discord 用户ID（纯数字）
const OWNER_ID = "1471789285983260672";

let currentCommand = "";

// ===== HTTP SERVER =====
app.get('/', (req, res) => {
    res.send("Bot is running");
});

// 电脑端轮询接口
app.get('/command', (req, res) => {
    const cmd = currentCommand;
    currentCommand = "";
    res.send(cmd);
});

app.listen(PORT, () => {
    console.log("Web server running on port " + PORT);
});

// ===== DISCORD BOT =====
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('clientReady', () => {
    console.log('机器人上线成功 🚀');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    // 🔒 只允许你自己控制
    if (message.author.id !== OWNER_ID) return;

    // 打开记事本
    if (message.content === "!open") {
        currentCommand = "open_notepad";
        message.reply("已发送打开记事本指令");
    }

    // 移动鼠标
    if (message.content === "!mouse") {
        currentCommand = "move_mouse";
        message.reply("已发送移动鼠标指令");
    }

    // 查看当前命令
    if (message.content === "!status") {
        message.reply("当前命令：" + (currentCommand || "无"));
    }

    // 清空命令
    if (message.content === "!clear") {
        currentCommand = "";
        message.reply("命令已清空");
    }
});

client.login(process.env.DISCORD_TOKEN);
