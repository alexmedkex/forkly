import * as React from 'react'
import styled from 'styled-components'
import { Icon } from 'semantic-ui-react'

import { ProfileFormMode } from './CounterpartyProfileSection'

export interface Props {
  mode: ProfileFormMode
  setMode(toMode: ProfileFormMode): void
  onSubmit(): void
  onRestore(): void
}

export const ProfileHeader = (props: Props) => {
  return (
    <ProfileHeaderContainer data-test-id="cp-profile-header">
      <StyledProfileHeaderTitle data-test-id="cp-profile-header-title">Profile Summary</StyledProfileHeaderTitle>
      <ProfileHeaderButtonGroup {...props} />
    </ProfileHeaderContainer>
  )
}

const ProfileHeaderButtonGroup = (props: Props) => {
  return props.mode === ProfileFormMode.EDIT ? (
    <ButtonContainer data-test-id="cp-profile-header-buttongroup">
      <WeightedIcons
        data-test-id="cp-profile-button-cancel"
        name="cancel"
        onClick={() => {
          props.onRestore()
          props.setMode(ProfileFormMode.VIEW)
        }}
      />
      <WeightedIcons data-test-id="cp-profile-button-submit" name="check" onClick={() => props.onSubmit()} />
    </ButtonContainer>
  ) : (
    <ButtonContainer data-test-id="cp-profile-header-buttongroup">
      <WeightedIcons
        data-test-id="cp-profile-button-edit"
        name="edit"
        onClick={() => props.setMode(ProfileFormMode.EDIT)}
      />
    </ButtonContainer>
  )
}

const ProfileHeaderContainer = styled.div`
  min-height: 41px;
  border-bottom: 1px solid #e8eef3;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`

const StyledProfileHeaderTitle = styled.div`
  text-transform: uppercase;
  color: #5d768f;
  font-size: 11px;
  font-weight: 600;
  line-height: 21px;
  flex-basis: 85%;
  text-align: center;
`

const ButtonContainer = styled.div`
  flex-basis: 15%;
`

const WeightedIcons = styled(Icon)`
  &&& {
    font-size: 1.2em;
  }
`
