import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts', // 入口文件
  output: {
    file: 'dist/bundle.js', // 输出文件
    format: 'cjs', // 输出格式（CommonJS）
    sourcemap: false, // 不生成 source map
  },
  plugins: [
    typescript(), // TypeScript 转换
  ],
};
