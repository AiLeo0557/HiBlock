import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs'; // CommonJS 转换
import resolve from '@rollup/plugin-node-resolve'; // 解析 node_modules 中的模块
// import replace from '@rollup/plugin-replace'; // 替换代码中的变量
// import json from '@rollup/plugin-json'; // 处理 JSON 文件
// import { nodeResolve } from '@rollup/plugin-node-resolve'; // 解析 node_modules 中的模块
// import { babel } from '@rollup/plugin-babel'; // Babel 转换
// import { eslint } from 'rollup-plugin-eslint'; // ESLint 检查
// import { visualizer } from 'rollup-plugin-visualizer'; // 生成打包体积分析报告
export default {
  input: 'src/index.ts', // 入口文件
  output: {
    file: 'dist/index.js', // 输出文件
    format: 'cjs', // 输出格式（CommonJS）
    sourcemap: false, // 不生成 source map
  },
  external: ['vue', '@vue/runtime-core', '@vue/reactivity', '@vue/shared', 'dayjs'], // 外部依赖
  plugins: [
    resolve(),
    commonjs(), // 转换 CommonJS 模块为 ES 模块
    typescript(), // TypeScript 转换
    terser({       // 压缩和混淆配置
      compress: true, // 启用压缩
      mangle: true,   // 启用混淆
    }),
  ],
};
