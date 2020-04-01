import * as React from 'react'
import * as renderer from 'react-test-renderer'

import NoTypeFound from './NoTypeFound'

describe('NoFoundMessage', () => {
  it('should match default snapshot', () => {
    expect(renderer.create(<NoTypeFound message="Test" />).toJSON()).toMatchSnapshot()
  })

  it('should match snapshot with default message', () => {
    expect(renderer.create(<NoTypeFound />).toJSON()).toMatchSnapshot()
  })
})
