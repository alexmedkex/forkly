import { shallow } from 'enzyme'
import * as React from 'react'
import { AddNewDocumentForm, Props } from './AddNewDocumentForm'
import { Formik } from 'formik'
import { DocumentTypeField } from './new-document-components/DocumentTypeField'

describe('AddNewDocumentForm component', () => {
  const mockFunc = jest.fn(() => void 0)
  const props: Props = {
    categories: [],
    documents: [],
    profile: null,
    documentTypes: [],
    handleSubmit: mockFunc,
    preselectedDocumentType: '',
    preselectedCategory: '',
    toggleSubmit: jest.fn()
  }

  it('should render a AddNewDocumentForm item with props', () => {
    const wrapper = shallow(<AddNewDocumentForm {...props} />)
    expect(wrapper.find('AddNewDocumentForm').exists).toBeTruthy()
  })

  it('should not set DocumentTypeField disabled when documentTypeDisabled is not added to props ', () => {
    const wrapper = shallow(<AddNewDocumentForm {...props} />)
    expect(
      wrapper
        .find(Formik)
        .dive()
        .find(DocumentTypeField)
        .props()
    ).toHaveProperty('disabled', undefined)
  })

  it('should set DocumentTypeField disabled to true when documentTypeDisabled=true ', () => {
    const testProps = { ...props, documentTypeDisabled: true }
    const wrapper = shallow(<AddNewDocumentForm {...testProps} />)
    expect(
      wrapper
        .find(Formik)
        .dive()
        .find(DocumentTypeField)
        .props()
    ).toHaveProperty('disabled', true)
  })

  it('should set DocumentTypeField disabled to false when documentTypeDisabled=false ', () => {
    const testProps = { ...props, documentTypeDisabled: false }
    const wrapper = shallow(<AddNewDocumentForm {...testProps} />)
    expect(
      wrapper
        .find(Formik)
        .dive()
        .find(DocumentTypeField)
        .props()
    ).toHaveProperty('disabled', false)
  })

  it.skip('should call OnSubmit', () => {
    // Act
    const wrapper = shallow(<AddNewDocumentForm {...props} />)
    wrapper
      .find('Form')
      .first()
      .simulate('submit')
    // Assert
    expect(props.handleSubmit).toBeCalled()
  })

  it.skip('should call OnChange', () => {
    // Act
    const wrapper = shallow(<AddNewDocumentForm {...props} />)
    wrapper
      .find('Input')
      .first()
      .simulate('change', { target: { value: 'foo' } })
  })
})
