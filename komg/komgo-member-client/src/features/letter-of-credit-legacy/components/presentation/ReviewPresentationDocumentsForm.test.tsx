import * as React from 'react'
import { shallow } from 'enzyme'
import ReviewPresentationDocumentsForm, { StyledForm, NextAction } from './ReviewPresentationDocumentsForm'
import { fakePresentation } from '../../utils/faker'
import { Radio, Button, Form } from 'semantic-ui-react'
import { LCPresentationStatus } from '../../store/presentation/types'

describe('ReviewPresentationDocumentsForm', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      documentsReview: [],
      history: jest.fn(),
      location: { pathname: '#' },
      settingUpCompliantDocumentsError: [],
      isSettingUpCompliantDocuments: false,
      allDocumentsReviewed: true,
      numberOfRejectedDocuments: 0,
      members: [],
      isSettingUpDiscrepantDocuments: false,
      settingUpDiscrepantDocumentsError: [],
      presentation: fakePresentation({ status: LCPresentationStatus.DocumentsPresented }),
      setPresentationDocumentsCompliant: jest.fn(),
      clearError: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find radio button with value compliant and it should not be disabled when allDocumentsReviewed=true and numberOfRejectedDocuments=0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)

    const compliantRadioButton = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'documents-compliant' })

    expect(compliantRadioButton.exists()).toBe(true)
    expect(compliantRadioButton.props().value).toBe('Compliant')
    expect(compliantRadioButton.props().disabled).toBe(false)
  })

  it('should find radio button with value compliant and it should be disabled when allDocumentsReviewed=false and numberOfRejectedDocuments=0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} allDocumentsReviewed={false} />)

    const compliantRadioButton = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'documents-compliant' })

    expect(compliantRadioButton.props().disabled).toBe(true)
  })

  it('should find p tag with message when numberOfRejectedDocuments > 0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} numberOfRejectedDocuments={1} />)

    const formFields = wrapper
      .find(StyledForm)
      .shallow()
      .find(Form.Field)
    const message = formFields.at(1).find('p')

    expect(message.text()).toBe(
      'You can deem presentation as compliant only when all documents are deemed as compliant.'
    )
  })

  it('should find button that is not disabled', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)

    const button = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'complete-review' })

    expect(button.props().disabled).toBe(false)
  })

  it('should find radio button (name = isCompliant) - compliant checked set to false when numberOfRejectedDocuments is more then 0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} numberOfRejectedDocuments={1} />)

    const compliantRadioButton = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'documents-compliant' })

    expect(compliantRadioButton.props().checked).toBe(false)
  })

  it('should find radio button (name = isCompliant) - discrepant checked set to true when numberOfRejectedDocuments is more then 0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} numberOfRejectedDocuments={1} />)

    const discrepantRadioButton = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'documents-discrepant' })

    expect(discrepantRadioButton.props().checked).toBe(true)
  })

  it('should find radio button (name = isCompliant) - compliant checked set to true when numberOfRejectedDocuments is 0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)

    const compliantRadioButton = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'documents-compliant' })

    expect(compliantRadioButton.props().checked).toBe(true)
  })

  it('should find radio button (name = isCompliant) - discrepant checked set to false when numberOfRejectedDocuments is 0', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)

    const discrepantRadioButton = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'documents-discrepant' })

    expect(discrepantRadioButton.props().checked).toBe(false)
  })

  it('should find 8 form fields when numberOfRejectedDocuments isCompliant is false', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} numberOfRejectedDocuments={1} />)

    const formFields = wrapper
      .find(StyledForm)
      .shallow()
      .find(Form.Field)

    expect(formFields.length).toBe(8)
  })

  it('should find 5 form fields when presentation is not in status DOCUMENT_PRESENTED', () => {
    const presentation = fakePresentation()
    const wrapper = shallow(
      <ReviewPresentationDocumentsForm
        {...defaultProps}
        numberOfRejectedDocuments={1}
        presentation={fakePresentation}
      />
    )

    const formFields = wrapper
      .find(StyledForm)
      .shallow()
      .find(Form.Field)

    expect(formFields.length).toBe(5)
  })

  it('should find Complete review button that is disabled when allDocumentsReviewed is false', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} allDocumentsReviewed={false} />)

    const button = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'complete-review' })

    expect(button.props().disabled).toBe(true)
  })

  it('should open confirm when Complete review is clicked', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)

    const button = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'complete-review' })

    button.simulate('click')

    expect(wrapper.state().open).toBe(true)
  })

  it('should find nextAction field with default value set to "Provide notice of discrepancies" when isCompliant is false', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)
    wrapper.setState({ isCompliant: false })

    const radioButtonNoticeOfDiscrepancies = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'next-action-provide-notice-of-discrepancies' })

    expect(radioButtonNoticeOfDiscrepancies.props().checked).toBe(true)
  })

  it('should set nextAction in state when radio "Request waiver of discrepancies from applicant" is checked', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)
    wrapper.setState({ isCompliant: false })

    const radioButtonWaiverOfDiscrepancies = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'next-action-request-waiver-of-discrepancies' })
    radioButtonWaiverOfDiscrepancies.simulate('change', {}, { value: NextAction.RequestWaiverOfDiscrepancies })

    expect(wrapper.state('nextAction')).toBe(NextAction.RequestWaiverOfDiscrepancies)
  })

  it('radio button "Request waiver of discrepancies from applicant" should be checked when nextAction is set to  "Request waiver of discrepancies from applicant"', () => {
    const wrapper = shallow(<ReviewPresentationDocumentsForm {...defaultProps} />)
    wrapper.setState({ isCompliant: false, nextAction: NextAction.RequestWaiverOfDiscrepancies })

    const radioButtonWaiverOfDiscrepancies = wrapper
      .find(StyledForm)
      .shallow()
      .find({ 'data-test-id': 'next-action-request-waiver-of-discrepancies' })

    expect(radioButtonWaiverOfDiscrepancies.props().checked).toBe(true)
  })
})
