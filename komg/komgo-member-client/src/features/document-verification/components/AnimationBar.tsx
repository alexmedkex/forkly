import * as React from 'react'
import { Component } from 'react'
import { Progress } from 'semantic-ui-react'
import styled from 'styled-components'
import { dark } from '../../../styles/colors'

export interface IAnimationBarState {
  percent: number
}

export interface IAnimationBarProps {
  elementNumber: number
  children?: {}
}

const StyledAnimationBar = styled(Progress)`
  &&& {
    width: 500px;
    height: 5px;
    position: absolute;
    left: 0px;
    bottom: 0;
    color: ${dark};
    margin-bottom: 0;
  }
`

export class AnimationBar extends Component<IAnimationBarProps, IAnimationBarState> {
  constructor(props) {
    super(props)
    this.state = {
      percent: 0
    }
  }

  increment = () => {
    setTimeout(() => {
      this.setState(prevState => ({
        percent: prevState.percent >= 100 ? 100 : prevState.percent + Math.floor(Math.random() * 10)
      }))
    }, 50)
  }

  render() {
    const { elementNumber } = this.props
    if (this.state.percent < 100) {
      this.increment()
    }
    return (
      <StyledAnimationBar
        id={elementNumber}
        key={`process-animation-${elementNumber}`}
        percent={this.state.percent}
        size="tiny"
        color="teal"
      />
    )
  }
}

export default AnimationBar
