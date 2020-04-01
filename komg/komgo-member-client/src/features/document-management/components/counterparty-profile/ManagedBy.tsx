import * as React from 'react'
import { Select } from 'semantic-ui-react'

import { HasMode, ProfileFormMode, HasProfileUpdater, HasPermittedUsers } from './CounterpartyProfileSection'

import { capitalize } from '../../../../utils/casings'
import { User } from '../../../../store/common/types'

export interface HasManagedBy extends HasPermittedUsers {
  managedBy: string
}

export interface Props extends HasManagedBy, HasMode, HasProfileUpdater {}

export const ManagedBy = (props: Props) => {
  return props.mode === ProfileFormMode.EDIT ? (
    <Select
      data-test-id="cp-profile-field-managedby-edit"
      style={{ maxWidth: '160px' }}
      compact={true}
      value={props.managedBy || 'unspecified'}
      options={[
        { key: 'unspecified', value: 'unspecified', text: 'Undefined' },
        ...props.permittedUsers.map(userToOption)
      ]}
      onChange={(e, data) => {
        const { value } = data
        props.updateProfile({ managedById: value === 'unspecified' ? '' : (value as string) })
      }}
    />
  ) : (
    <span data-test-id="cp-profile-field-managedby-view">{userIdToName(props.managedBy, props.permittedUsers)}</span>
  )
}

const userToOption = (user: User) => ({
  key: user.id,
  value: user.id,
  text: capitalize(`${user.firstName} ${user.lastName}`)
})

const userIdToName = (userId: string, users: User[]) => {
  const [user] = users.filter(user => user.id === userId)
  return user ? capitalize(`${user.firstName} ${user.lastName}`) : '-'
}
