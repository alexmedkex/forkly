import { shallow } from 'enzyme'
import * as React from 'react'
import { SectionCard } from './SectionCard'
import * as renderer from 'react-test-renderer'

describe('SectionCard component', () => {
  const mockProps = {
    title: 'string',
    children: undefined
  }
  it('should render an empty SectionCard item with props', () => {
    const wrapper = shallow(<SectionCard {...mockProps} />)
    expect(wrapper.find('SectionCard').exists).toBeTruthy()
  })

  it('renders', () => {
    expect(renderer.create(<SectionCard {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
