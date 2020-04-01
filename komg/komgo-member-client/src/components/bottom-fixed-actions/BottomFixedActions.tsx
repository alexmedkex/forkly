import styled from 'styled-components'
import { paleBlue } from '../../styles/colors'

const BottomFixedActions = styled.div`
  border-top: 1px solid ${paleBlue};
  padding: 16px 0;
  padding-right: 30px;
  position: fixed;
  bottom: 0;
  left: 180px;
  right: 0;
  background-color: white;
  z-index: 2;
  height: 64px;
`

export default BottomFixedActions
