import * as React from 'react'
import styled from 'styled-components'

import { violetBlue, grey } from '../../../../styles/colors'

interface ISharedWithRowProps {
  requested: boolean
  index: number
}

const SharedWithRow = styled.div`
  border-bottom: 1px solid;
  border-top: ${(props: ISharedWithRowProps) =>
    props.index === 0 ? `1px solid ${props.requested ? violetBlue : grey}` : 'unset'};
  border-color: ${(props: ISharedWithRowProps) => (props.requested ? violetBlue : grey)};
  &:nth-child(2) {
    border-top: ${(props: ISharedWithRowProps) => `1px solid ${props.requested ? violetBlue : grey}`};
  }
  padding: 10px 0;
  min-height: 70px;
`

export default SharedWithRow
