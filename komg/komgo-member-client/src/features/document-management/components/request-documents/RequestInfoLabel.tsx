import * as React from 'react'
import styled from 'styled-components'
import { blueGrey } from '../../../../styles/colors'
import { SPACES } from '@komgo/ui-components'

interface IProps {
  label: string
  children: React.ReactElement
}

const RequestInfoLabel: React.FC<IProps> = (props: IProps) => {
  return (
    <Wrapper>
      <Label>{props.label}</Label>
      <Text>{props.children}</Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  margin-bottom: ${SPACES.DEFAULT};
  padding: ${SPACES.EXTRA_SMALL} 0;
  align-items: end;
`

const Text = styled.div`
  line-height: 21px;
`

const Label = styled.span`
  display: inline-block;
  color: ${blueGrey};
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 600;
  min-width: 150px;
  line-height: 21px;
`

export default RequestInfoLabel
