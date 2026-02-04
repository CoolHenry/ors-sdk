// core/performance.ts
export function startTransaction(name: string) {
  const start = performance.now();
  return {
    finish() {
      const duration = performance.now() - start;
      console.log('startTransaction', name, '耗时', duration);
    },
  };
}
