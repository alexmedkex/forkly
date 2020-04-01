import * as React from 'react'
import styled from 'styled-components'

import { stringOrUndefined, boolOrUndefined } from '../../utils/types'
import { black } from '../../styles/colors'

interface StyledTextProps {
  fontSize: stringOrUndefined
  color: stringOrUndefined
  bold: boolOrUndefined
  margin: stringOrUndefined
}

const StyledText = styled.span`
  display: inline-block;
  font-size: ${(props: StyledTextProps) => props.fontSize || 14}px;
  font-weight: ${(props: StyledTextProps) => (props.bold ? 'bold' : 'normal')};
  color: ${(props: StyledTextProps) => props.color || black};
  margin: ${(props: StyledTextProps) => props.margin || 0};
`

interface Props {
  margin?: stringOrUndefined
  fontSize?: stringOrUndefined
  color?: stringOrUndefined
  bold?: boolOrUndefined
  getRef?: (instance: HTMLSpanElement) => void
  children: React.ReactNode
}

const Text: React.FC<Props> = (props: Props) => {
  const { fontSize, bold, color, margin, children, getRef } = props
  return (
    <StyledText
      innerRef={(instance: HTMLSpanElement) => getRef && getRef(instance)}
      margin={margin}
      fontSize={fontSize}
      bold={bold}
      color={color}
      {...props}
    >
      {children}
    </StyledText>
  )
}

export default Text
