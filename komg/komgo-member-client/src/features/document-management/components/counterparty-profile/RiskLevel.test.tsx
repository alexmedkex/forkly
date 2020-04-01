import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { RiskLevelField, Props } from './RiskLevel'
import { ProfileFormMode } from './CounterpartyProfileSection'
import { fakeProfile } from './utils/faker'

describe('RiskLevelField', () => {
  const mockProfile = fakeProfile()
  const mockProps: Props = {
    riskLevel: mockProfile.riskLevel,
    updateProfile: jest.fn(),
    mode: ProfileFormMode.VIEW
  }

  it('renders in view mode', () => {
    const viewModeProps = mockProps
    expect(renderer.create(<RiskLevelField {...viewModeProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders in edit mode', () => {
    const editModeProps = { ...mockProps, ...{ mode: ProfileFormMode.EDIT } }
    expect(renderer.create(<RiskLevelField {...editModeProps} />).toJSON()).toMatchSnapshot()
  })
})
