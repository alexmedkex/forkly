import * as React from 'react'
import { shallow } from 'enzyme'
import ReviewDocumentsFeedback from './ReviewDocumentsFeedback'
import { IDocumentReviewStatus } from '../store/types'

describe('ReviewDocumentsFeedback component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      documentsReview: [
        {
          document: { id: '123', type: {}, metadata: [] },
          status: IDocumentReviewStatus.REJECTED,
          note: 'test'
        }
      ],
      documentRaw: 'Test',
      documentType: 'test type',
      isLoadingContent: false,
      location: {
        state: undefined
      },
      history: {
        goBack: jest.fn()
      },
      fetchSubmittedDocumentsWithDocumentContent: jest.fn(),
      fetchDocumentContent: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<ReviewDocumentsFeedback {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should set state properly', () => {
    const wrapper = shallow(<ReviewDocumentsFeedback {...defaultProps} />)

    expect(wrapper.state()).toEqual({
      numberOfDiscrepant: 1,
      documentSelected: defaultProps.documentsReview[0],
      documentSelectedIndex: 0
    })
  })

  it('should set state properly when showNextDocument is called', () => {
    const documentReviewed1 = {
      document: { id: '123', type: {}, metadata: [], product: { id: 'tradeFinance' } },
      status: IDocumentReviewStatus.REJECTED,
      note: 'test'
    }
    const documentReviewed2 = { ...documentReviewed1, document: { ...documentReviewed1.document, id: '1234' } }
    const wrapper = shallow(
      <ReviewDocumentsFeedback {...defaultProps} documentsReview={[documentReviewed1, documentReviewed2]} />
    )

    const instance = wrapper.instance() as ReviewDocumentsFeedback
    instance.showNextDocument()

    expect(wrapper.state()).toEqual({
      numberOfDiscrepant: 2,
      documentSelected: documentReviewed2,
      documentSelectedIndex: 1
    })
  })

  it('should set state properly when showPreviousDocument is called', () => {
    const documentReviewed1 = {
      document: { id: '123', type: {}, metadata: [], product: { id: 'tradeFinance' } },
      status: IDocumentReviewStatus.REJECTED,
      note: 'test'
    }
    const documentReviewed2 = { ...documentReviewed1, document: { ...documentReviewed1.document, id: '1234' } }
    const wrapper = shallow(
      <ReviewDocumentsFeedback {...defaultProps} documentsReview={[documentReviewed1, documentReviewed2]} />
    )

    wrapper.setState({
      numberOfDiscrepant: 2,
      documentSelected: documentReviewed2,
      documentSelectedIndex: 1
    })

    const instance = wrapper.instance() as ReviewDocumentsFeedback
    instance.showPreviousDocument()

    expect(wrapper.state()).toEqual({
      numberOfDiscrepant: 2,
      documentSelected: documentReviewed1,
      documentSelectedIndex: 0
    })
  })
})
