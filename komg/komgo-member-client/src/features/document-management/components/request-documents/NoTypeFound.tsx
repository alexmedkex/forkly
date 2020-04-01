import * as React from 'react'
import { Icon } from 'semantic-ui-react'
import styled from 'styled-components'

import { blueGrey } from '../../../../styles/colors'
import { SPACES } from '@komgo/ui-components'

interface IProps {
  message?: string
}

const NoFoundMessage: React.FC<IProps> = (props: IProps) => (
  <Wrapper>
    <Icon name="search" />
    <p>{props.message || 'Sorry, no items found'}</p>
    <small>Please try with different search query</small>
  </Wrapper>
)

const Wrapper = styled.div`
  text-align: center;
  color: ${blueGrey};
  margin-top: ${SPACES.LARGE};
  &&&& p {
    margin-bottom: 0;
  }
`

export default NoFoundMessage
