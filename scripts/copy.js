import fs from 'fs/promises';

// 配置化路径映射
const COPY_MAPPINGS = [
  { from: 'packages/core/lib', to: 'lib/core' },
  { from: 'packages/react/lib', to: 'lib/react' },
  { from: 'packages/vue/lib', to: 'lib/vue' },
];

async function copyDirs() {
  try {
    // 并行执行所有拷贝任务
    await Promise.all(
      COPY_MAPPINGS.map(async ({ from, to }) => {
        try {
          await fs.cp(from, to, { recursive: true, force: false });
          console.log(`✅ 成功拷贝 ${from} -> ${to}`);
        } catch (err) {
          console.error(`❌ 拷贝失败 ${from} -> ${to}:`, err.message);
          throw err; // 重新抛出错误，让外层捕获
        }
      })
    );
  } catch (err) {
    console.error('部分拷贝任务失败:', err.message);
    process.exit(1); // 非零退出码表示错误
  }
}

copyDirs();
