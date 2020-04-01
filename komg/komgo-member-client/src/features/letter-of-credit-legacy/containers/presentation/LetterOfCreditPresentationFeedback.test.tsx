import * as React from 'react'
import { shallow } from 'enzyme'
import { LetterOfCreditPresentationFeedback } from './LetterOfCreditPresentationFeedback'
import { LoadingTransition } from '../../../../components'

describe('LetterOfCreditPresentationFeedback component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      isFetching: false,
      documentsReview: [],
      documentRaw: 'Test',
      documentType: 'test type',
      isLoadingContent: false,
      location: {
        state: undefined
      },
      history: {
        goBack: jest.fn()
      },
      match: {
        params: {
          lcId: '123',
          presentationId: '1234'
        }
      },
      fetchLCPresentationSubmittedDocWithDocContent: jest.fn(),
      fetchDocumentContentAsync: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<LetterOfCreditPresentationFeedback {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find LoadingTransition while fetching and not find ReviewDocumentsFeedback', () => {
    const wrapper = shallow(<LetterOfCreditPresentationFeedback {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find(LoadingTransition)
    const reviewDocumentsFeedback = wrapper.find('ReviewDocumentsFeedback')

    expect(loadingTransition.length).toBe(1)
    expect(reviewDocumentsFeedback.length).toBe(0)
  })

  it('should find ReviewDocumentsFeedback', () => {
    const wrapper = shallow(<LetterOfCreditPresentationFeedback {...defaultProps} />)

    const reviewDocumentsFeedback = wrapper.find('ReviewDocumentsFeedback')

    expect(reviewDocumentsFeedback.length).toBe(1)
  })

  it('should call fetchLCPresentationSubmittedDocWithDocContent with appropriate params', () => {
    const wrapper = shallow(<LetterOfCreditPresentationFeedback {...defaultProps} />)

    expect(defaultProps.fetchLCPresentationSubmittedDocWithDocContent).toHaveBeenCalledWith(
      defaultProps.match.params.lcId,
      defaultProps.match.params.presentationId,
      undefined
    )
  })
})
