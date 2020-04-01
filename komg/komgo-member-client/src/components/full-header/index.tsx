import * as React from 'react'
import styled from 'styled-components'

const Header =
  styled.div <
  FullHeaderProps >
  `
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: center;
padding: ${props => props.padding || '17px 30px;'};
margin: ${props => props.margin || 0};
`

interface FullHeaderProps {
  children: React.ReactNode
  padding?: string | number
  margin?: string | number
}

export const FullHeader: React.FC<FullHeaderProps> = ({ children, ...props }: FullHeaderProps) => (
  <Header {...props}>{children}</Header>
)
