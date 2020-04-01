import * as React from 'react'
import styled from 'styled-components'

interface Props {
  alt: string
  src: any
  width: number
}

const StyledImage = styled.img`
  display: block;
  margin: 0 auto;
`

const Image: React.SFC<Props> = (props: Props) => <StyledImage width={props.width} src={props.src} alt={props.alt} />

export default Image
