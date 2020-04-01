import * as React from 'react'
import styled from 'styled-components'
import moment from 'moment'

import { SectionCard } from './SectionCard'
import RequestInfoLabel from './RequestInfoLabel'
import { Counterparty } from '../../../counterparties/store/types'
import { Request } from '../../store'
import { displayDate } from '../../../../utils/date'
import { getCompanyName } from '../../../counterparties/utils/selectors'
import { SPACES } from '@komgo/ui-components'
import { dark } from '../../../../styles/colors'

export enum RequestSide {
  Receiver = 'Receiver',
  Sender = 'Sender'
}

interface IProps {
  request: Request
  counterparty: Counterparty
  requestSide: RequestSide
}

const RequestOverview: React.FC<IProps> = (props: IProps) => {
  const timeZone = moment.tz(moment.tz.guess()).zoneAbbr()

  const dateOrDash = ({ date, format = 'DD MMM YYYY [-] h:mm A', withTimeZone = true }) => {
    if (date) {
      const formatedDate = displayDate(date, format)
      return withTimeZone ? `${formatedDate} ${timeZone}` : formatedDate
    }
    return '-'
  }

  return (
    <SectionCard title="REQUEST OVERVIEW">
      <RequestOverviewWrapper>
        <div>
          <RequestInfoLabel label="Counterparty">
            <div data-test-id="counteparty-name">{getCompanyName(props.counterparty)}</div>
          </RequestInfoLabel>
          <RequestInfoLabel label={props.requestSide === RequestSide.Sender ? 'Sent on' : 'Received on'}>
            <div data-test-id={props.requestSide === RequestSide.Sender ? 'sent-date' : 'received-date'}>
              {dateOrDash({ date: props.request.createdAt })}
            </div>
          </RequestInfoLabel>
          <RequestInfoLabel label="Due date">
            <div data-test-id="due-date">
              {dateOrDash({ date: props.request.deadline, format: 'D MMM YYYY', withTimeZone: false })}
            </div>
          </RequestInfoLabel>
          <RequestInfoLabel label="Last updated">
            <div data-test-id="last-updated-date">
              {dateOrDash({ date: props.request.updatedAt || props.request.createdAt })}
            </div>
          </RequestInfoLabel>
        </div>
        {/* This will be implemented later <div>Placeholder for right side</div> */}
      </RequestOverviewWrapper>
    </SectionCard>
  )
}

const RequestOverviewWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${dark};
`

export default RequestOverview
