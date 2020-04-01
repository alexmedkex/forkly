import styled from 'styled-components'

import { Dimensions } from '../../resources/dimensions'

export const StyledValue = styled.p`
  white-space: normal;
  margin-left: 20px;
  max-width: calc(100% - ${Dimensions.DiscountingRequestInfoFieldLabelWidth});
`
