import * as React from 'react'
import * as renderer from 'react-test-renderer'

import EditTimeWrapper from './EditTimeWrapper'

describe('EditTimeWrapper', () => {
  it('should match default snaptshout', () => {
    expect(renderer.create(<EditTimeWrapper />).toJSON()).toMatchSnapshot()
  })
})
