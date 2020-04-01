import * as React from 'react'
import styled from 'styled-components'
import { Input } from 'semantic-ui-react'

import { HasMode, ProfileFormMode, HasProfileUpdater } from './CounterpartyProfileSection'

import { displayDate } from '../../../../utils/date'

export interface HasRenewalDate {
  renewalDate: string
  showCountdown: boolean
}

export interface Props extends HasMode, HasRenewalDate, HasProfileUpdater {}

export const RenewalDate = (props: Props) => {
  return props.mode === ProfileFormMode.EDIT ? (
    <Input
      data-test-id="cp-profile-field-renewaldate-edit"
      style={{ maxWidth: '160px' }}
      type="date"
      value={displayDate(props.renewalDate || '', 'YYYY-MM-DD')}
      onChange={(e, data) => {
        if (!data.value) {
          // Clear up the date in case the user clicks in the clear button inside the component
          props.updateProfile({ renewalDate: null })
          return
        }
        props.updateProfile({ renewalDate: data.value })
      }}
    />
  ) : (
    // TODO showCountdown should come back once its logic gets clarified
    <RORenewalDate renewalDate={props.renewalDate} showCountdown={false} />
  )
}
export const RORenewalDate = ({
  renewalDate,
  showCountdown
}: {
  renewalDate: string | undefined
  showCountdown: boolean
}) => {
  return (
    <span data-test-id="cp-profile-field-renewaldate-view">
      {`${renewalDate ? displayDate(renewalDate, 'DD MMM YYYY') : `-`} `}
      {showCountdown ? countdownWithinThirtyDays(renewalDate) : ''}
    </span>
  )
}

const ONE_DAY_IN_MILLI = 1000 * 60 * 60 * 24
const THIRTY_DAYS_IN_MILLI = ONE_DAY_IN_MILLI * 30

const countdownWithinThirtyDays = (dateString: string) => {
  if (!dateString) {
    return null
  }
  const date = new Date(dateString)

  const milliTillRenewal = date.getTime() - new Date().getTime()
  if (milliTillRenewal < THIRTY_DAYS_IN_MILLI) {
    const daysTillRenewal = Math.abs(Math.ceil(milliTillRenewal / ONE_DAY_IN_MILLI))
    return <WarningText>{daysTillRenewal <= 0 ? `Today` : `(D-${daysTillRenewal})`}</WarningText>
  } else {
    return null
  }
}

const WarningText = styled.span`
  color: #d45c64;
  font-weight: bold;
`
