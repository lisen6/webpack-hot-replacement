/**
 * 1. 真正的监听模式启动 webpack 编译
 * 2. 返回一个 express 中间件，用来预览我们产出的资源文件
 * @param {*} compiler
 */
const fs = require("fs")
const MemoryFilesSystem = require("memory-fs")
const memoryFilesSystem = new MemoryFilesSystem()
const middleware = require("./middleware")

function webpackDevMiddleware(compiler) {
  compiler.watch({}, () => {
    console.log("监听到文件变化，webpack 重新开始编译")
  })

  // webpack 开发环境的文件并不是写在硬盘上,而是放在内存里
  // 当 webpack 准备写入文件的时候，是用 compiler.outputFileSystem 来写入
  //   let fs = (compiler.outputFileSystem = memoryFilesSystem)
  return middleware({
    fs,
    outputPath: compiler.options.output.path, // 写入到哪个目录里去
  })
}

module.exports = webpackDevMiddleware
