import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import ElementPlus from 'unplugin-element-plus/vite'
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue(),
    ElementPlus({}),
    dts({
      include: ['src/**/*'],
      outDir: 'dist/types',
      staticImport: true,
      insertTypesEntry: true,
      // compilerOptions: {
      //   preserveSymlinks: true
      // }
    }),
    viteCompression({
      algorithm: 'gzip',        // 压缩算法，支持 gzip 或 brotli ‌:ml-citation{ref="5,7" data="citationList"}
      ext: '.gz',               // 生成文件后缀 ‌:ml-citation{ref="3,5" data="citationList"}
      threshold: 10240,         // 仅压缩大于 10KB 的文件 ‌:ml-citation{ref="3,5" data="citationList"}
      deleteOriginFile: false,  // 保留原始文件，避免服务器无法回退 ‌:ml-citation{ref="4,5" data="citationList"}
      filter: /\\.(js|css|json|html|ico|svg)(\\?.*)?$/i,  // 指定压缩文件类型 ‌:ml-citation{ref="5,6" data="citationList"}
    })
  ],
  build: {
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      name: 'HiBlockComponents',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        'vue',
        'axios',
        'dayjs',
        'sm-core',
        'vue-router',
        '@hi-block/http',
        '@hi-block/utils',
        '@hi-block/definitions',
        'hi-datatype-operation',
        /^element-plus/,
        /^@vue\/.*/
      ],
      output: {
        exports: 'named', // 关键！强制使用命名导出
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@vue/runtime-core': 'runtimeCore',
          '@vue/runtime-dom': 'runtimeDom',
          'element-plus/es/components/select/src/select': 'select',
          'hi-datatype-operation': 'HiDatatypeOperation',
          '@hi-block/http': '@hi-block/http',
          '@hi-block/utils': '@hi-block/utils',
          '@hi-block/definitions': '@hi-block/definitions',
          'dayjs': 'dayjs',
          'sm-core': 'smCore',
          'axios': 'axios',
          'vue-router': 'vueRouter',
        }
      }
    }
  }
})