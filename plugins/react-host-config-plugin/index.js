/**
 * React Host Config 插件
 * 用于处理 ReactFiberHostConfig 模块的重定向
 */

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')

// eslint-disable-next-line
const transformReactSharedInternals = (code, debug) => {
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
};`,
  )

  // 替换所有直接使用 ContextRegistry 的地方
  return modifiedCode.replace(/ContextRegistry\./g, 'getRegistry().')
}

const transformScheduler = (code, debug) => {
  if (debug) {
    console.log(`[ReactHostConfig] 处理 scheduler 模块`)
  }

  // 添加所有如下代码
  return `${code}
  export {
  // log,
  unstable_flushAllWithoutAsserting,
  unstable_flushNumberOfYields,
  unstable_flushExpired,
  unstable_flushUntilNextPaint,
  unstable_flushAll,
  unstable_advanceTime,
  unstable_setDisableYieldValue,
} from './src/forks/SchedulerMock';
  `
}

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
      // 也可以主动修改react代码, 位置在 packages/shared/ReactSharedInternals.js, 直接 import ReactSharedInternals from '../react/src/ReactSharedInternals.js'
      // if (id.includes('ReactServerContext.js')) {
      //   return transformReactSharedInternals(code, debug)
      // }

      // 处理 scheduler
      // 和上面一样, 可以手动处理, 同样是将上述逻辑中的代码添加到 scheduler/index.js 中
      if (id.includes('packages/scheduler/index.js')) {
        console.info('scheduler 处理')
        return transformScheduler(code, debug)
      }

      return null
    },
  }
}
