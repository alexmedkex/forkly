import { buildFakeQuote, buildFakeReceivablesDiscountingInfo, ParticipantRFPStatus } from '@komgo/types'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import renderer from 'react-test-renderer'
import { fakeTradeSeller } from '../../../letter-of-credit-legacy/utils/faker'
import { AcceptQuoteContainer } from './AcceptQuoteContainer'

describe('AcceptQuoteContainer', () => {
  const discountingRequest = buildFakeReceivablesDiscountingInfo()
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      rdId: 'AN-RDID',
      errors: [],
      rdError: null,
      quoteStaticId: 'A-QUOTE-STATIC-ID',
      participantStaticId: 'A-PARTICIPANT-STATIC-ID',
      quote: buildFakeQuote({}, false, discountingRequest.rd.requestType, discountingRequest.rd.discountingType),
      bankName: 'A-BANK-NAME',
      discountingRequest,
      trade: fakeTradeSeller(),
      history: createMemoryHistory(),
      status: ParticipantRFPStatus.QuoteSubmitted,
      traderSubmitQuoteLoader: false,
      isFetching: false,
      fetchDiscountingRequestForAcceptQuote: jest.fn(),
      fetchDiscountingRequest: jest.fn(),
      traderCreateQuote: jest.fn(),
      isAuthorized: jest.fn(() => true),
      isLicenseEnabled: jest.fn(() => true),
      isLicenseEnabledForCompany: jest.fn(() => true)
    }
  })

  it('renders correctly', () => {
    expect(
      renderer
        .create(
          <Router>
            <AcceptQuoteContainer {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should render unauthorized when user do not have permission', () => {
    const testProps = { ...defaultProps, isAuthorized: jest.fn(() => false) }

    const wrapper = shallow(<AcceptQuoteContainer {...testProps} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should find ErrorMessage when quote status is set to QUOTE_ACCEPTED', () => {
    const wrapper = shallow(
      <AcceptQuoteContainer {...defaultProps} status={ParticipantRFPStatus.QuoteAccepted} isFetching={false} />
    )

    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(1)
  })

  it('should find LoadingTransition when error exists', () => {
    const wrapper = shallow(<AcceptQuoteContainer {...defaultProps} isFetching={true} />)

    const fetching = wrapper.find('LoadingTransition')

    expect(fetching.length).toBe(1)
  })
})
