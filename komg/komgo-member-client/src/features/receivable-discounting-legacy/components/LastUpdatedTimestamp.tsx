import React from 'react'
import moment from 'moment-timezone'
import styled from 'styled-components'

interface ILastUpdatedTimestampProps {
  date: string
}

export const LastUpdatedTimestamp: React.FC<ILastUpdatedTimestampProps> = ({ date }) => (
  <SmallSpan>
    <b>Last updated: </b>
    {moment(date).format('DD/MM/YYYY [at] HH:mm z')}
  </SmallSpan>
)

const SmallSpan = styled.div`
  font-family: LotaGrotesque;
  font-size: 14px;
  padding: 10px 0px;
  b {
    font-size: 13px;
  }
`
