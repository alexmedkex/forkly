import * as React from 'react'
import renderer from 'react-test-renderer'
import SharedProperty, { IProps } from './SharedProperty'
import { shallow } from 'enzyme'
import { SharedIcon } from './SharedIcon'
import { NotSharedIcon } from './NotSharedIcon'

describe('SharedProperty', () => {
  const props: IProps = {
    shared: false,
    label: 'data',
    value: '1 days'
  }

  const sharedProps = {
    ...props,
    shared: true
  }

  it('should match snapshot', () => {
    expect(renderer.create(<SharedProperty {...props} />).toJSON()).toMatchSnapshot()
  })

  it('should display shared icon if shared', () => {
    const wrapper = shallow(<SharedProperty {...sharedProps} />)
    expect(wrapper.find(SharedIcon).exists()).toBeTruthy()
  })

  it('should display not shared icon if not shared', () => {
    const wrapper = shallow(<SharedProperty {...props} />)
    expect(wrapper.find(NotSharedIcon).exists()).toBeTruthy()
  })

  it('should display label', () => {
    const propsWithoutLabel = {
      ...props,
      value: undefined
    }
    const wrapper = shallow(<SharedProperty {...propsWithoutLabel} />)
    expect(
      wrapper
        .find('span')
        .first()
        .text()
    ).toBe(props.label)
  })

  it('should display label with additional data', () => {
    const propsWithoutLabel = {
      ...props
    }
    const wrapper = shallow(<SharedProperty {...propsWithoutLabel} />)
    const label = wrapper.find('span').first()
    expect(
      label
        .children()
        .find('span')
        .text()
    ).toBe(' - ' + props.value)
  })
})
