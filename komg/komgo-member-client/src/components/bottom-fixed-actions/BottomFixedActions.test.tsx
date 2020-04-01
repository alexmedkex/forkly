import * as React from 'react'
import * as renderer from 'react-test-renderer'
import BottomFixedActions from './BottomFixedActions'

describe('BottomFixedActions', () => {
  it('should match snapshot', () => {
    expect(renderer.create(<BottomFixedActions />).toJSON()).toMatchSnapshot()
  })
})
