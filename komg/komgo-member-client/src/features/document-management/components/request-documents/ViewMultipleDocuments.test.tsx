import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import ViewMultipleDocuments from './ViewMultipleDocuments'
import { mockDocuments } from '../../store/documents/mock-data'

describe('ViewMultipleDocuments', () => {
  const fakeDocument = { ...mockDocuments[0], id: '123', registrationDate: new Date('2019-08-26') }

  const defaultProps = {
    documentIds: ['123', '1234'],
    delete: jest.fn(),
    closeModal: jest.fn()
  }

  it('render component successfully', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find DocumentViewContainer with default open document id on 0 position', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)

    const docWrapper = wrapper.find('[data-test-id="view-multiple-documents-modal"]').children()

    expect(docWrapper.prop('documentId')).toBe('123')
  })

  it('should match snapshot for right section of the page', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)

    const instance = wrapper.instance() as ViewMultipleDocuments
    const rightSection = instance.renderRightSidebar(fakeDocument)

    expect(renderer.create(rightSection).toJSON()).toMatchSnapshot()
  })

  it('should set state for delete document and render confirm when handleDeleteDocument is called', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)

    const instance = wrapper.instance() as ViewMultipleDocuments

    instance.handleDeleteDocument(fakeDocument)

    expect(wrapper.state('deleteDocument')).toEqual(fakeDocument)
    expect(wrapper.find('Confirm').exists()).toBe(true)
  })

  it('should reset state when handleCancelDeleteDocument is called', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)
    wrapper.setState({
      deleteDocument: fakeDocument
    })

    const instance = wrapper.instance() as ViewMultipleDocuments

    instance.handleCancelDeleteDocument()

    expect(wrapper.state('deleteDocument')).toBeFalsy()
    expect(wrapper.find('Confirm').exists()).toBe(false)
  })

  it('should increase counter once showPreviousDocument is called', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)

    const instance = wrapper.instance() as ViewMultipleDocuments

    instance.showNextDocument()

    expect(wrapper.state('activeIndex')).toBe(1)
  })

  it('should decrease counter once showPreviousDocument is called', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)
    wrapper.setState({
      activeIndex: 1
    })

    const instance = wrapper.instance() as ViewMultipleDocuments

    instance.showPreviousDocument()

    expect(wrapper.state('activeIndex')).toBe(0)
  })

  it('should call delete props with appropriate props when handleConfirmDeleteDocument is called', () => {
    const wrapper = shallow(<ViewMultipleDocuments {...defaultProps} />)
    wrapper.setState({
      deleteDocument: fakeDocument
    })

    const instance = wrapper.instance() as ViewMultipleDocuments

    instance.handleConfirmDeleteDocument()

    expect(defaultProps.delete).toHaveBeenCalledWith('123')
  })
})
