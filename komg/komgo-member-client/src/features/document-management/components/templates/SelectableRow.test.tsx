import { shallow } from 'enzyme'
import * as React from 'react'
import SelectableRow from './SelectableRow'

import { mockData } from '../../store/templates/mock-data'

describe('SelectableRow component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = { template: mockData[0], active: true, rowId: '', onClick: mockFunc }

  it('should render a SelectableRow item with props', () => {
    const wrapper = shallow(<SelectableRow {...mockProps} />)
    expect(wrapper.find('SelectableRow').exists).toBeTruthy()
  })

  it('should render a SelectableRow item with props (active false)', () => {
    const wrapper = shallow(<SelectableRow {...mockProps} active={false} template={mockData[1]} />)
    expect(wrapper.find('SelectableRow').exists).toBeTruthy()
  })

  it('should verify onClick on SelectableRow', () => {
    const wrapper = shallow(<SelectableRow {...mockProps} />)
    wrapper.simulate('click')
    expect(mockProps.onClick).toBeCalled()
  })
})
