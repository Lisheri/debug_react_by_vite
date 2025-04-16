/**
 * React Host Config 插件
 * 用于处理 ReactFiberHostConfig 模块的重定向
 */

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')

export default function reactHostConfigPlugin(options = {}) {
  const { debug = false } = options

  return {
    name: 'vite-plugin-react-host-config',
    enforce: 'pre',

    resolveId(id) {
      // 特殊处理 ReactFiberHostConfig 模块
      if (id.includes('ReactFiberHostConfig') && !id.includes('ReactDOMHostConfig')) {
        // 排除 ReactFiberHostConfigWithNoPersistence
        if (id.includes('ReactFiberHostConfigWithNoPersistence')) {
          return null
        }
        // 将 ReactFiberHostConfig 重定向到 ReactDOMHostConfig
        const reactDOMHostConfig = path.resolve(rootDir, 'react/packages/react-dom/src/client/ReactDOMHostConfig.js')

        if (debug) {
          console.log(`[ReactHostConfig] 将 ${id} 重定向到 ${reactDOMHostConfig}`)
        }

        return reactDOMHostConfig
      }

      return null
    },

    transform(code, id) {
      // 处理 ReactServerContext.js 中对 ReactSharedInternals 的访问
      if (id.includes('ReactServerContext.js')) {
        if (debug) {
          console.log(`[ReactHostConfig] 处理 ReactServerContext.js 中的 ReactSharedInternals 访问`)
        }
        
        // 替换直接访问 ContextRegistry 的代码，使用动态获取方式
        const modifiedCode = code.replace(
          /const ContextRegistry = ReactSharedInternals\.ContextRegistry;/g,
          `// 使用函数延迟访问 ContextRegistry
const getContextRegistry = () => ReactSharedInternals.ContextRegistry;
let ContextRegistry = null;
const getRegistry = () => {
  if (ContextRegistry === null) {
    ContextRegistry = getContextRegistry();
  }
  return ContextRegistry;
};`
        );
        
        // 替换所有直接使用 ContextRegistry 的地方
        return modifiedCode.replace(
          /ContextRegistry\./g,
          'getRegistry().'
        );
      }
      
      return null;
    }
  }
}
