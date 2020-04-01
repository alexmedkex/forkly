import * as React from 'react'
import { Popup } from 'semantic-ui-react'
import styled from 'styled-components'

import { CustomAlreadySentIcon } from '../custom-icon/CustomAlreadySentIcon'
import { dark } from '../../styles/colors'

export const DocumentSent: React.SFC = () => (
  <StyledPopup
    position="left center"
    style={{ color: 'white', backgroundColor: `${dark}` }}
    trigger={<CustomAlreadySentIcon />}
  >
    Already sent
  </StyledPopup>
)

const StyledPopup = styled(Popup)`
  &&&&& {
    border-radius: 3px;
    :before {
      background: ${dark};
    }
  }
`
