import * as React from 'react'
import { Moment } from 'moment'
import { Icon, Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import { red } from '../../styles/colors'
import { printExpiryDateInForm } from '../../utils/timer'

interface IProps {
  dueDateMoment: Moment
  leftMinutes: number
}

const RedTimer: React.FC<IProps> = (props: IProps) => {
  const { leftMinutes, dueDateMoment } = props
  const remainingHours = leftMinutes / 60
  return (
    <Popup
      trigger={
        <div>
          <Icon name="clock outline" color="red" />
          <RedText data-test-id="timer-less-than-24h">
            Remaining time: {leftMinutes < 60 ? `${leftMinutes} minute(s)` : `${Math.round(remainingHours)} hour(s)`}
          </RedText>
        </div>
      }
      content={`Deadline for response: ${printExpiryDateInForm(dueDateMoment)}`}
    />
  )
}

const RedText = styled.span`
  color: ${red};
`

export default RedTimer
