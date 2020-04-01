import * as React from 'react'
import styled from 'styled-components'
import { grey } from '../../styles/colors'

const PopupTriggerText = styled.span`
  position: relative;
  &:hover {
    cursor: pointer;
  }
  :after {
    content: '';
    border-bottom: dotted 2px ${grey};
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 3px;
  }
`
export default PopupTriggerText
