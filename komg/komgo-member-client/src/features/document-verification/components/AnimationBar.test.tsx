import * as React from 'react'
import * as renderer from 'react-test-renderer'

import AnimationBar from './AnimationBar'

describe('AnimationBar', () => {
  it('should render AnimationBar', () => {
    expect(renderer.create(<AnimationBar elementNumber={0} />).toJSON()).toMatchSnapshot()
  })
})
