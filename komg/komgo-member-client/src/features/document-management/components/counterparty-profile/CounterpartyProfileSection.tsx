import * as React from 'react'
import styled from 'styled-components'
import { Segment } from 'semantic-ui-react'

import { ProfileHeader } from './ProfileHeader'
import { ProfileSummary } from './ProfileSummary'
import { ProfileForm } from './ProfileForm'
import { CounterpartyProfile, RiskLevel } from '../../../counterparties/store/types'
import { User } from '../../../../store/common/types'

export interface CounterpartyProfileProps {
  counterpartyProfile: CounterpartyProfile | undefined
  counterpartyId: string
  permittedUsers: User[]
  fetchCounterpartyProfileAsync(counterpartyId: string): void
  createCounterpartyProfileAsync(createProfileRequest: CounterpartyProfile): void
  updateCounterpartyProfileAsync(updateProfileRequest: CounterpartyProfile): void
}

export interface HasMode {
  mode: ProfileFormMode
}

export interface HasCounterpartyProfile {
  counterpartyProfile: CounterpartyProfile
}

export interface HasPermittedUsers {
  permittedUsers: User[]
}

export enum ProfileFormMode {
  VIEW,
  EDIT
}

export type ProfileUpdater = (update: Partial<CounterpartyProfile>) => void

export interface HasProfileUpdater {
  updateProfile: ProfileUpdater
}

export const CounterpartyProfileSection = (props: CounterpartyProfileProps) => {
  const deriveProfileFromProps = () => ({ ...props.counterpartyProfile, counterpartyId: props.counterpartyId })

  const [mode, setMode] = React.useState(ProfileFormMode.VIEW)
  const [profile, setProfile] = React.useState({ ...profileOrUnspecifiedProfile(deriveProfileFromProps()) })
  // Initialize the counterpatyId in the profile in case it doesnt exist in DDBB
  profile.counterpartyId = props.counterpartyId

  React.useEffect(
    () => {
      updateProfile(deriveProfileFromProps())
    },
    [props.counterpartyProfile]
  )

  const updateProfile = (update: Partial<CounterpartyProfile>): void => {
    setProfile({ ...profile, ...update, counterpartyId: props.counterpartyId })
  }

  const saveProfile = props.counterpartyProfile
    ? props.updateCounterpartyProfileAsync
    : props.createCounterpartyProfileAsync

  return (
    <ProfileSegment data-test-id="cp-profile-container">
      <ProfileHeader
        mode={mode}
        setMode={setMode}
        onRestore={() => {
          updateProfile(deriveProfileFromProps())
        }}
        onSubmit={() => {
          setMode(ProfileFormMode.VIEW)
          saveProfile(profile)
        }}
      />
      <ProfileSummary>
        <ProfileForm
          mode={mode}
          permittedUsers={props.permittedUsers}
          counterpartyProfile={profileOrUnspecifiedProfile(profile)}
          updateProfile={profile => updateProfile(profile)}
        />
      </ProfileSummary>
    </ProfileSegment>
  )
}

export const profileOrUnspecifiedProfile = (profile: CounterpartyProfile | undefined): CounterpartyProfile => {
  const unspecified = {
    id: null,
    counterpartyId: null,
    renewalDate: null,
    managedById: null,
    riskLevel: RiskLevel.unspecified
  }
  return { ...unspecified, ...profile }
}

export const ProfileSegment = styled(Segment)`
  && {
    width: 438px;
    height: 207px;
    margin: 0;
    padding: 0;
    border: 1px solid #e8eef3;
    border-radius: 4px;
    box-shadow: none;
  }
`
