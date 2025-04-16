/**
 * 使用 @babel/preset-flow 处理 Flow 类型注解的 Vite 插件
 */

import { transformSync } from '@babel/core';

export default function flowPlugin(options = {}) {
  const {
    include = ['react/packages/**/*.js', 'react/packages/**/*.jsx'],
    exclude = [],
    addDevVariable = false,
    forceProcess = false,
    debug = false
  } = options;

  return {
    name: 'vite-plugin-flow',
    enforce: 'pre', // 在其他插件之前运行

    async transform(code, id) {
      // 检查文件是否匹配
      if (!shouldProcess(id)) {
        return null;
      }

      if (debug) {
        console.log(`处理 Flow 类型 (使用 Babel): ${id}`);
      }

      // 特殊处理 ReactFiberHostConfig.js - 这个模块需要由特定渲染器填充
      if (id.includes('ReactFiberHostConfig.js') && !id.includes('ReactDOMHostConfig.js')) {
        if (debug) {
          console.log(`保留 ReactFiberHostConfig.js 原始代码`);
        }
        return null; // 不处理此文件，交给 react-host-config-plugin 处理
      }

      try {
        // 使用 Babel 转换代码，应用 preset-flow 预设
        const result = transformSync(code, {
          filename: id,
          presets: [
            ['@babel/preset-flow', { all: true }]  // all: true 选项移除所有类型，即使没有 @flow 注解
          ],
          // 不生成源码映射以提高性能
          sourceMaps: false,
          // 忽略 babelrc 和其他配置文件
          configFile: false,
          babelrc: false,
          // 保留注释
          comments: true
        });

        // 检查特殊情况，如 ReactSymbols.js 中的 getIteratorFn 函数
        let processedCode = result.code;
        
        // 添加 __DEV__ 变量（如果需要）
        if (addDevVariable && processedCode.includes('__DEV__') && 
            !processedCode.includes('const __DEV__ =') && 
            !processedCode.includes('var __DEV__ =')) {
          processedCode = 'const __DEV__ = true;\n' + processedCode;
        }
        
        // 对特定文件的后处理
        const fileName = id.split('/').pop();
        if (fileName === 'ReactSymbols.js') {
          // 处理 getIteratorFn 函数的特殊情况
          processedCode = processedCode.replace(
            /(export function getIteratorFn\(maybeIterable\))[^{]*{/g,
            '$1 {'
          );
        } else if (fileName === 'isArray.js') {
          // 特殊处理 isArray.js
          processedCode = `/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const isArray = Array.isArray;

export default isArray;
`;
        } else if (fileName === 'ReactDOMHostConfig.js') {
          // 对ReactDOMHostConfig.js进行特殊处理，确保所有hydration相关函数都被正确保留
          // 这些函数在SSR水合过程中很重要
          if (processedCode.includes('canHydrateInstance')) {
            // 确保水合相关函数已经被正确处理
            if (debug) {
              console.log('ReactDOMHostConfig.js中的hydration函数已保留');
            }
          }
          
          // 确保保留所有必要的导出
          // if (!processedCode.includes('export * from')) {
          //   processedCode = `export * from 'react-reconciler/src/ReactFiberHostConfigWithNoPersistence';\n${processedCode}`;
          // }
        }

        return {
          code: processedCode,
          map: null
        };
      } catch (error) {
        console.error('处理 Flow 类型时出错:', error);
        return null;
      }
    }
  };

  // 检查文件是否应该被处理
  function shouldProcess(id) {
    // 强制处理所有匹配的文件
    if (forceProcess) {
      return include.some(pattern => id.includes(pattern));
    }
    
    // 排除不匹配的文件
    if (exclude.some(pattern => id.includes(pattern))) {
      return false;
    }
    
    // 检查是否匹配包含模式
    return include.some(pattern => id.includes(pattern));
  }
}
