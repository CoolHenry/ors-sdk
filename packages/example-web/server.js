const express = require("express");
const path = require("path");
// const opener = require('opener');

const app = express();
const PORT = 3000;
const STATIC_DIR = path.join(__dirname, "src"); // 静态资源目录
const PUBLIC_DIR = path.join(__dirname, "public"); // JS等资源目录

const coreBasePath = path.join(__dirname, "../", "core");

// 托管静态资源
app.use("/", express.static(STATIC_DIR));
app.use("/js", express.static(path.join(PUBLIC_DIR, "js")));
app.use("/css", express.static(path.join(PUBLIC_DIR, "css")));
app.use("/src", express.static(path.join(coreBasePath, "src")));

app.get("/ors/:path", (req, res) => {
  res.sendFile(path.join(coreBasePath, "lib", req.params.path));
});
// 启动服务器
app.listen(PORT, () => {
  console.log(`Demo服务运行在 http://localhost:${PORT}`);
  // opener('http://localhost:3000');
});
