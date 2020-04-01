import * as React from 'react'
import { shallow } from 'enzyme'
import { Button } from 'semantic-ui-react'
import ReviewPresentationDocuments, { RedirectToReview } from './ReviewPresentationDocuments'
import { fakePresentation } from '../../utils/faker'
import { mockReceivedDocuments } from './../../../review-documents/store/mock-data'
import ReviewPresentationDocumentsForm from './ReviewPresentationDocumentsForm'

describe('ReviewPresentationDocuments', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      documentsReview: [{ ...mockReceivedDocuments.documents[0], status: 'pending' }],
      history: {
        push: jest.fn()
      },
      location: { pathname: '#' },
      settingUpDocumentsCompliantError: [],
      isSettingUpDocumentsCompliant: false,
      isSettingUpDiscrepantDocuments: false,
      settingUpDiscrepantDocumentsError: [],
      requestId: '123',
      presentation: fakePresentation(),
      setPresentationDocumentsCompliant: jest.fn(),
      clearError: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<ReviewPresentationDocuments {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should set state with appropriate data', () => {
    const wrapper = shallow(<ReviewPresentationDocuments {...defaultProps} />)

    expect(wrapper.state()).toEqual({
      allDocumentsReviewed: false,
      numberOfAcceptedDocuments: 0,
      numberOfRejectedDocuments: 0,
      numberOfPendingDocuments: 1
    })
  })

  it('should set state with appropriate data when all documents are reviewed', () => {
    const wrapper = shallow(
      <ReviewPresentationDocuments
        {...defaultProps}
        documentsReview={[{ ...mockReceivedDocuments.documents[0], status: 'accepted' }]}
      />
    )

    expect(wrapper.state()).toEqual({
      allDocumentsReviewed: true,
      numberOfAcceptedDocuments: 1,
      numberOfRejectedDocuments: 0,
      numberOfPendingDocuments: 0
    })
  })

  it('should find RedirectToReview when documents are not reviewed', () => {
    const wrapper = shallow(<ReviewPresentationDocuments {...defaultProps} />)

    const redirectToReview = wrapper.find(RedirectToReview)

    expect(redirectToReview.length).toBe(1)
  })

  it('should redirect to the review page with appropriate props', () => {
    const wrapper = shallow(<ReviewPresentationDocuments {...defaultProps} />)
    const redirectButton = wrapper.find(RedirectToReview).find(Button)

    redirectButton.simulate('click')

    expect(defaultProps.history.push).toHaveBeenCalledWith({
      pathname: '/review',
      state: { requestId: defaultProps.requestId, redirectBackUrl: defaultProps.location.pathname }
    })
  })

  it('should find ReviewPresentationDocumentsForm when documents are loaded', () => {
    const wrapper = shallow(<ReviewPresentationDocuments {...defaultProps} />)

    const reviewPresentationForm = wrapper.find(ReviewPresentationDocumentsForm)

    expect(reviewPresentationForm.length).toBe(1)
  })
})
