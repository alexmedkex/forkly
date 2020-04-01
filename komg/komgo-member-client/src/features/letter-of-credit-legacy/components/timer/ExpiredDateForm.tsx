import * as React from 'react'
import styled from 'styled-components'
import { TIME_UNIT_DUE_DATE } from '../../constants'
import { Icon } from 'semantic-ui-react'
import { countExpireDate, printExpiryDateInForm } from '../../../../utils/timer'

interface IProps {
  time: number
  timeUnit: TIME_UNIT_DUE_DATE
}

const ExpiredDateForm: React.FC<IProps> = (props: IProps) => {
  const { time, timeUnit } = props
  const expiryDate = countExpireDate(time, timeUnit)
  return (
    <ExpireDateWrapper>
      <Icon name="clock outline" color="green" size="large" />
      <ExpireDate className="grey" data-test-id="due-date-calculated">
        {printExpiryDateInForm(expiryDate)}
      </ExpireDate>
    </ExpireDateWrapper>
  )
}

const ExpireDateWrapper = styled.div`
  margin-left: 20px;
`

const ExpireDate = styled.span`
  line-height: 21px;
`

export default ExpiredDateForm
