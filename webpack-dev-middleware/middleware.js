/**
 * 负责产出文件的预览
 * 拦截 http 请求，看看请求的文件是不是 webpack 打包出来的文件
 * 如果是，从硬盘上读出来，返回给客户端
 */
const mime = require("mime");
const path = require("path");
function wrapper({ fs, outputPath }) {
  return (req, res, next) => {
    let url = req.url;
    if (url === "/") url = "/index.html";
    if (req.url === "/favicon.ico") {
      return res.sendStatus(404);
    }
    let filename = path.join(outputPath, url);
    try {
      let stat = fs.statSync(filename);
      // 看看是不是打包出来的文件
      if (stat.isFile()) {
        let content = fs.readFileSync(filename);
        res.setHeader("Content-type", mime.getType(filename));
        res.send(content);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = wrapper;
