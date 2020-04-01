import * as React from 'react'

import styled from 'styled-components'
import { Grid } from 'semantic-ui-react'

const ColumnWithRemoveButton = styled(Grid.Column)`
  &&&&& {
    &.column {
      @media (max-width: 1200px) {
        position: absolute;
        width: 65px !important;
        right: 8px;
      }
    }
  }
`

export default ColumnWithRemoveButton
