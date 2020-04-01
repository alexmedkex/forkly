import styled from 'styled-components'
import { Header } from 'semantic-ui-react'
import { blueGrey, SPACES } from '@komgo/ui-components'

export const Breadcrumb = styled(Header)`
  &&& {
    font-size: 14px;
    display: block;
    flex: 1;
    color: ${blueGrey};
    margin: 0 0 ${SPACES.EXTRA_SMALL} 0;
  }
`
