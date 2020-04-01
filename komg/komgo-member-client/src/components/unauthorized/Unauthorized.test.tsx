import { shallow } from 'enzyme'
import * as React from 'react'
import Unauthorized from './Unauthorized'

describe('Unauthorized', () => {
  it('should render h1 with some text', () => {
    const component = shallow(<Unauthorized>hello world</Unauthorized>)

    const h1Text = component.find('h1').text()
    expect(h1Text.length).toBeGreaterThan(0)
  })
})
