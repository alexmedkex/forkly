import { shallow } from 'enzyme'
import * as React from 'react'

import { Header, Image } from 'semantic-ui-react'

import { LoadingTransition } from './LoadingTransition'
import Text from '../text'
import { darkBlueGrey } from '../../styles/colors'

describe('LoadingTransition', () => {
  it('should render Image component with a correct size and centered', () => {
    const component = shallow(<LoadingTransition title="Loader title" imageSize="big" />)
    expect(component.find(Image).prop('size')).toEqual('big')
  })

  it('should render Header component centered', () => {
    const component = shallow(<LoadingTransition />)
    expect(component.find(Header).prop('className')).toEqual('centered')
  })

  it('should render Header component with a Text', () => {
    const component = shallow(<LoadingTransition title="title" fontColor="black" fontSize="20" />)
    expect(component.find(Text).prop('color')).toEqual('black')
    expect(component.find(Text).prop('fontSize')).toEqual('20')
    expect(component.find(Text).prop('children')).toEqual('title')
  })

  it('should render Header component with a Text and default parameters', () => {
    const component = shallow(<LoadingTransition />)
    expect(component.find(Text).prop('color')).toEqual(darkBlueGrey)
  })
})
