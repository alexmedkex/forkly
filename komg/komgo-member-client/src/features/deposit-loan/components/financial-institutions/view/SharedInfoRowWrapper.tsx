import styled from 'styled-components'

import { grey } from '../../../../../styles/colors'

const SharedInfoRowWrapper = styled.div`
  border-top: 1px solid ${grey};
  padding: 20px 0;
  :last-child {
    border-bottom: 1px solid ${grey};
  }

  && {
    .column:not(.grid) {
      padding-bottom: 10px;
    }
  }
`

export default SharedInfoRowWrapper
