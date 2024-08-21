require('dotenv').config();
const WebSocket = require('ws');

const oAuth = process.env.OAUTH_TOKEN;
const nick = "ldkasjhgflkasjhdfkl";
const channel = "KaiCenat";

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', event => {
    console.log(event.data);
    if (event.data.includes("Hello World")) socket.send(`PRIVMSG #${channel} :cringe`);
    if (event.data.includes("PING")) socket.send("PONG");
});
