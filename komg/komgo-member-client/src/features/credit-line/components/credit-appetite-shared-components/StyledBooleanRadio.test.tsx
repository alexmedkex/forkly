import * as React from 'react'
import * as renderer from 'react-test-renderer'

import StyledBooleanRadio from './StyledBooleanRadio'

describe('StyledBooleanRadio', () => {
  it('should match default snaptshout', () => {
    expect(renderer.create(<StyledBooleanRadio />).toJSON()).toMatchSnapshot()
  })
})
