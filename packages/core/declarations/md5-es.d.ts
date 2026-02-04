// declarations/md5-es.d.ts
declare module 'md5-es' {
  export function hash(data: string | Buffer): string;
  export default {
    hash: hash,
  };
}
