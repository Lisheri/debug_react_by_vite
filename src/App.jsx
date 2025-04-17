import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { flushSync } from 'react-dom'
import TestSync from './components/TestSync'

function App() {
  const [count, setCount] = useState(0)
  const latestCount = useRef(count)

  const handleButtonClick = () => {
    setCount(count + 1)
    flushSync(() => {
      setCount((preCount) => {
        const newVal = preCount + 1
        // 利用一个指针缓存执行的结果, 可以发现这里的setCount是同步执行的
        latestCount.current = newVal
        return newVal
      })
    })
    // 视图是更新了, 但是这里还是拿不到最新的状态, 除非使用一个对象进行包裹, 但实际上是同步更新的
    // 这里count不是最新的, 但是latestCount.current是最新的
    console.info(count, latestCount.current)
  }

  return (
    <>
      <div>
        <a
          href="https://vite.dev"
          target="_blank"
        >
          <img
            src={viteLogo}
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
        >
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => handleButtonClick()}>count is {count}</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      <TestSync />
    </>
  )
}

export default App
