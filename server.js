const port = process.argv[2] ? process.argv[2] : 8080;
const version = process.argv[3] ? process.argv[3] : 1;

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: port });

wss.on("connection", ws => {
  ws.on("message", message => {
    switch (version) {
      case "2":
        parsedMessage = JSON.parse(message)
        console.log(message);
        console.log(parsedMessage.time)
        console.log(parsedMessage.code)
        console.log(parsedMessage.token)
        console.log(parsedMessage.version)
        console.log(parsedMessage.key)
        console.log(parsedMessage.values)
        break;
      default:
        console.log(message);
        break;
    }
  });
});
