import { shallow } from 'enzyme'
import * as React from 'react'
import SaveTemplateModal from './SaveTemplateModal'

import { mockData } from '../../../document-management/store/templates/mock-data'

describe('SaveTemplateModal component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = { template: mockData[0], toggleVisible: mockFunc, onSave: mockFunc }

  it('should render a SaveTemplateModal item with props', () => {
    const wrapper = shallow(<SaveTemplateModal {...mockProps} visible={true} />)
    expect(wrapper.find('SaveTemplateModal').exists).toBeTruthy()
  })

  it('should render a SaveTemplateModal item with props (visible false)', () => {
    const wrapper = shallow(<SaveTemplateModal {...mockProps} visible={false} />)
    expect(wrapper.find('SaveTemplateModal').exists).toBeTruthy()
  })
})
