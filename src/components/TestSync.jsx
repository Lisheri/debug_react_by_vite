import { flushSync } from 'react-dom'
import { Component } from 'react'

class TestSync extends Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
  }
  clickCountPlus = () => {
    const { count } = this.state
    flushSync(() => {
      this.setState({
        count: count + 1,
      })
    })
    console.info(this.state.count)
  }
  render = () => {
    const { clickCountPlus } = this
    return <div onClick={clickCountPlus}>sync组件{this.state.count}</div>
  }
}

export default TestSync
