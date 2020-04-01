import * as React from 'react'
import * as renderer from 'react-test-renderer'
import GreyHeader from './GreyHeader'

describe('GreyHeader', () => {
  it('should match snapshot', () => {
    expect(renderer.create(<GreyHeader />).toJSON()).toMatchSnapshot()
  })
})
