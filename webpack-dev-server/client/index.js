const io = require("socket.io-client");

const hotEmitter = require("../../webpack/hot/emitter");

const socket = io();

console.log("client-socket");

let currentHash;

socket.on("hash", (hash) => {
  console.log("客户端收到hash消息了", hash);
  currentHash = hash;
});

socket.on("ok", () => {
  console.log("客户端收到ok消息");
  reloadApp();
});

function reloadApp() {
  hotEmitter.emit("webpackHotUpdate", currentHash);
}
