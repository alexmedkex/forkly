import * as React from 'react'
import renderer from 'react-test-renderer'
import RFPRequestSummary, { IRFPSummaryProps } from './RFPSummary'
import { shallow } from 'enzyme'
import QuoteTerm from './QuoteTerm'
import ViewCommentModal from './ViewCommentModal'

import { MemoryRouter as Router } from 'react-router-dom'
import { ParticipantRFPStatus } from '@komgo/types'

describe('<RFPSummary />', () => {
  let defaultProps: IRFPSummaryProps
  beforeEach(() => {
    defaultProps = {
      id: '1',
      status: ParticipantRFPStatus.QuoteSubmitted,
      company: 'Mercuria',
      comment: 'example comment',
      date: '2014/03/04',
      canAcceptOrDecline: true,
      showTerms: true,
      quoteTerms: [
        [
          { header: 'test header', values: ['row 1', 'row 2'] },
          { header: 'test header 2', values: ['row 1 col 2', 'row 2 col 2'] }
        ]
      ],
      rdId: 'An-RdId',
      selectBankViewQuote: jest.fn()
    }
  })

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <Router>
          <RFPRequestSummary {...defaultProps} />
        </Router>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should show terms if showTerms is true', () => {
    const props = { ...defaultProps, showTerms: true }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const terms = wrapper.find('[data-test-id="quote-terms"]')

    expect(terms.exists()).toBeTruthy()
  })

  it('should not show terms if showTerms is false', () => {
    const props = { ...defaultProps, showTerms: false }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const terms = wrapper.find('[data-test-id="quote-terms"]')

    expect(terms.exists()).toBeFalsy()
  })

  /**
   * Put tests back (previously removed) when the accept and decline buttons are visible.
   * If you can't find the tests, check out to commit hash 5a43ae099c0f305a8f5be52f2af2e940d347e061 or see this MR
   * https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-member-client/merge_requests/1131/diffs
   */
  it.skip('should show accept and decline buttons if canAccetpOrDecline is true', () => {
    const props = { ...defaultProps, canAcceptOrDecline: true }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const accept = wrapper.find('[data-test-id="accept"]')
    const decline = wrapper.find('[data-test-id="decline"]')

    expect(accept.exists()).toBeTruthy()
    expect(decline.exists()).toBeTruthy()
  })

  it.skip('should not show accept and decline buttons if canAccetpOrDecline is false', () => {
    const props = { ...defaultProps, canAcceptOrDecline: false }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const accept = wrapper.find('[data-test-id="accept"]')
    const decline = wrapper.find('[data-test-id="decline"]')

    expect(accept.exists()).toBeFalsy()
    expect(decline.exists()).toBeFalsy()
  })

  it('should show view comment if there is a comment', () => {
    const props = { ...defaultProps, comment: 'example comment' }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const viewComment = wrapper.find('[data-test-id="view-comment"]')

    expect(viewComment.exists()).toBeTruthy()
  })

  it('should not show view comment if there is no comment', () => {
    const props = { ...defaultProps, comment: undefined }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const viewComment = wrapper.find('[data-test-id="view-comment"]')

    expect(viewComment.exists()).toBeFalsy()
  })

  it('should show view comment if there is a comment and there are no quote terms', () => {
    const props = { ...defaultProps, comment: 'test comment', showTerms: false, quoteTerms: [] }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const viewComment = wrapper.find('[data-test-id="view-comment"]')

    expect(viewComment.exists()).toBeTruthy()
  })

  /**
   * Broken test.
   *
   * We need a fixed test here for
   * "should show view comments modal if view comments is clicked"
   * The test can trigger this through the handlePromptClicked prop
   *
   * Works visibly but can't get enzyme to re-render
   */
  it.skip('should show view comments modal if view comments is clicked', () => {
    const props = { ...defaultProps, comment: 'test comment', showTerms: false, quoteTerms: [] }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    const viewComment = wrapper.find(QuoteTerm).first()
    const viewCommentModal = wrapper.find(ViewCommentModal).first()
    viewComment.props().handlePromptClicked()
    wrapper.update()

    expect(viewCommentModal.exists()).toBeTruthy()
    expect(viewCommentModal.props().open).toBeTruthy()
  })

  it('should close modal when close is clicked', () => {
    const props = { ...defaultProps, comment: 'test comment', showTerms: false, quoteTerms: [] }

    const wrapper = shallow(<RFPRequestSummary {...props} />)
    wrapper.instance().setState({ viewCommentModalOpen: true })
    const viewCommentModal = wrapper.find(ViewCommentModal).first()
    viewCommentModal.props().handleClosed()

    expect(viewCommentModal.props().open).toBeFalsy()
  })
})
