import { Component, useReducer } from 'react'

class ClassComponent extends Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
  }

  handleClick = () => {
    const { count } = this.state
    this.setState({ count: count + 1 })
    this.setState({ count: count + 100 })
  }

  render() {
    const { count } = this.state
    return (
      <div className="class border">
        {this.props.name}
        <button onClick={this.handleClick}>{count}</button>
      </div>
    )
  }
}

function FnComponent(props) {
  // hook的当前状态保留在 fiberNode.memoizedState 中, 通过一个链表结构保存, next指向下一个, 比如这里的count1和count2
  // fiberNode.memoizedState 指向 hook1, 而 hook1.next 指向 hook2
  const [count1, setCount1] = useReducer((x) => x + 2, 0) // hook1
  const [count2, setCount2] = useReducer((x) => x + 1, 1) // hook2

  return (
    <div className="border">
      <p>{props.name}</p>
      <button onClick={() => setCount1()}>{count1}</button>
      <button onClick={() => setCount2()}>{count2}</button>
    </div>
  )
}

const jsx = (
  <div className="box border">
    <h1>omg</h1>
    <h2>oo</h2>
    <FnComponent name="function component" />
    <ClassComponent name="class component" />
  </div>
)

export default jsx
