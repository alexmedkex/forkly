import * as React from 'react'
import styled from 'styled-components'
import { violetBlue, white } from '../../styles/colors'

interface IProps {
  backgroundColor?: string
  color?: string
}

const SimpleButton = styled.button`
  color: ${(props: IProps) => props.color || violetBlue};
  border: none;
  cursor: pointer;
  &:focus {
    outline-color: ${white};
  }
  background-color: ${(props: IProps) => props.backgroundColor || white};
`
SimpleButton.displayName = 'SimpleButton'

export default SimpleButton
