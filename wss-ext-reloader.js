#!/usr/bin/env node

import minimist from "minimist";
import { WebSocket, WebSocketServer } from "ws";

const args = minimist(process.argv.slice(2));
const port = args.port || 3001; // Default to 3001 if no port is specified

const wss = new WebSocketServer({ port });
console.log(`WebSocket server started on port ${port}`);

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    let msg = Buffer.from(message, "base64").toString("utf-8");
    console.log("received:", msg);
    if (msg === "reload") {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send("reload");
          console.log("sent: reload");
        }
      });
    }
  });
});
