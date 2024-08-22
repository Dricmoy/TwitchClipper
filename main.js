require('dotenv').config();
const WebSocket = require('ws');

const oAuth = process.env.OAUTH_TOKEN;
const nick = "ldkasjhgflkasjhdfkl";
const channel = "KaiCenat"; // Insert twitch streamer here

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

let messageCount = 0;
let interval = 10000; // 10 seconds
let avgRate = 0; // Initialize average rate
let totalIntervals = 0; // Counter to calculate average rate over time
let clipTriggered = false;

socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', event => {
    // Count the incoming messages
    messageCount++;

    if (event.data.includes("PING")) socket.send("PONG");
});

// Set an interval to measure and log the message rate every 10 seconds
setInterval(() => {
    console.log(`Messages in the last ${interval / 1000} seconds: ${messageCount}`);

    // Update the total intervals count
    totalIntervals++;

    // Calculate the new average rate using a simple moving average formula
    avgRate = ((avgRate * (totalIntervals - 1)) + messageCount) / totalIntervals;
    console.log(`Average message rate: ${avgRate.toFixed(2)}`);

    // Check if the current message rate exceeds the average by 20
    if (messageCount > avgRate + 20 && !clipTriggered) {
        console.log("Message rate exceeds average by 20, triggering clip...");
        clipTriggered = true;

        // Add logic to trigger Twitch API for clipping here

        // Reset clipTriggered after some time or based on other criteria
        setTimeout(() => {
            clipTriggered = false;
        }, interval);
    }

    // Reset the message count after logging
    messageCount = 0;
}, interval);
