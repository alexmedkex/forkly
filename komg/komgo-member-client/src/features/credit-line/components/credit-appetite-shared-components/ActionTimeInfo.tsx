import * as React from 'react'
import styled from 'styled-components'
import moment from 'moment-timezone'

interface IProps {
  time: string | Date
  fieldName: string
  prefix: string
}

const ActionTimeInfo: React.FC<IProps> = (props: IProps) => {
  const timeZone = moment.tz(moment.tz.guess()).zoneAbbr()
  const date = moment(props.time)
  return (
    <Text className="grey" data-test-id={`last-updated-${props.fieldName}`}>
      {' '}
      {props.prefix} {date.format('YYYY/MM/DD')} at {date.format('h:mm A')} {timeZone}
    </Text>
  )
}

const Text = styled.span`
  font-size: 12px;
  @media (max-width: 768px) {
    display: block;
    margin-left: 0;
  }
`

export default ActionTimeInfo
