import * as React from 'react'
import * as renderer from 'react-test-renderer'

import SimpleIcon from './SimpleIcon'

describe('SimpleIcon', () => {
  it('should match default snaptshout', () => {
    expect(renderer.create(<SimpleIcon />).toJSON()).toMatchSnapshot()
  })
})
