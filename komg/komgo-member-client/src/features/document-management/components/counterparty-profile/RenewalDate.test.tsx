import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { RenewalDate, Props } from './RenewalDate'
import { ProfileFormMode } from './CounterpartyProfileSection'
import { fakeProfile, mockDate } from './utils/faker'

describe('RenewalDate', () => {
  let mockProps: Props

  beforeEach(() => {
    mockDate().freeze('Tue Jul 16 2019 00:00:00 GMT+0000 (UTC)')
    const mockProfile = fakeProfile()
    mockProps = {
      renewalDate: mockProfile.renewalDate,
      updateProfile: jest.fn(),
      mode: ProfileFormMode.VIEW,
      showCountdown: true
    }
  })

  afterEach(() => {
    mockDate().restore()
  })

  it('renders in view mode', () => {
    const viewModeProps = mockProps
    expect(renderer.create(<RenewalDate {...viewModeProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders in edit mode', () => {
    const editModeProps = { ...mockProps, ...{ mode: ProfileFormMode.EDIT } }
    expect(renderer.create(<RenewalDate {...editModeProps} />).toJSON()).toMatchSnapshot()
  })
})
