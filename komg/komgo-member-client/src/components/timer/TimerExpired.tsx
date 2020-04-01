import * as React from 'react'
import { Moment } from 'moment'
import { Icon, Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import { red } from '../../styles/colors'
import { printExpiryDateInForm } from '../../utils/timer'

interface IProps {
  dueDateMoment: Moment
}

const TimerExpired: React.FC<IProps> = (props: IProps) => {
  const { dueDateMoment } = props
  return (
    <Popup
      trigger={
        <TimerExpiredWrapper>
          <Icon name="clock outline" color="red" />
          <RedText data-test-id="timer-expired">Timer expired</RedText>
        </TimerExpiredWrapper>
      }
      content={`Expired on: ${printExpiryDateInForm(dueDateMoment)}`}
    />
  )
}

const RedText = styled.span`
  color: ${red};
`

const TimerExpiredWrapper = styled.div`
  display: inline-flex;
`

export default TimerExpired
