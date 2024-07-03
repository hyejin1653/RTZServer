const express = require("express");
const app = express();
const cors = require("cors");
const chokidar = require("chokidar");
const net = require("net");

const iniparser = require("iniparser");
var config = iniparser.parseSync("./config.ini");

const fs = require("fs");
const path = require("path");
const parser = require("xml-js");
const jsonxml = require("jsontoxml");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server,
  wss = new WebSocketServer({ port: 5999 });

let client = "";

app.use(
  cors({
    origin: "*",
    header: "Access-Control-Allow-Origin : *",
  })
);

wss.on("connection", (ws, request) => {
  if (ws.readyState === ws.OPEN) {
    console.log("새로운 클라이언트");
  }
});

let server = net.createServer((socket) => {
  let result = "";
  socket.on("data", (buffer) => {
    //console.log(buffer.toString());
    let data = buffer.toString();

    let index = data.indexOf('<?xml version="1.0" encoding="utf-8"?>');
    result = data.substring(index, data.length);

    //console.log("index : ", data);

    if (data.includes("</route>")) {
      let idx = data.indexOf("</route>");
      result += data.substring(0, idx + 8);

      let json = parser.xml2json(result);
      wss.clients.forEach((client) => {
        client.send(json);
      });
    }

    // if (result.includes("</route>")) {
    //   console.log("start : ", result, " : end");

    //   console.log(result.indexOf('<?xml version="1.0" encoding="utf-8"?>'));

    //   let str = result.substring()
    // }
    // let file = null;
    // let filePath = null;
    // const data = buffer.toString();
    // filePath = buildFilePath(data);
    // file = fs.createWriteStream(filePath);
    // file.write(data);
  });
});

let checkFolder = config.FILE.path;
let result;

//폴더 감지 체크
function folderCheck() {
  const watch = chokidar.watch(checkFolder, { ignoreInitial: true });

  watch.on("add", (path) => {
    console.log("add : " + path);
    //fileDataUpload(path);
    fileReadSend(path);
  });

  watch.on("change", (path) => {
    console.log("change : " + path);
    fileReadSend(path);
  });

  watch.on("unlink", (path) => {
    console.log("unlink : " + path);
  });
}

function fileReadSend(path) {
  let data = fs.readFileSync(path, "utf8");
  console.log(data);
  let json = parser.xml2json(data);

  console.log(json);
  //result = JSON.parse(json);

  wss.on("connection", (ws, request) => {
    if (ws.readyState === ws.OPEN) {
      console.log("새로운 클라이언트");
      ws.send(json);
    }
  });
  //res.send();
}

/*let result = fs.readFileSync("./Route_v0.1.rtz", "utf8");
var json = parser.xml2json(result);
json = JSON.parse(json);*/

/*app.get("/xmlTojsonFile", function (req, res) {
  //console.log("들어옴");
  wss.on("connection", (ws, request) => {
    if (ws.readyState === ws.OPEN) {
      console.log("새로운 클라이언트");
    }
  });
  res.send(json.elements[1].elements);
});*/

const port = 5900;

server.listen(9999, (err) => {
  console.log(err);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  folderCheck();

  //selectData();
});
