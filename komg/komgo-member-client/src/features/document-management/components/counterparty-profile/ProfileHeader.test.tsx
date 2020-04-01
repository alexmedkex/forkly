import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { ProfileHeader, Props } from './ProfileHeader'
import { ProfileFormMode } from './CounterpartyProfileSection'

describe('ProfileHeader', () => {
  let mode = ProfileFormMode.VIEW
  const setMode = jest.fn((toMode: ProfileFormMode) => {
    mode = toMode
  })
  const mockProps: Props = {
    mode: ProfileFormMode.VIEW,
    onSubmit: jest.fn(),
    onRestore: jest.fn(),
    setMode
  }
  it('renders in view mode', () => {
    expect(renderer.create(<ProfileHeader {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
