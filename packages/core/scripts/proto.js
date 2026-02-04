/** 生成根据.proto文件，生成对应的js脚本和类型声明 */
import { execSync } from "child_process";
import fs from "fs";

function runCommand(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

const targetFileJsPath = "src/collect/proto/proto.js";
const targetFileDeclarePath = "src/collect/proto/proto.d.ts";

const extraComment =
  "// 当前文件通过 pnpm run proto 自动生成，请勿直接修改！！！\n //@ts-noCheck \n";

function main() {
  // 第一个命令：生成 proto.js 文件
  const command1 = [
    "npx",
    "pbjs",
    "-t",
    "static-module",
    "-w",
    "es6",
    "-o",
    "src/collect/proto/proto.js",
    "--path",
    "proto",
    "proto/opentelemetry/proto/trace/v1/trace.proto",
    "--no-create",
    "--no-decode",
    "--no-verify",
    "--no-convert",
    "--no-delimited",
    "--no-beautify",
    "--no-service",
  ].join(" ");

  // 第二个命令：生成类型声明文件
  const command2 = [
    "npx",
    "pbts",
    "-o",
    targetFileDeclarePath,
    targetFileJsPath,
  ].join(" ");

  console.log(`正在生成 proto.js 和类型声明文件...`);

  // 执行第一个命令
  runCommand(command1);

  // 执行第二个命令
  runCommand(command2);

  // 读取文件内容
  const fileContent = fs.readFileSync(targetFileJsPath, "utf8");

  // 在文件顶部插入注释
  const newContent = extraComment + fileContent;

  // 写回文件
  fs.writeFileSync(targetFileJsPath, newContent, "utf8");

  console.log(`生成 proto.js 和类型声明文件成功！`);
}

main();
