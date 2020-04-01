import * as React from 'react'
import styled from 'styled-components'

export interface CardStyleProps {
  children: React.ReactNode
  minHeight?: string
  maxHeight?: string
  minWidth?: string
  maxWidth?: string
  boxShadow?: string
  className?: string
  rootElementId?: string
}

const CardStyle = styled.div`
  min-height: ${(props: CardStyleProps) => (props.minHeight ? props.minHeight : '50px')};
  max-height: ${(props: CardStyleProps) => (props.maxHeight ? props.maxHeight : '200px')};
  min-width: ${(props: CardStyleProps) => (props.minWidth ? props.minWidth : '50px')};
  max-width: ${(props: CardStyleProps) => (props.maxWidth ? props.maxWidth : '200px')};
  box-shadow: ${(props: CardStyleProps) => (props.boxShadow ? props.boxShadow : '3px 3px 5px black')};
`

const Card: React.SFC<CardStyleProps> = (props: CardStyleProps) => (
  <CardStyle
    className={props.className || ''}
    minHeight={props.minHeight}
    maxHeight={props.maxHeight}
    minWidth={props.minWidth}
    maxWidth={props.maxWidth}
    boxShadow={props.boxShadow}
  >
    {props.children}
  </CardStyle>
)

export default Card
