import styled from 'styled-components'
import { CapitalizedHeader } from './CapitalizedHeader'
import { paleGrey } from '../../../styles/colors'

const GreyHeader = styled(CapitalizedHeader)`
  background-color: ${paleGrey};
  border-color: ${paleGrey};
`

export default GreyHeader
