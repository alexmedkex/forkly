import { shallow, render } from 'enzyme'
import * as React from 'react'
import SelectAutomatchModal from './SelectAutomatchModal'

import { mockCategories } from '../../../../document-management/store/categories/mock-data'

import { anonDocument4 } from '../../../../document-management/store/documents/mock-data'

describe('SelectAutomatchModal component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = {
    category: mockCategories[0],
    documentType: anonDocument4.type,
    allDocs: [anonDocument4],
    open: true,
    onConfirmClose: mockFunc,
    onToggleVisible: mockFunc,
    openViewDocument: jest.fn()
  }

  it('should render a SelectAutomatchModal item with props', () => {
    const wrapper = shallow(<SelectAutomatchModal {...mockProps} />)
    expect(wrapper.find('SelectAutomatchModal').exists).toBeTruthy()
  })

  it('should call openViewDocument once view docs button is clicked', async () => {
    const wrapper = shallow(<SelectAutomatchModal {...mockProps} />)

    const instance = wrapper.instance() as SelectAutomatchModal

    const content = shallow(instance.renderContent())

    const button = content
      .find('[data-test-id="request-documents-list-doctypes"]')
      .shallow()
      .shallow()
      .find('[data-test-id="automatch-list-3"]')
      .shallow()
      .find('[data-test-id="automatch-view-Board Resolution - test.pdf"]')

    button.simulate('click')

    expect(mockProps.openViewDocument).toHaveBeenCalledWith('3')
  })
})
