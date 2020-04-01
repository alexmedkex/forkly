import { Button } from 'semantic-ui-react'
import styled from 'styled-components'

export const StyledSpan = styled.span`
  color: #97a8be;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`

export const StyledButton = styled(Button)`
  &&& {
    border: none;
  }
`

export const StyledAddDocumentButton = styled(Button)`
  position: absolute;
  top: 24px;
  right: 30px;
`
