import { mount } from 'enzyme'
import * as React from 'react'

import Text from './Text'
import { black } from '../../styles/colors'

describe('Text', () => {
  it('should render text passed in children', () => {
    const component = mount(<Text>hello world</Text>)
    const style = component.find('span')

    expect(style).toHaveStyleRule('font-size', '14px')
    expect(style).toHaveStyleRule('font-weight', 'normal')
    expect(style).toHaveStyleRule('color', black)
    expect(style).toHaveStyleRule('margin', '0')
  })
  it('should render text passed in children', () => {
    const component = mount(
      <Text bold={true} fontSize="10" color="red" margin="0 20px">
        hello world
      </Text>
    )
    const style = component.find('span')

    expect(style).toHaveStyleRule('font-size', '10px')
    expect(style).toHaveStyleRule('font-weight', 'bold')
    expect(style).toHaveStyleRule('color', 'red')
    expect(style).toHaveStyleRule('margin', '0 20px')
  })
})
