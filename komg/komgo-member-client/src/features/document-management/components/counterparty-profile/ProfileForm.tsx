import * as React from 'react'
import styled from 'styled-components'

import { Form } from 'semantic-ui-react'

import { ProfileFormMode, HasCounterpartyProfile, HasPermittedUsers } from './CounterpartyProfileSection'
import { RiskLevelField } from './RiskLevel'
import { RenewalDate } from './RenewalDate'
import { ManagedBy } from './ManagedBy'

import { CounterpartyProfile } from '../../../counterparties/store/types'

export interface Props extends HasCounterpartyProfile, HasPermittedUsers {
  mode: ProfileFormMode
  updateProfile(update: Partial<CounterpartyProfile>): void
}

export const ProfileForm = (props: Props) => {
  const { mode, counterpartyProfile, updateProfile } = props

  return (
    <Form data-test-id="cp-profile-form">
      <StyledFormField inline={true}>
        <StyledLabel>Risk level</StyledLabel>
        <RiskLevelField
          riskLevel={counterpartyProfile && counterpartyProfile.riskLevel}
          mode={props.mode}
          updateProfile={updateProfile}
        />
      </StyledFormField>
      <StyledFormField inline={true}>
        <StyledLabel>Renewal date</StyledLabel>
        <RenewalDate
          mode={mode}
          renewalDate={counterpartyProfile && counterpartyProfile.renewalDate}
          updateProfile={updateProfile}
          showCountdown={true}
        />
      </StyledFormField>
      <StyledFormField inline={true}>
        <StyledLabel>Managed by</StyledLabel>
        <ManagedBy
          mode={mode}
          permittedUsers={props.permittedUsers}
          managedBy={counterpartyProfile && counterpartyProfile.managedById}
          updateProfile={updateProfile}
        />
      </StyledFormField>
    </Form>
  )
}

const StyledLabel = styled.label`
  &&&&&&&&&& {
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 600;
    line-height: 21px;
    color: #5d768f;
  }
`

const StyledFormField = styled(Form.Field)`
  &&&&&&& {
    display: grid;
    grid-template-columns: 1fr [label] 2fr [control];
  }
`
