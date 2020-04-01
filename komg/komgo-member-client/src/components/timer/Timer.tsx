import * as React from 'react'
import moment, { Moment } from 'moment'
import styled from 'styled-components'
import GreenTimer from './GreenTimer'
import RedTimer from './RedTimer'

interface IProps {
  dueDate: Date | string
  static?: boolean
  render(dueDateMoment: Moment, leftMinutes: number): React.ReactElement<any>
}

interface IState {
  dueDateMoment: Moment
  leftMinutes: number
}

class Timer extends React.Component<IProps, IState> {
  interval: NodeJS.Timeout

  constructor(props: IProps) {
    super(props)
    const dueDateMoment = moment(this.props.dueDate)
    const leftMinutes = dueDateMoment.diff(moment(), 'minutes')
    this.state = {
      dueDateMoment,
      leftMinutes
    }
  }

  componentDidMount() {
    this.setCountTimeInterval()
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  setCountTimeInterval = () => {
    const { leftMinutes } = this.state
    if (leftMinutes > 0 && !this.props.static) {
      this.interval = setInterval(this.setTimeInState, 60000)
    }
  }

  setTimeInState = () => {
    const leftMinutes = this.state.dueDateMoment.diff(moment(), 'minutes')
    this.setState({
      leftMinutes
    })
  }

  render() {
    const { leftMinutes, dueDateMoment } = this.state
    return this.props.render(dueDateMoment, leftMinutes)
  }
}

export default Timer
