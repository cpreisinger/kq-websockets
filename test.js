var config = require("./config");
const WebSocket = require("ws");
const moment = require("moment");
// const io = require("socket.io")();
const websocket = require("websocket");

const cabUrl = "ws://kq.local:12749";

let cabinet = null;

function attemptCabinetConnection() {
  const client = new websocket.client();
  client.connect(cabUrl);
  console.log(client);
  // io.connect(cabUrl);
  console.log("Attempting connect");
  // cabinet = new WebSocket(cabUrl);
  // setCabinetEvents();
  client.on("connect", connection => {
    this.connection = connection;

    connection.on("message", data => {
      console.log(data);
      // console.log(this.connection);

      const buffer = Buffer.from("I'm ok", "utf8");
      this.connection.send(buffer);
    });
    connection.on("close", why => {
      console.log(why);
    });
  });
}

attemptCabinetConnection();

function checkConnections() {
  if (!cabinet || cabinet.readyState == WebSocket.CLOSED) {
    attemptCabinetConnection();
  }
}

function setCabinetEvents() {
  if (cabinet !== null) {
    cabinet.on("open", e => {
      console.log(e);
      console.log("Connected");
    });

    cabinet.on("message", (e, x) => {
      if (!cabinet || cabinet.readyState == WebSocket.OPEN) {
        const msg = "![k['im alive'],v[null]]!";
        const message = Buffer.from(msg, "utf8");
        cabinet.send(message);
      }
      console.log(e, x);
    });

    cabinet.on("close", (reason, err) => {
      console.log(reason, err);
      console.log("Cabinet disconnected");
    });

    cabinet.on("error", err => {
      console.log(err);
      console.log("Cabinet error");
    });
  }
}
