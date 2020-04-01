import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { LightHeaderWrapper } from './HeaderWrapper'

describe('LightHeaderWrapper', () => {
  it('should match snapshot', () => {
    expect(renderer.create(<LightHeaderWrapper />).toJSON()).toMatchSnapshot()
  })
})
