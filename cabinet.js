const WebSocket = require("ws");
const moment = require("moment");

const keepAliveInterval = 5000;

const port = process.argv[2] ? process.argv[2] : 12749;

const wss = new WebSocket.Server({ port });
const fs = require("fs");

const file = "sample_cabinet_events/events.txt";
// const file = "sample_cabinet_events/events-short-test.txt";

let aliveTimer = null;

var clients = [];

wss.on("connection", ws => {
  clients.push(ws);

  ws.on("message", message => {
    // console.log(message);
  });

  ws.on("close", () => {
    // Should kill client here from client list
  });
});

aliveTimer = setInterval(() => {
  aliveMessage();
}, keepAliveInterval);

function aliveMessage() {
  let message = `${moment.now()} = ![k[alive],v[${moment().format(
    "h:mm:ss A"
  )}]]!`;
  // console.log(message);
  clients.map(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function parseTimestamp(line) {
  return parseInt(line);
}

function parseFileLines(wss, file) {
  fs.readFile(file, "utf8", function(err, content) {
    var lines = content.split("\n");
    let timeout = 0;

    lines.map(function(line, i) {
      if (i != 0 && line != "") {
        let tm = parseTimestamp(lines[i - 1]);
        let ntm = parseInt(line);
        timeout = timeout + (ntm - tm);
      } else if (line == "") {
        setTimeout(function() {
          parseFileLines(wss, file);
        }, timeout + 1000);
      }

      if (line != "") {
        setTimeout(function() {
          // Disabled unless debugging
          console.log(line);
          clients.map(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(line);
            }
          });
        }, timeout);
      }
    });
  });
}

parseFileLines(wss, file);
