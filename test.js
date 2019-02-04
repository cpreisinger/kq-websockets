require("dotenv").config();
var config = require("./config");
const WebSocket = require("ws");
const moment = require("moment");
// const io = require("socket.io")();
const websocket = require("websocket");

const cabUrl = "ws://kq.local:12749";
const cabinet = new WebSocket(cabUrl);

cabinet.on("open", message => {
  console.log(message);
});
cabinet.on("message", message => {
  const parsedMessage = message.match(/!\[k\[(.+)\],v\[(.*)?\]\]!/);
  console.log(`${moment.now()} = ${message}`);

  if (parsedMessage[1] == "alive") {
    const aliveMessage = "![k[im alive],v[null]]!";
    cabinet.send(aliveMessage);
  }
});

// function attemptCabinetConnection() {
//   const client = new websocket.client();
//   client.connect(cabUrl);
//   console.log(client);
//   // io.connect(cabUrl);
//   console.log("Attempting connect");
//   // cabinet = new WebSocket(cabUrl);
//   // setCabinetEvents();
//   client.on("connect", connection => {
//     this.connection = connection;
//
//     connection.on("message", data => {
//       console.log(data);
//       // console.log(this.connection);
//
//       const buffer = Buffer.from("I'm ok", "utf8");
//       this.connection.send(buffer);
//     });
//     connection.on("close", why => {
//       console.log(why);
//     });
//     connection.on("error", err => {
//       console.log(err);
//     });
//   });
// }

// attemptCabinetConnection();
//
// function checkConnections() {
//   if (!cabinet || cabinet.readyState == WebSocket.CLOSED) {
//     attemptCabinetConnection();
//   }
// }
//
// function setCabinetEvents() {
//   if (cabinet !== null) {
//     cabinet.on("open", e => {
//       console.log(e);
//       console.log("Connected");
//     });
//
//     cabinet.on("message", (e, x) => {
//       if (!cabinet || cabinet.readyState == WebSocket.OPEN) {
//         const msg = "![k['im alive'],v[null]]!";
//         const message = Buffer.from(msg, "utf8");
//         cabinet.send(message);
//       }
//       console.log(e, x);
//     });
//
//     cabinet.on("close", (reason, err) => {
//       console.log(reason, err);
//       console.log("Cabinet disconnected");
//     });
//
//     cabinet.on("error", err => {
//       console.log(err);
//       console.log("Cabinet error");
//     });
//   }
// }
