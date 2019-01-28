// var app = require("express")();
var http = require("http");
// var io = require("socket.io")(http);

var wss = require("websocket").server;
var fs = require("fs");

var file = "events.txt";
// var file = "events-short-test.txt";

var server = http.createServer(function(req, res) {});

server.listen(12749, function() {
  console.log("Server is listening on port 12749");

  // parseFileLines(file);
});

wss = new wss({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // TODO: Logic here to verify origin
  return true;
}

wss.on("request", function(request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  var connection = request.accept("echo-protocol", request.origin);

  connection.on("open", function(message) {
    parseFileLines(connection, file);
  });

  connection.on("close", function(reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});

function parseFileLines(conn, file) {
  fs.readFile(file, "utf8", function(err, content) {
    var lines = content.split("\n");
    let timeout = 0;

    lines.map(function(line, i) {
      if (i != 0 && line != "") {
        let m = lines[i - 1].match(/^([0-9]+) = (.*)/);
        let tm = parseInt(m[0]);
        let nm = line.match(/^([0-9]+) = (.*)/);
        let ntm = parseInt(nm[0]);
        timeout = timeout + (ntm - tm);
      } else if (line == "") {
        setTimeout(function() {
          parseFileLines(conn, file);
        }, timeout + 3000);
      }

      if (line != "") {
        setTimeout(function() {
          console.log(line);
          conn.sendUTF(line);
        }, timeout);
      }
    });
  });
}
