require("dotenv").config();

const WebSocket = require("ws");
const moment = require("moment");

const cabUrl =
  process.env.KQ_PROTOCOL +
  "://" +
  process.env.KQ_HOST +
  ":" +
  process.env.KQ_PORT;

const clientUrl =
  process.env.CLIENT_PROTOCOL +
  "://" +
  process.env.CLIENT_HOST +
  ":" +
  process.env.CLIENT_PORT;

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
        console.log(moment().format("llll") + " Cabinet connected");

        if (client && client.readyState === WebSocket.OPEN) {
          const message = createMessage("cabinetOnline", [
            process.env.SCENE_NAME,
            process.env.SCENE_CODE,
            process.env.SCENE_TOKEN
          ]);
          client.send(message);
        }
      }
    });

    cabinet.on("message", message => {
      const parsedMessage = message.match(/!\[k\[(.+)\],v\[(.*)?\]\]!/);
      if (parsedMessage[1] == "alive") {
        if (cabinet.readyState === WebSocket.OPEN) {
          const aliveMessage = "![k[im alive],v[null]]!";
          cabinet.send(aliveMessage);
        }
      } else {
        if (client && client.readyState === WebSocket.OPEN) {
          if (process.env.DEBUG) {
            client.send(message);
          } else {
            client.send(`${moment.now()} = ${message}`);
          }
        }
      }
    });

    cabinet.on("close", () => {
      console.log(moment().format("llll") + " Cabinet disconnected");
      if (client && client.readyState === WebSocket.OPEN) {
        const message = createMessage("cabinetOffline", [
          process.env.SCENE_NAME,
          process.env.SCENE_CODE,
          process.env.SCENE_TOKEN
        ]);
        client.send(message);
      }
      cabinet = null;
    });

    cabinet.on("error", err => {
      console.log(moment().format("llll") + " Cabinet error", err);
      cabinet = null;
    });
  }
}

function heartbeat() {
  clearTimeout(this.pingTimeout);

  // Use `WebSocket#terminate()` and not `WebSocket#close()`. Delay should be
  // equal to the interval at which your server sends out pings plus a
  // conservative assumption of the latency.
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

function setClientEvents() {
  if (client !== null) {
    client.on("open", () => {
      console.log(moment().format("llll") + " Client connected");
      if (client && client.readyState === WebSocket.OPEN) {
        const message = createMessage("piOnline", [
          process.env.SCENE_NAME,
          process.env.SCENE_CODE,
          process.env.SCENE_TOKEN
        ]);
        client.send(message);
      }
      heartbeat.bind(this);
    });

    client.on("close", (code, reason) => {
      console.log(
        moment().format("llll") + " Client disconnected",
        code,
        reason
      );
      client = null;

      clearTimeout(this.pingTimeout);
    });

    client.on("error", err => {
      console.log(moment().format("llll") + " Client error", err);
      client = null;
    });
  }
}

function createMessage(key, values) {
  const message = `${moment.now()} = ![k[${key}],v[${values.join(",")}]]!`;
  return message;
}
