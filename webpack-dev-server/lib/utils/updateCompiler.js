const path = require("path")

function updateCompiler(compiler) {
  const options = compiler.options
  // 1. webpack-dev-server/client/index.js 浏览器里的 websocket 客户端
  options.entry.main.import.unshift(require.resolve("../../client/index.js"))

  // 2. wepack/host/dev-server.js 浏览器监听发射的事件，进行后续的热更新逻辑
  options.entry.main.import.unshift(
    require.resolve("../../../webpack/hot/dev-server.js")
  )

  compiler.hooks.entryOption.call(options.context, options.entry)
}

module.exports = updateCompiler
