var config = require("./config");

const WebSocket = require("ws");
const moment = require("moment");

const cabUrl = "ws://" + config.kq_host + ":" + config.kq_port;
const clientUrl = "ws://" + config.client_host + ":" + config.client_port;

let cabinet = null;
let client = null;

let cabinetHealthCheck = null;
let clientHealthCheck = null;

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
        console.log("Cabinet connected");
        cabinet.send("PI connected");

        if (client && client.readyState === WebSocket.OPEN) {
          const message = createMessage("cabinetOnline", [
            config.scene_name,
            config.scene_code,
            config.scene_token
          ]);
          client.send(message);
        }

        // cabinetHealthCheck = setInterval(() => {
        //   cabinet.send("Keep Alive");
        // }, config.keep_alive_interval);
      }
    });

    cabinet.on("message", e => {
      cabinet.send("PI alive");
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(e);
      }
    });

    cabinet.on("close", () => {
      console.log("Cabinet disconnected");
      if (client && client.readyState === WebSocket.OPEN) {
        const message = createMessage("cabinetOffline", [
          config.scene_name,
          config.scene_code,
          config.scene_token
        ]);
        client.send(message);
      }
      clearInterval(cabinetHealthCheck);
    });

    cabinet.on("error", err => {
      console.log("Cabinet error");
      clearInterval(cabinetHealthCheck);
    });
  }
}

function setClientEvents() {
  if (client !== null) {
    client.on("open", () => {
      console.log("Client connected");
      if (client && client.readyState === WebSocket.OPEN) {
        const message = createMessage("connected", [
          config.scene_name,
          config.scene_code,
          config.scene_token
        ]);
        client.send(message);
      }
    });

    client.on("close", (code, reason) => {
      console.log("Client disconnected");
    });

    client.on("error", err => {
      console.log("Client error");
    });
  }
}

function createMessage(key, values) {
  const message = `${moment.now()} = ![k[${key}],v[${values.join(",")}]]!`;
  return message;
}
