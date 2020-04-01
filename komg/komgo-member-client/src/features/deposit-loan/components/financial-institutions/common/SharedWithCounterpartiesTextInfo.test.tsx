import * as React from 'react'
import * as renderer from 'react-test-renderer'

import SharedWithCounterpartiesTextInfo from './SharedWithCounterpartiesTextInfo'

describe('SharedWithCounterpartiesTextInfo', () => {
  it('should match default snaptshout', () => {
    expect(renderer.create(<SharedWithCounterpartiesTextInfo />).toJSON()).toMatchSnapshot()
  })
})
