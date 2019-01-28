const WebSocket = require("ws");
const ReconnectingWebsocket = require("reconnecting-websocket");

const cabUrl = "ws://192.168.1.94:12749";
const clientUrl = "ws://192.168.1.94:8080";

let cabinet = null;
let client = null;

function attemptCabinetConnection() {
  cabinet = new WebSocket(cabUrl);
  setCabinetEvents();
}
function attemptClientConnection() {
  client = new WebSocket(clientUrl);
  setClientEvents();
}

attemptCabinetConnection();
attemptClientConnection();

setInterval(() => {
  checkConnections();
}, 5000);

function checkConnections() {
  if (!cabinet || cabinet.readyState == WebSocket.CLOSED) {
    attemptCabinetConnection();
  }
  if (!client || client.readyState == WebSocket.CLOSED) {
    attemptClientConnection();
  }
}

function setCabinetEvents() {
  if (cabinet !== null) {
    cabinet.on("open", () => {
      if (cabinet.readyState === WebSocket.OPEN) {
        cabinet.send("Connected");
      }
    });

    cabinet.on("message", e => {
      if (client && client.readyState === WebSocket.OPEN) {
        cabinet.send("Keep alive");
        client.send(e);
      }
    });

    cabinet.on("close", () => {
      console.log("Cabinet closed");
      // checkConnections();
    });

    cabinet.on("error", err => {
      console.log("Cabinet error handles");
    });
  }
}

function setClientEvents() {
  if (client !== null) {
    client.on("open", () => {
      console.log("Open event called");
      if (client && client.readyState === WebSocket.OPEN) {
        client.send("Connected");
      }
    });

    client.on("close", (code, reason) => {
      console.log("Client closed");
      // checkConnections();
    });

    client.on("error", err => {
      console.log("Client error handled");
    });
  }
}
