import * as React from 'react'
import * as renderer from 'react-test-renderer'

import Background from './Background'

describe('Background', () => {
  it('should render background', () => {
    expect(renderer.create(<Background />).toJSON()).toMatchSnapshot()
  })
})
