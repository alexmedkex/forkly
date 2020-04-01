import * as React from 'react'
import { Moment } from 'moment'
import styled from 'styled-components'
import GreenTimer from '../../../../components/timer/GreenTimer'
import RedTimer from '../../../../components/timer/RedTimer'
import TimerExpired from '../../../../components/timer/TimerExpired'

interface IProps {
  dueDateMoment: Moment
  leftMinutes: number
}

const LCTimer: React.FC<IProps> = (props: IProps) => {
  const { leftMinutes, dueDateMoment } = props
  const minutesInOneDay = 24 * 60
  if (leftMinutes > 0) {
    return (
      <TimerWrapper>
        {leftMinutes > minutesInOneDay ? (
          <GreenTimer dueDateMoment={dueDateMoment} leftMinutes={leftMinutes} />
        ) : (
          <RedTimer dueDateMoment={dueDateMoment} leftMinutes={leftMinutes} />
        )}
      </TimerWrapper>
    )
  }
  return <TimerExpired dueDateMoment={dueDateMoment} />
}

export const TimerWrapper = styled.div`
  display: inline-flex;
`

export default LCTimer
