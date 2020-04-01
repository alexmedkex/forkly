import * as React from 'react'
import { Moment } from 'moment'
import { Icon } from 'semantic-ui-react'
import { printExpiryDateInForm } from '../../utils/timer'

interface IProps {
  dueDateMoment: Moment
  leftMinutes: number
}

const GreenTimer: React.FC<IProps> = (props: IProps) => {
  const { dueDateMoment } = props
  return (
    <React.Fragment>
      <Icon name="clock outline" color="green" />
      <span className="grey" data-test-id="timer-more-than-24h">
        {printExpiryDateInForm(dueDateMoment)}
      </span>
    </React.Fragment>
  )
}

export default GreenTimer
