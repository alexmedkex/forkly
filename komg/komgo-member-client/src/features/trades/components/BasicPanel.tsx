import * as React from 'react'
import styled from 'styled-components'
import { media } from '../../../utils/media'

const Panel = styled.ul`
  list-style: none;
  margin: 0;
  ${(props: BasicPanelProps) => (props.padding ? `padding: ${props.padding}` : `padding: 30px 0px 30px 0px;`)};
  display: flex;
  flex-direction: column;
  ${(props: BasicPanelProps) => props.centeredForm && `margin: 0 auto; width: 800px;`};
  ${() => media.desktop`padding-left: 40px;`};
  ${(props: BasicPanelProps) => props.maxHeight && `max-height: ${props.maxHeight}px`};
`

interface BasicPanelProps {
  maxHeight?: number
  centeredForm?: boolean
  padding?: string
}

const BasicPanel: React.FC<BasicPanelProps> = ({ children, ...props }) => <Panel {...props}>{children}</Panel>

export default BasicPanel
