import React from 'react'
import { grey } from '../../../../styles/colors'
import styled from 'styled-components'

export class CounterpartyBox extends React.Component {
  render() {
    return <CounterpartyBoxWrapper>{this.props.children}</CounterpartyBoxWrapper>
  }
}

const CounterpartyBoxWrapper = styled.article`
  padding: 30px;
  display: block;
  box-shadow: 0 1px 4px 0 rgba(192, 207, 222, 0.5);
  border: 1px solid ${grey};
`

export default CounterpartyBox
