const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const fs = require("fs");

let clients = [];

wss.on("connection", ws => {
  // console.log("connected", ws);
  // clients.push(ws);
  ws.on("message", message => {
    console.log(message);
    //   // Broadcast to everyone else.
    //   // wss.clients.forEach(function each(client) {
    //   //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //   //     client.send(data);
    //   //   }
    //   // });
  });
  // ws.on("close", () => {
  //   console.log("Disconnected");
  // });
  //
  // ws.send("You connected!");
});
