
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let currentCommand = "";

// ===== HTTP SERVER =====
app.get('/', (req, res) => {
    res.send("Bot is running");
});

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

client.once('ready', () => {
    console.log('机器人上线成功 🚀');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === "!open") {
        currentCommand = "open_notepad";
        message.reply("已发送打开记事本指令");
    }

    if (message.content === "!mouse") {
        currentCommand = "move_mouse";
        message.reply("已发送移动鼠标指令");
    }
});

client.login(process.env.DISCORD_TOKEN);
