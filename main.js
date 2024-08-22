require('dotenv').config();
const WebSocket = require('ws');

const oAuth = process.env.OAUTH_TOKEN;
const nick = "ldkasjhgflkasjhdfkl";
const channel = "KaiCenat"; //Insert twitch streamer here

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

let messageCount = 0;
let interval = 10000; // 10 seconds

socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', event => {
    console.log(messageCount);
    // Count the incoming messages
    messageCount++;

    if (event.data.includes("PING")) socket.send("PONG");
});

// Set an interval to measure and log the message rate every 10 seconds
setInterval(() => {
    console.log(`Messages in the last ${interval / 1000} seconds: ${messageCount}`);
    // Reset the message count after logging
    messageCount = 0;
}, interval);
