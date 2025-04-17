import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'
import flowPlugin from './plugins/my-flow-plugin'
import reactHostConfigPlugin from './plugins/react-host-config-plugin'
// import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 增强 react 插件，使用自动 JSX 转换
const enhancedReactPlugin = () => {
  const plugin = react()

  return plugin
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    flowPlugin({
      include: [
        'react/packages/react',
        'react/packages/react-dom',
        'react/packages/react-reconciler',
        'react/packages/scheduler',
        'react/packages/shared',
      ],
      addDevVariable: true,
      forceProcess: true,
      debug: false,
    }),
    reactHostConfigPlugin({
      debug: false
    }),
    {
      name: 'vite-plugin-flow-pre',
      enforce: 'pre',
      resolveId(id) {
        if (id.includes('react/')) {
          // console.log(`尝试解析ID: ${id}`)
        }
        return null
      },
    },
    enhancedReactPlugin(),
    {
      // 实现一个插件, 处理transform之后的jsx转换, 调整react/jsx-dev-runtime -> 当前路径下的react/jsx-dev-runtime
      name: 'react-jsx-dev-runtime',
      transform(code) {
        if (code.includes('react/jsx-dev-runtime')) {
          const newCode = code.replace(
            'react/jsx-dev-runtime',
            path.resolve(__dirname, 'react/packages/react/jsx-dev-runtime.js'),
          )
          return newCode
        }
      },
    },
  ],
  define: {
    __DEV__: true,
    __EXPERIMENTAL__: true,
    __PROFILE__: true,
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, './react/packages/react'),
      'react-dom': path.resolve(__dirname, './react/packages/react-dom'),
      'react-reconciler': path.resolve(__dirname, './react/packages/react-reconciler'),
      scheduler: path.resolve(__dirname, './react/packages/scheduler'),
      shared: path.resolve(__dirname, './react/packages/shared'),
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    mainFields: ['module', 'main', 'browser'],
  },
})
