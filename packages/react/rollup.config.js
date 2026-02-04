import path from 'path';
import { fileURLToPath } from 'url';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
// import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
// import brotli from 'rollup-plugin-brotli';
import { config as dotConfig } from 'dotenv';
import { createRequire } from 'module';
import dts from 'rollup-plugin-dts';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = process.env.NODE_ENV;
dotConfig({ path: './.env.' + env });

const isDev = env === 'dev';
const isProd = env === 'prod';
const onwarn = (warning, warn) => {
  // 忽略三方包如@protobufjs使用eval带来的警告
  if (warning.code === 'EVAL' && /node_modules/.test(warning.loc.file)) {
    return;
  }
  // 忽略三方包@protobufjs 循环依赖的报警
  if (warning.code === 'CIRCULAR_DEPENDENCY' && /node_modules/.test(warning.ids?.[0])) {
    return;
  }
  warn(warning);
};

const basePlugins = [
  json(),
  resolve(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.DEBUG_ENV': JSON.stringify(process.env.DEBUG_ENV),
    'process.env.REPORT_SERVER_URL': JSON.stringify(process.env.REPORT_SERVER_URL),
    'process.env.TRACE_URL': JSON.stringify(process.env.TRACE_URL),
    'process.env.TRACE_GZIP_URL': JSON.stringify(process.env.TRACE_GZIP_URL),
    'process.env.CONFIG_URL': JSON.stringify(process.env.CONFIG_URL),
    'process.env.LOG_URL': JSON.stringify(process.env.LOG_URL),
  }),
  commonjs(),
  typescript(),
  getBabelOutputPlugin({
    configFile: path.resolve(__dirname, './.babelrc.cjs'),
    allowAllFormats: true,
  }),
  terser(),
];

// 👉 react 构建配置
const reactConfig = {
  input: './src/index.ts',
  output: [
    {
      dir: 'lib',
      entryFileNames: 'index.esm.js',
      format: 'es',
      sourcemap: isProd,
    },
    {
      dir: 'lib',
      entryFileNames: 'index.umd.js',
      format: 'iife',
      name: '_ors',
      footer: 'window._ors=_ors',
      sourcemap: isProd,
      globals: {
        react: 'React',
      },
    },
    {
      dir: 'lib',
      entryFileNames: `index-${pkg.version}.js`,
      format: 'iife',
      name: '_ors',
      footer: 'window._ors=_ors',
      sourcemap: isProd,
      globals: {
        react: 'React',
      },
    },
  ],
  plugins: [...basePlugins, isDev ? [] : del({ targets: 'lib' })],
  external: (id) => /^react($|\/)/.test(id),
  onwarn,
};

const reactTypeConfig = {
  input: './src/index.ts',
  output: {
    file: 'lib/index.d.ts',
    format: 'es',
    entryFileNames: '[name].d.ts',
  },
  plugins: [dts()],
  onwarn,
};

export default [reactConfig, reactTypeConfig];
