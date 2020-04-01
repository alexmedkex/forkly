import * as React from 'react'
import styled from 'styled-components'
import { paleGrey } from '../../styles/colors'

const FullSizePage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 12;
  background-color: ${paleGrey};
`

export default FullSizePage
