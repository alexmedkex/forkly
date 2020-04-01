import * as React from 'react'
import { shallow } from 'enzyme'
import PresentationDetails, { Comment, IProps } from './PresentationDetails'
import { fakePresentation, fakeDocument, fakeMember } from '../../utils/faker'
import { mockReceivedDocuments } from '../../../review-documents/store/mock-data'
import * as renderer from 'react-test-renderer'

describe('PresentationDetails', () => {
  let defaultProps: IProps

  beforeEach(() => {
    defaultProps = {
      presentation: fakePresentation({ staticId: '123', reference: '123' }),
      documents: [
        fakeDocument({
          context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' },
          id: 'string'
        })
      ],
      members: [fakeMember({ staticId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c', commonName: 'Applicant Name' })],
      documentsReview: [{ ...mockReceivedDocuments.documents[0], status: 'pending' }],
      documentViewClickHandler: jest.fn(),
      documentReviewClickHandler: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<PresentationDetails {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should not find comment', () => {
    const wrapper = shallow(<PresentationDetails {...defaultProps} />)

    const comment = wrapper.find(Comment)

    expect(comment.length).toBe(0)
  })

  it('should find comment', () => {
    const presentationWithComment = {
      ...fakePresentation({ staticId: '123', reference: '123' }),
      beneficiaryComments: 'Comment'
    }
    const wrapper = shallow(<PresentationDetails {...defaultProps} presentation={presentationWithComment} />)

    const comment = wrapper.find(Comment)

    expect(comment.length).toBe(1)
  })

  it('should return button for review when document status is pending', () => {
    const wrapper = shallow(<PresentationDetails {...defaultProps} />)
    const instance = wrapper.instance() as PresentationDetails

    const button = instance.renderDocumentReview(defaultProps.documents[0])

    expect(renderer.create(button).toJSON()).toMatchSnapshot()
  })

  it('should return label with accepted text for review when document status is accepted', () => {
    const wrapper = shallow(
      <PresentationDetails
        {...defaultProps}
        documentsReview={[{ ...mockReceivedDocuments.documents[0], status: 'accepted' }]}
      />
    )
    const instance = wrapper.instance() as PresentationDetails

    const accepted = instance.renderDocumentReview(defaultProps.documents[0])

    expect(renderer.create(accepted).toJSON()).toMatchSnapshot()
  })

  it('should return label with accepted text for review when document status is accepted', () => {
    const wrapper = shallow(
      <PresentationDetails
        {...defaultProps}
        documentsReview={[{ ...mockReceivedDocuments.documents[0], status: 'rejected' }]}
      />
    )
    const instance = wrapper.instance() as PresentationDetails

    const rejected = instance.renderDocumentReview(defaultProps.documents[0])

    expect(renderer.create(rejected).toJSON()).toMatchSnapshot()
  })
})
