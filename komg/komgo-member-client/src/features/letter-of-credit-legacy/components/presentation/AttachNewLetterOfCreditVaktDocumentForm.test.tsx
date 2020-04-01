import * as React from 'react'
import { shallow } from 'enzyme'
import AttachNewLetterOfCreditVaktDocumentForm from './AttachNewLetterOfCreditVaktDocumentForm'
import { LoadingTransition, ErrorMessage } from '../../../../components'

describe('AttachNewLetterOfCreditVaktDocumentForm component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      visible: false,
      isAttaching: false,
      title: 'title',
      vaktDocuments: [],
      isFetchingVaktDocuments: false,
      fetchingVaktDocumentErrors: [],
      attachingDocumentsError: [],
      toggleVisible: jest.fn(),
      handleSubmit: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<AttachNewLetterOfCreditVaktDocumentForm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render component successfully when attach is open', () => {
    const wrapper = shallow(<AttachNewLetterOfCreditVaktDocumentForm {...defaultProps} visible={true} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find loader when isAttaching is true', () => {
    const wrapper = shallow(
      <AttachNewLetterOfCreditVaktDocumentForm {...defaultProps} visible={true} isAttaching={true} />
    )

    const loader = wrapper.shallow().find(LoadingTransition)

    expect(loader.length).toBe(1)
  })

  it('should find error when fetchingVaktDocumentErrors has error', () => {
    const wrapper = shallow(
      <AttachNewLetterOfCreditVaktDocumentForm
        {...defaultProps}
        visible={true}
        fetchingVaktDocumentErrors={[{ message: 'Error' }]}
      />
    )

    const error = wrapper.shallow().find(ErrorMessage)

    expect(error.length).toBe(1)
  })

  it('should find error when attachingDocumentsError has error', () => {
    const wrapper = shallow(
      <AttachNewLetterOfCreditVaktDocumentForm
        {...defaultProps}
        visible={true}
        attachingDocumentsError={[{ message: 'Error' }]}
        vaktDocuments={[{ id: '1' }]}
      />
    )

    const error = wrapper.shallow().find(ErrorMessage)

    expect(error.length).toBe(1)
  })
})
