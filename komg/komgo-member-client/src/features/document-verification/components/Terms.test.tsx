import * as React from 'react'
import * as renderer from 'react-test-renderer'

import Terms from './Terms'

describe('Terms', () => {
  it('should render Terms', () => {
    expect(renderer.create(<Terms />).toJSON()).toMatchSnapshot()
  })
})
