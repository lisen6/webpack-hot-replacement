const express = require("express")
const http = require("http")
const updateCompiler = require("./utils/updateCompiler")
const webpackDevMiddleware = require("../../webpack-dev-middleware")
const io = require("socket.io")

class Server {
  constructor(compiler, devServerArgs) {
    this.sockets = []
    this.compiler = compiler
    this.devServerArgs = devServerArgs
    this.setupApp()
    updateCompiler(compiler) // 给打包配置注入热模块更新的 client 跟 server 入口
    this.setupHooks() // 注册 webpack 钩子
    this.routes() // 开启静态资源服务器
    this.setupDevMiddleware() // 注册中间件
    this.createServer() // 创建 server
    this.createSocketServer() // 创建 socket 服务器
  }

  setupDevMiddleware() {
    this.middleware = webpackDevMiddleware(this.compiler)
    this.app.use(this.middleware)
  }
  setupHooks() {
    this.compiler.hooks.done.tap("webpack-dev-server", (stats) => {
      console.log(stats.hash)

      // 每次编译成功后，都需要给客户端发送最新的 hash 值
      this.sockets.forEach((socket) => {
        socket.emit("hash", stats.hash)
        socket.emit("ok")
      })
      this._stats = stats
    })
  }
  routes() {
    if (this.devServerArgs.static && this.devServerArgs.static.directory) {
      this.app.use(express.static(this.devServerArgs.static.directory))
    }
  }
  setupApp() {
    // this.app 并不是一个 http 服务器，只是一个路由中间件
    this.app = express()
  }
  createServer() {
    this.server = http.createServer(this.app)
  }
  createSocketServer() {
    // websocket 在通信之前要握手，握手用的是 http 协议
    const websocketServer = io(this.server)
    // 监听客户端的连接
    websocketServer.on("connection", (socket) => {
      console.log("一个新的websocket客户端已经连接上来了")

      // 把新的客户端添加到数组里，为了以后编译成功之后广播做准备
      this.sockets.push(socket)

      console.log(this.sockets.length, "sockets")
      // 监听客户端断开
      socket.on("disconnect", () => {
        let index = this.sockets.indexOf(socket)
        if (index > -1) {
          this.sockets.splice(index, 1)
        }
      })

      // 如果以前已经编译过了，就把上一次的hash值发给客户端
      if (this._stats) {
        // socket.emit("hash", this._stats)
        socket.emit("ok")
      }
    })
  }
  listen(port, host, callback) {
    this.server.listen(port, host, callback)
  }
}

module.exports = Server
