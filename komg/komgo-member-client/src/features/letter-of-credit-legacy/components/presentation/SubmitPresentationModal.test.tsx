import * as React from 'react'
import { shallow } from 'enzyme'
import { Formik } from 'formik'
import { Modal, Button, List } from 'semantic-ui-react'
import SubmitPresentationModal, { LCReference } from './SubmitPresentationModal'
import { fakePresentation, fakeDocument, fakeMember } from '../../utils/faker'
import { ErrorMessage, LoadingTransition } from '../../../../components'

describe('SubmitPresentationModal', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      open: true,
      presentation: fakePresentation({ staticId: '123', reference: '123' }),
      documents: [
        fakeDocument({ context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' } })
      ],
      isSubmitting: false,
      submittingError: [],
      members: [
        fakeMember({
          staticId: 'a28b8dc3-8de9-4559-8ca1-272ccef52b47',
          commonName: 'Beneficiary Name'
        })
      ],
      toggleSubmitPresentationModal: jest.fn(),
      submitPresentation: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render presentation header with presentation reference', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} />)

    const header = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Header)
      .shallow()

    expect(header.text()).toBe(`Presentation #${defaultProps.presentation.reference}<styled.span /><styled.p />`)
  })

  it('should render lc reference', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} />)

    const lcReference = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Header)
      .shallow()
      .find(LCReference)
      .shallow()

    expect(lcReference.text()).toBe(defaultProps.presentation.LCReference)
  })

  it('should render loader', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} isSubmitting={true} />)

    const loader = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Content)
      .find(LoadingTransition)

    expect(loader.length).toBe(1)
  })

  it('should render error', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} submittingError={[{ message: 'Error' }]} />)

    const error = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Content)
      .find(ErrorMessage)

    expect(error.length).toBe(1)
  })

  it('should render list of documents', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} />)

    const list = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Content)
      .find(List)

    expect(list.length).toBe(1)
  })

  it('should call close modal for cancel is pressed', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} />)

    const cancelButton = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Actions)
      .find(Button)
      .at(0)
    cancelButton.simulate('click')

    expect(defaultProps.toggleSubmitPresentationModal).toHaveBeenCalled()
  })

  it('should call submitPresentation when formik calls handleSubmit', () => {
    const wrapper = shallow(<SubmitPresentationModal {...defaultProps} />)
    const instance = wrapper.instance() as SubmitPresentationModal
    instance.handleSubmit({ comment: 'ok' })

    expect(defaultProps.submitPresentation).toHaveBeenCalledWith(defaultProps.presentation, { comment: 'ok' })
  })
})
