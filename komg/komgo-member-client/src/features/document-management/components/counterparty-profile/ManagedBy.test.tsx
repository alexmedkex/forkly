import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { ManagedBy, Props } from './ManagedBy'
import { ProfileFormMode } from './CounterpartyProfileSection'
import { fakeProfile } from './utils/faker'

describe('ManagedBy', () => {
  const mockProfile = fakeProfile()
  const mockProps: Props = {
    managedBy: mockProfile.managedById,
    permittedUsers: [],
    updateProfile: jest.fn(),
    mode: ProfileFormMode.VIEW
  }

  it('renders in view mode', () => {
    const viewModeProps = mockProps
    expect(renderer.create(<ManagedBy {...viewModeProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders in edit mode', () => {
    const editModeProps = { ...mockProps, ...{ mode: ProfileFormMode.EDIT } }
    expect(renderer.create(<ManagedBy {...editModeProps} />).toJSON()).toMatchSnapshot()
  })
})
