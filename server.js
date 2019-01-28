const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 12749 });
const fs = require("fs");

const file = "data/events.txt";
// const file = "data/events-short-test.txt";

var clients = [];

// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };

wss.on("connection", ws => {
  // console.log("connected", ws);
  clients.push(ws);

  ws.on("message", message => {
    console.log("Message received");
    // Broadcast to everyone else.
    // wss.clients.forEach(function each(client) {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(data);
    //   }
    // });
  });

  ws.send("You connected!");
});

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
          console.log(line);
          console.log(clients.length);
          clients.map(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(line);
            }
          });
          // wss.broadcast = function broadcast(line) {
          // wss.clients.forEach(function each(client) {
          //   if (client.readyState === WebSocket.OPEN) {
          //     client.send(data);
          //   }
          // });
          // };
        }, timeout);
      }
    });
  });
}

parseFileLines(wss, file);

// function parseFileLines(wss, file) {
//   let timeout = 0;
//
//   fs.readFile(file, "utf8", function(err, content) {
//     let lines = content.split("\n");
//     let startTime = parseTimestamp(lines[0]);
//
//     lines.map(function(line, i) {
//       let timestamp = parseTimestamp(line);
//       setTimeout(function() {
//         if (isNaN(timestamp)) {
//           setTimeout(function() {
//             parseFileLines(wss, file);
//           }, parseTimestamp(lines[lines.length - 2] + 1000));
//         } else {
//           console.log(line);
//         }
//       }, timestamp - startTime);
//     });
//   });
// }
