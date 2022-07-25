const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const HotModuleReplacementPlugin = require("webpack/lib/HotModuleReplacementPlugin")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  mode: "development",
  devtool: false,
  entry: [
    path.resolve("./webpack-dev-server/client/index.js"),
    path.resolve("./webpack/hot/dev-server.js"),
    "./src/index.js",
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    // 设置 webpack 热更新时候的包名
    hotUpdateGlobal: "webpackHotUpdate",
  },
  devServer: {
    // hot: true,
    port: 8080,
    // 静态资源服务器
    static: {
      directory: path.resolve(__dirname, "static"),
    },
  },
  externals: {
    fs: require("fs"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new NodePolyfillPlugin(),
    new HotModuleReplacementPlugin(),
  ],
}
