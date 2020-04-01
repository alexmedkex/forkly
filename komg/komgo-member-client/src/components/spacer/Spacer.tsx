import React, { ReactNode } from 'react'
import styled from 'styled-components'

interface ISpacerProps {
  padding?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  margin?: string
  paddingTop?: string
  paddingBottom?: string
  paddingLeft?: string
  paddingRight?: string
  children?: ReactNode
}

const Wrapper =
  styled.div <
  ISpacerProps >
  `
    padding: ${props => props.padding || 0}
    margin: ${props => props.margin || 0};
    padding-top: ${props => props.paddingTop || ''};
    padding-bottom: ${props => props.paddingBottom || ''};
    padding-left: ${props => props.paddingLeft || ''};
    padding-right: ${props => props.paddingRight || ''};
    margin-top: ${props => props.marginTop || ''};
    margin-bottom: ${props => props.marginBottom || ''};
    margin-left: ${props => props.marginLeft || ''};
    margin-right: ${props => props.marginRight || ''};
  `

export const Spacer = ({ children, ...props }: ISpacerProps): any => {
  return <Wrapper {...props}>{children}</Wrapper>
}
