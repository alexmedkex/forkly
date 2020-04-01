import { Header } from 'semantic-ui-react'
import styled from 'styled-components'

export const CapitalizedHeader = styled(Header)`
  &&& {
    text-transform: uppercase;
    border: none;
    background-color: #f2f5f8;
  }
`
CapitalizedHeader.displayName = 'CapitalizedHeader'
