const hotEmitter = require("../../webpack/hot/emitter");

let hash = undefined;
let currentHash = undefined;

hotEmitter.on("webpackHotUpdate", (hotCurrentHash) => {
  currentHash = hotCurrentHash;
  console.log("hash", hash);
  console.log("currentHash", currentHash);
  if (!hash || hash == hotCurrentHash) {
    hash = hotCurrentHash;
    return;
  }
  hotCheck();
});

function hotCheck() {
  hotDownloadManifest().then((update) => {
    let chunkIds = update.c;
    chunkIds.forEach((chunkId) => {
      hotDownloadUpdateChunk(chunkId);
    });
  });
}

function hotDownloadManifest() {
  return new Promise((resolve) => {
    let request = new XMLHttpRequest();
    //hot-update.json文件里存放着从上一次编译到这一次编译 取到差异
    let requestPath = "/main." + hash + ".hot-update.json";
    request.open("GET", requestPath, true);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        let update = JSON.parse(request.responseText);
        resolve(update);
      }
    };
    request.send();
  });
}

function hotDownloadUpdateChunk(chunkId) {
  let script = document.createElement("script");
  script.charset = "utf-8";
  // /main.xxxx.hot-update.js
  script.src = "/" + chunkId + "." + hash + ".hot-update.js";
  document.head.appendChild(script);
  console.log(__webpack_require__.c, "__webpack_require__");
}

window.webpackHotUpdate = function (chunkId, moreModules) {
  console.log("进来了，webpackHotUpdate", moreModules);
  // 循环新拉来的模块
  for (let moduleId in moreModules) {
    // 从模块缓存中取到老的模块定义
    let oldModule = __webpack_require__.c[moduleId];
    // parents哪些模块引用这个模块 children这个模块引用了哪些模块
    // parents=['./src/index.js']
    let { parents, children } = oldModule;
    // 更新缓存为最新代码 缓存进行更新
    let module = (__webpack_require__.c[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
      parents,
      children,
      hot: window.hotCreateModule(moduleId),
    });
    moreModules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    module.l = true; // 状态变为加载就是给module.exports 赋值了
    parents.forEach((parent) => {
      // parents=['./src/index.js']
      let parentModule = __webpack_require__.c[parent];
      // _acceptedDependencies={'./src/title.js',render}
      parentModule &&
        parentModule.hot &&
        parentModule.hot._acceptedDependencies[moduleId] &&
        parentModule.hot._acceptedDependencies[moduleId]();
    });
    hash = currentHash;
  }
};

window.hotCreateModule = function () {
  let hot = {
    _acceptedDependencies: {},
    dispose() {
      // 销毁老的元素
    },
    accept: function (deps, callback) {
      for (let i = 0; i < deps.length; i++) {
        // hot._acceptedDependencies={'./title': render}
        hot._acceptedDependencies[deps[i]] = callback;
      }
    },
  };
  return hot;
};
