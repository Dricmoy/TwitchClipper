require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

const oAuth = process.env.OAUTH_TOKEN;
const clientId = process.env.CLIENT_ID;
const broadcasterId = process.env.BROADCASTER_ID;
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

// Function to create a clip using the Twitch API
const createClip = () => {
    const options = {
        hostname: 'api.twitch.tv',
        path: `/helix/clips?broadcaster_id=${broadcasterId}`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${oAuth}`,
            'Client-Id': clientId,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            const response = JSON.parse(data);
            const clipId = response.data[0].id;
            const editUrl = response.data[0].edit_url;

            console.log(`Clip created successfully: ${clipId}`);
            console.log(`Edit your clip here: ${editUrl}`);
        });
    });

    req.on('error', (error) => {
        console.error('Error creating clip:', error.message);
    });

    req.end();
};

// Set an interval to measure and log the message rate every 10 seconds
setInterval(() => {
    console.log(`Messages in the last ${interval / 1000} seconds: ${messageCount}`);

    // Update the total intervals count
    totalIntervals++;

    // Calculate the new average rate using a simple moving average formula
    avgRate = ((avgRate * (totalIntervals - 1)) + messageCount) / totalIntervals;
    console.log(`Average message rate: ${avgRate.toFixed(2)}`);

    // Check if the current message rate exceeds the average by 20
    if (messageCount > avgRate + 20) {
        console.log("Message rate exceeds average by 20, triggering clip...");

        // Trigger the clip creation
        createClip();

        // Reset clipTriggered after some time or based on other criteria
        setTimeout(() => {}, 20000);
    }
    // Reset the message count after logging
    messageCount = 0;
}, interval);

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
