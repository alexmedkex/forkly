import * as React from 'react'
import styled from 'styled-components'

type Colour = 'red' | 'blue' | 'black' | undefined

interface Props {
  title: string
  colour?: Colour
}

interface H1StyleProps {
  colour: Colour
}

const H1Style = styled.h1`
  color: ${(props: H1StyleProps) => (props.colour ? props.colour : 'black')};
  font-size: 5em;
  text-align: center;
`

const Header: React.SFC<Props> = (props: Props) => <H1Style colour={props.colour}>{props.title}</H1Style>

export default Header
