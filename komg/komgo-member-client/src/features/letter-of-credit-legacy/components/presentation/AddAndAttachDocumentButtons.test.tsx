import * as React from 'react'
import { shallow } from 'enzyme'
import AddAndAttachDocumentButtons, { AddFirstDocument } from './AddAndAttachDocumentButtons'
import { fakePresentation } from '../../utils/faker'
import SimpleButton from '../../../../components/buttons/SimpleButton'

describe('AddAndAttachDocumentButtons component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      presentation: fakePresentation({ staticId: '123' }),
      toggleAddDocumentModal: jest.fn(),
      toggleAttachDocumentModal: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<AddAndAttachDocumentButtons {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find AddFirstDocument if document does not exist in presentation', () => {
    const presentation = { ...defaultProps.presentation, documents: [] }
    const wrapper = shallow(<AddAndAttachDocumentButtons {...defaultProps} presentation={presentation} />)

    const addFirstDocument = wrapper.find(AddFirstDocument)

    expect(addFirstDocument.length).toBe(1)
  })

  it('should call toggleAddOrAttachDocumentModal when button for adding first document is clicked', () => {
    const presentation = { ...defaultProps.presentation, documents: [] }
    const wrapper = shallow(<AddAndAttachDocumentButtons {...defaultProps} presentation={presentation} />)

    const simpleButton = wrapper
      .find(AddFirstDocument)
      .find(SimpleButton)
      .at(0)
    simpleButton.simulate('click')

    expect(defaultProps.toggleAddDocumentModal).toHaveBeenCalled()
  })

  it('should not find AddFirstDocument but should find simple button for adding new document', () => {
    const wrapper = shallow(<AddAndAttachDocumentButtons {...defaultProps} />)

    const addFirstDocument = wrapper.find(AddFirstDocument)
    const addNewDocument = wrapper.find(SimpleButton)

    expect(addFirstDocument.length).toBe(0)
    expect(addNewDocument.length).toBe(2)
  })

  it('should call toggleAddDocumentModal and toggleAttachDocumentModal when button for attaching new document is clicked', () => {
    const presentation = { ...defaultProps.presentation, documents: [] }
    const wrapper = shallow(<AddAndAttachDocumentButtons {...defaultProps} presentation={presentation} />)

    const buttons = wrapper.find(AddFirstDocument).find(SimpleButton)

    buttons.at(0).simulate('click')
    buttons.at(1).simulate('click')

    expect(defaultProps.toggleAddDocumentModal).toHaveBeenCalled()
    expect(defaultProps.toggleAttachDocumentModal).toHaveBeenCalled()
  })
})
