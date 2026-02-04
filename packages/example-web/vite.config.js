import { defineConfig } from "vite";
import { resolve, join } from "path";
import fs from "fs";
function copyOrsUmd() {
  return {
    name: "copy-ors-umd",
    closeBundle() {
      const coreBasePath = join(__dirname, "../", "core");
      const src = resolve(coreBasePath, "lib/index.umd.js");
      const dest = resolve(__dirname, "dist/ors/index.umd.js");

      fs.mkdirSync(resolve(dest, ".."), { recursive: true });
      fs.copyFileSync(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [copyOrsUmd()],
  root: resolve(__dirname, "src"),
  base: "./",
  publicDir: resolve(__dirname, "public"),

  build: {
    outDir: resolve(__dirname, "dist"),
    sourcemap: true,
    emptyOutDir: true,

    // 自动复制public文件夹内容
    copyPublicDir: true,

    rollupOptions: {
      input: resolve(__dirname, "src/index.html"),
      output: {
        format: "iife", // 立即执行函数表达式
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
});
