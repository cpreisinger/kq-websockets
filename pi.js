const WebSocket = require("ws");
const fs = require("fs");
const moment = require("moment");
const _ = require("lodash");

let fileData = fs.readFileSync(process.argv[2]);
let configData = JSON.parse(fileData);

let cabinets = [];
let servers = [];

// Initialization functions to get data structures setup
function intializeObjects() {
  initializeCabinetObjects()
  initializeServerObjects()
}

function initializeCabinetObjects() {
  configData.cabinets.forEach(function(cabinetConfig) {
    cabinets.push({
      id: cabinetConfig.id,
      config: cabinetConfig,
      socket: null
    })
  })
}

function initializeServerObjects() {
  configData.servers.forEach(function(serverConfig) {
    servers.push({
      id: serverConfig.id,
      config: serverConfig,
      socket: null
    })
  })
}

// Connection functions
function initialConnections() {
  initialCabinetConnections()
  initialServerConnections()
}

function initialCabinetConnections() {
  cabinets.forEach(function(cabinet) {
    connectToCabinet(cabinet)
  });
}

function initialServerConnections() {
  servers.forEach(function(server) {
    connectToServer(server);
  });
}

function connectToCabinet(cabinet) {
  let { config } = cabinet;
  let { enabled, protocol, ip, port } = config;

  if (enabled == true) {
    // Construct socket url
    cabinetUrl = `${protocol}://${ip}:${port}`;

    // Create new socket object
    cabinet.socket = new WebSocket(cabinetUrl);

    // Sets events on new websocket
    setCabinetEvents(cabinet);
  }
}

function connectToServer(server) {
  let { config } = server;
  let { enabled, protocol, ip, port } = config;

  if (enabled == true) {
    // Construct socket url
    serverUrl = `${protocol}://${ip}:${port}`;

    // Create new socket object
    server.socket = new WebSocket(serverUrl);

    // Sets events on new websocket
    setServerEvents(server);
  }
}

// Websocket event listeners
function setCabinetEvents(cabinet) {
  let { id, config, socket } = cabinet
  const {name, code, token} = config

  if (socket !== null) {
    socket.on("open", () => {
      if (socket.readyState === WebSocket.OPEN) {
        console.log(
          `${moment().format("llll")} Cabinet ${id} connected`
        );

        _.each(servers, (server) => {
          const {socket} = server

          if (socket && socket.readyState === WebSocket.OPEN) {
            const message = createMessage("cabinetOnline", [
              name, code, token
            ], cabinet, server);

            socket.send(message);
          }
        })
      }
    });

    socket.on("message", message => {
      const parsedMessage = message.match(/!\[k\[(.+)\],v\[(.*)?\]\]!/);

      if (parsedMessage[1] == "alive") {
        if (socket.readyState === WebSocket.OPEN) {
          const aliveMessage = "![k[im alive],v[null]]!";
          socket.send(aliveMessage);
        }
      } else {
        _.each(servers, (server) => {
          const {config, socket} = server
          const {debug} = config

          if (socket && socket.readyState === WebSocket.OPEN) {
            const message = createMessage(parsedMessage[1], parsedMessage[2].split(","), cabinet, server)

            if (debug) {
              socket.send(message);
            } else {
              socket.send(`${moment.now()} = ${message}`);
            }
          }
        })
      }
    });

    socket.on("close", () => {
      console.log(
        `${moment().format("llll")} Cabinet ${id} disconnected`
      );

      _.each(servers, (server) => {
        const {socket} = server

        if (socket && socket.readyState === WebSocket.OPEN) {
          const message = createMessage("cabinetOffline", [
            name, code, token
          ], cabinet, server);

          socket.send(message);
        }
      })
    });

    socket.on("error", err => {
      console.log(
        `${moment().format("llll")} Cabinet ${id} error`,
        err
      );
    });
  }
}

function setServerEvents(server) {
  let { id, socket } = server

  if (socket !== null) {
    socket.on("open", () => {
      console.log(`${moment().format("llll")} Server ${id} connected`);

      _.each(cabinets, (cabinet) => {
        const {name, code, token} = cabinet.config
        if (socket && socket.readyState === WebSocket.OPEN) {

          const message = createMessage("piOnline", [
            name, code, token
          ], cabinet, server);

          socket.send(message);
        }
      })

      heartbeat.bind(this);
    });

    socket.on("close", (code, reason) => {
      console.log(
        `${moment().format("llll")} Server ${id} disconnected`,
        code,
        reason
      );
      socket = null;

      clearTimeout(this.pingTimeout);
    });

    socket.on("error", err => {
      console.log(`${moment().format("llll")} Server ${id} error`, err);
      socket = null;
    });
  }
}

function checkConnections() {
  cabinets.forEach(function(cabinet) {
    if (
      cabinet.socket === null ||
      cabinet.socket.readyState == WebSocket.CLOSED
    ) {
      connectToCabinet(cabinet);
    }
  });

  servers.forEach(function(server) {
    if (
      server.socket === null ||
      server.socket.readyState == WebSocket.CLOSED
    ) {
      connectToServer(server);
    }
  });
}

intializeObjects()
initialConnections()

setInterval(() => {
  checkConnections();
}, 5000);

function heartbeat() {
  clearTimeout(this.pingTimeout);

  // Use `WebSocket#terminate()` and not `WebSocket#close()`. Delay should be
  // equal to the interval at which your server sends out pings plus a
  // conservative assumption of the latency.
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

// Creates message based on keys and values depending on version set
function createMessage(key, values, cabinet, server) {
  const {version: gameVersion, code, token} = cabinet.config
  const {version: messageVersion} = server.config

  switch(messageVersion) {
    case "1":
      return `${moment.now()} = ![k[${key}],v[${values.join(",")}]]!`;
    case "2":
      let message = {
        time: moment.now(),
        code: code,
        token: token,
        version: gameVersion,
        key: key,
        values: values
      }
      return JSON.stringify(message)
    default: 
      return `${moment.now()} = ![k[${key}],v[${values.join(",")}]]!`;
  }
}
