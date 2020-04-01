import * as React from 'react'
import styled from 'styled-components'

export interface ContentBarProps {
  children: any
}

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  height: 50px;
`

export const ContentBar: React.SFC<ContentBarProps> = ({ children }) => <Header>{children}</Header>
