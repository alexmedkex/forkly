import { tradeFinanceManager } from '@komgo/permissions'
import {
  buildFakeReceivablesDiscountingInfo,
  Currency,
  InterestType,
  ParticipantRFPStatus,
  PricingType,
  RDStatus,
  ReplyType,
  InvoiceType
} from '@komgo/types'
import { shallow, ShallowWrapper } from 'enzyme'
import { render, fireEvent, wait } from '@testing-library/react'
import React from 'react'
import renderer from 'react-test-renderer'
import { AccordionContent } from 'semantic-ui-react'
import { ErrorMessage, LoadingTransition, Unauthorized } from '../../../../components'
import { MinimalAccordionWrapper } from '../../../../components/accordion/MinimalAccordionWrapper'
import { fakeTradeSeller } from '../../../letter-of-credit-legacy/utils/faker'
import SubmittedQuoteSection from '../../../receivable-discounting-legacy/components/SubmittedQuoteSection'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import { ReceivablesDiscountingRole } from '../../../receivable-discounting-legacy/utils/constants'
import {
  IDiscountingRequestViewContainerProps,
  DiscountingRequestViewContainer
} from './DiscountingRequestViewContainer'
import DiscountingRequestDataContainer from './containers/DiscountingRequestDataContainer'
import AcceptedQuoteDataContainer from './containers/AcceptedQuoteDataContainer'
import { store } from '../../../../store'
import TradeViewDataContainer from './containers/TradeViewDataContainer'

const fakeRdInfo = buildFakeReceivablesDiscountingInfo()
const discountingRequest = {
  ...fakeRdInfo,
  rd: {
    ...fakeRdInfo.rd,
    currency: Currency.USD,
    invoiceType: InvoiceType.Provisional,
    invoiceAmount: 50,
    discountingDate: '2019-04-19 00:00:00.000Z',
    advancedRate: 50,
    titleTransfer: true,
    dateOfPerformance: '2019-04-19 00:00:00.000Z',
    numberOfDaysDiscounting: 20,
    tradeReference: { ...fakeRdInfo.rd.tradeReference, sourceId: 'FaketradeSourceId' }
  },
  status: RDStatus.Requested
}

const mockRFPSummary = {
  participantStaticId: 'string',
  status: ParticipantRFPStatus.QuoteSubmitted,
  replies: [
    {
      type: ReplyType.Submitted,
      createdAt: 'string',
      senderStaticId: 'string',
      comment: 'string',
      quote: {
        staticId: 'string',
        createdAt: 'string',
        pricingType: PricingType.AllIn,
        interestType: InterestType.Libor,
        advanceRate: 2,
        numberOfDaysDiscounting: 1,
        pricingAllIn: 1,
        pricingRiskFee: 2,
        pricingMargin: 1,
        indicativeCof: 1
      }
    }
  ]
}

let testProps: IDiscountingRequestViewContainerProps

describe('DiscountingRequestViewContainer', () => {
  beforeEach(() => {
    testProps = {
      rdId: 'rdId',
      discountingRequest,
      trade: fakeTradeSeller(),
      company: 'company',
      isFinancialInstitution: true,
      role: ReceivablesDiscountingRole.Bank,
      errors: [],
      fetchDiscountingRequestPageData: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      isAuthorized: jest.fn(() => true),
      isLicenseEnabled: jest.fn(() => true),
      isFetching: false,
      editRequestLoader: false,
      members: [],
      bankSingleRFPSummary: mockRFPSummary,
      traderRFPSummaries: [mockRFPSummary]
    } as any
  })

  describe('componentDidMount', () => {
    it('fetches receivable discounting request on mount', () => {
      const propsForThisTest = {
        ...testProps,
        rdId: 'test-rd-id-123123',
        companyStaticId: 'test-company-static-id-123123'
      }

      shallow(<DiscountingRequestViewContainer {...propsForThisTest} />)

      expect(testProps.fetchDiscountingRequestPageData).toHaveBeenCalledTimes(1)
      expect(testProps.fetchDiscountingRequestPageData).toHaveBeenCalledWith(
        propsForThisTest.rdId,
        propsForThisTest.companyStaticId,
        testProps.isFinancialInstitution
      )
    })
  })

  it('renders correctly', () => {
    expect(
      renderer
        .create(
          <Router>
            <Provider store={store}>
              <DiscountingRequestViewContainer {...testProps} />
            </Provider>
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('renders no action buttons if status not `Requested` correctly', () => {
    const testSpecificProps = {
      ...testProps,
      discountingRequest: { ...testProps.discountingRequest, status: RDStatus.PendingRequest }
    }
    expect(
      renderer
        .create(
          <Router>
            <Provider store={store}>
              <DiscountingRequestViewContainer {...testSpecificProps} />
            </Provider>
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('renders no action buttons if is not a Financial Institution', () => {
    const testSpecificProps = {
      ...testProps,
      isFinancialInstitution: false,
      role: ReceivablesDiscountingRole.Trader
    }
    expect(
      renderer
        .create(
          <Router>
            <Provider store={store}>
              <DiscountingRequestViewContainer {...testSpecificProps} />
            </Provider>
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('renders error message correctly if present', () => {
    const propsWithErrors = {
      ...testProps,
      errors: ['rd error message'] as any
    }

    const wrapper = shallow(<DiscountingRequestViewContainer {...propsWithErrors} />)

    expect(wrapper.find(ErrorMessage).exists()).toBeTruthy()
  })

  it('checks if user is authorized', () => {
    const auth = jest.fn(() => false)
    const propsWithErrors = {
      ...testProps,
      isAuthorized: auth
    }
    const wrapper = shallow(<DiscountingRequestViewContainer {...propsWithErrors} />)

    expect(wrapper.find(Unauthorized).exists()).toBeTruthy()
  })

  it('should render component if permissions are authorized', () => {
    const auth = jest.fn(() => true)

    const propsWithErrors = {
      ...testProps,
      isAuthorized: auth
    }
    const wrapper = shallow(<DiscountingRequestViewContainer {...propsWithErrors} />)

    expect(wrapper.find(Unauthorized).exists()).toBeFalsy()
  })

  it('is authorized if user can read RD Requests or can read RD', () => {
    const auth = jest.fn()
    const propsWithErrors = {
      ...testProps,
      isAuthorized: auth
    }
    shallow(<DiscountingRequestViewContainer {...propsWithErrors} />)

    expect(auth).toHaveBeenCalledWith(tradeFinanceManager.canReadRDRequests)
    expect(auth).toHaveBeenCalledWith(tradeFinanceManager.canReadRD)
  })

  it('displays loading transition while fetching', () => {
    const propsWithErrors = {
      ...testProps,
      isFetching: true
    }
    const wrapper = shallow(<DiscountingRequestViewContainer {...propsWithErrors} />)

    expect(wrapper.find(LoadingTransition).exists()).toBeTruthy()
  })

  describe('Accordions on Discounting Request View', () => {
    let props: IDiscountingRequestViewContainerProps
    let wrapper: ShallowWrapper<DiscountingRequestViewContainer>

    describe('For Bank', () => {
      describe('RD status is Requested', () => {
        beforeEach(() => {
          props = {
            ...testProps,
            isFinancialInstitution: true,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.Requested
            },
            bankSingleRFPSummary: {
              ...testProps.bankSingleRFPSummary,
              status: ParticipantRFPStatus.QuoteSubmitted
            },
            isLicenseEnabled: jest.fn(() => true)
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should not show submitted quote', () => {
          expect(wrapper.find(SubmittedQuoteSection).exists()).toBeFalsy()
        })
      })

      describe('RD status is QuoteSubmitted', () => {
        beforeEach(() => {
          props = {
            ...testProps,
            isFinancialInstitution: true,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.QuoteSubmitted
            },
            bankSingleRFPSummary: {
              ...testProps.bankSingleRFPSummary,
              status: ParticipantRFPStatus.QuoteSubmitted
            }
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should show submitted quote', () => {
          expectShowsSubmittedQuote(wrapper)
        })
      })

      describe('RD status is QuoteDeclined', () => {
        beforeEach(() => {
          const mockRFPSummary = {
            participantStaticId: 'string',
            status: ParticipantRFPStatus.QuoteDeclined,
            replies: [mockReply(ReplyType.Declined), mockReply(ReplyType.Submitted)]
          }

          props = {
            ...testProps,
            isFinancialInstitution: true,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.QuoteDeclined
            },
            bankSingleRFPSummary: mockRFPSummary
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should show submitted quote', () => {
          expectShowsSubmittedQuote(wrapper)
        })

        it('should show declined quote comment', () => {
          const declinedQuoteCommentText = wrapper.find({ 'data-test-id': 'declined-quote-comment' })
          expect(declinedQuoteCommentText.text()).toBe(props.bankSingleRFPSummary.replies[0].comment)
        })
      })

      describe('RD status is QuoteAccepted', () => {
        beforeEach(() => {
          const mockRFPSummary = {
            participantStaticId: 'string',
            status: ParticipantRFPStatus.QuoteAccepted,
            replies: [mockReply(ReplyType.Submitted), mockReply(ReplyType.Accepted)]
          }

          props = {
            ...testProps,
            isFinancialInstitution: true,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.QuoteAccepted
            },
            bankSingleRFPSummary: mockRFPSummary
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should show submitted quote', () => {
          expectShowsSubmittedQuote(wrapper)
        })

        it('should show accepted quote', () => {
          expectShowsAcceptedQuote(wrapper)
        })
      })
    })

    describe('For Trader', () => {
      describe('RD status is Requested', () => {
        beforeEach(() => {
          props = {
            ...testProps,
            isFinancialInstitution: false,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.Requested
            }
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should not show submitted quote', () => {
          expect(wrapper.find(SubmittedQuoteSection).exists()).toBeFalsy()
        })
      })

      describe('RD status is QuoteSubmitted', () => {
        beforeEach(() => {
          props = {
            ...testProps,
            isFinancialInstitution: false,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.QuoteSubmitted
            },
            traderRFPSummaries: [
              {
                ...testProps.bankSingleRFPSummary,
                status: ParticipantRFPStatus.QuoteSubmitted
              }
            ]
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should not show submitted quote', () => {
          expect(wrapper.find(SubmittedQuoteSection).exists()).toBeFalsy()
        })
      })

      describe('RD status is QuoteDeclined', () => {
        beforeEach(() => {
          const mockRFPSummary = {
            participantStaticId: 'string',
            status: ParticipantRFPStatus.QuoteDeclined,
            replies: [mockReply(ReplyType.Declined), mockReply(ReplyType.Submitted)]
          }

          props = {
            ...testProps,
            isFinancialInstitution: false,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.QuoteDeclined
            },
            traderRFPSummaries: [mockRFPSummary]
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should not show submitted quote', () => {
          expect(wrapper.find(SubmittedQuoteSection).exists()).toBeFalsy()
        })

        it('should not show declined quote comment', () => {
          expect(wrapper.find({ 'data-test-id': 'declined-quote-comment' }).exists()).toBeFalsy()
        })
      })

      describe('RD status is QuoteAccepted', () => {
        beforeEach(() => {
          const mockRFPSummary = {
            participantStaticId: 'string',
            status: ParticipantRFPStatus.QuoteAccepted,
            replies: [mockReply(ReplyType.Submitted), mockReply(ReplyType.Accepted)]
          }

          props = {
            ...testProps,
            isFinancialInstitution: false,
            discountingRequest: {
              ...testProps.discountingRequest,
              status: RDStatus.QuoteAccepted
            },
            traderRFPSummaries: [mockRFPSummary]
          }

          wrapper = shallow(<DiscountingRequestViewContainer {...props} />)
        })

        it('should show Trade Summary', () => {
          expectShowsTradeSummary(wrapper)
        })

        it('should show RD data', () => {
          expectShowsRdData(wrapper)
        })

        it('should not show submitted quote', () => {
          expect(wrapper.find(SubmittedQuoteSection).exists()).toBeFalsy()
        })

        it('should show accepted quote', () => {
          expectShowsAcceptedQuote(wrapper)
        })
      })
    })
  })

  describe('Submit quote', () => {
    beforeEach(() => {
      testProps.isFinancialInstitution = true
      testProps.discountingRequest.status = RDStatus.Requested
      testProps.history = { push: jest.fn() } as any
    })
    it('should be able to Submit quote if bank and status is requested', () => {
      const { queryByTestId } = render(
        <Router>
          <Provider store={store}>
            <DiscountingRequestViewContainer {...testProps} />
          </Provider>
        </Router>
      )

      const provideButton = queryByTestId('button-provide-quote')

      expect(provideButton).toBeDefined()
      expect(provideButton).not.toBeDisabled()
    })
    it('should be able to Submit quote if bank and status is requested', () => {
      const { queryByTestId } = render(
        <Router>
          <Provider store={store}>
            <DiscountingRequestViewContainer {...testProps} />
          </Provider>
        </Router>
      )

      const provideButton = queryByTestId('button-provide-quote')

      expect(provideButton).toBeInstanceOf(HTMLElement)
      expect(provideButton).not.toBeDisabled()
    })

    it('should navigate to the Submit quote page when clicked', done => {
      const { queryByTestId } = render(
        <Router>
          <Provider store={store}>
            <DiscountingRequestViewContainer {...testProps} />
          </Provider>
        </Router>
      )

      const provideButton = queryByTestId('button-provide-quote')
      fireEvent.click(provideButton)

      wait(() => {
        expect(testProps.history.push).toHaveBeenCalledWith(`/receivable-discounting/${testProps.rdId}/provide-quote`)
        done()
      })
    })
  })

  function expectShowsTradeSummary(wrapper) {
    expect(wrapper.find(TradeViewDataContainer).exists()).toBeTruthy()
  }

  function expectShowsRdData(wrapper: ShallowWrapper) {
    expect(wrapper.find(DiscountingRequestDataContainer).exists()).toBeTruthy()
  }

  function expectShowsSubmittedQuote(wrapper: ShallowWrapper) {
    const accordion = wrapper
      .find(SubmittedQuoteSection)
      .dive()
      .find(MinimalAccordionWrapper)

    const title = accordion.dive().find({ 'data-test-id': 'submitted-quote-accordion-title' })
    const content = accordion.dive().find(AccordionContent)

    expect(title.exists()).toBeTruthy()
    expect(content.props().active).toBe(false)
  }

  function expectShowsAcceptedQuote(wrapper: ShallowWrapper) {
    expect(wrapper.find(AcceptedQuoteDataContainer).exists()).toBeTruthy()
  }
})

const mockReply = (type: ReplyType) => ({
  type,
  createdAt: 'string',
  senderStaticId: 'string',
  comment: 'This is a test comment',
  quote: {
    staticId: 'string',
    createdAt: 'string',
    pricingType: PricingType.AllIn,
    interestType: InterestType.Libor,
    advanceRate: 2,
    numberOfDaysDiscounting: 1,
    pricingAllIn: 1,
    pricingRiskFee: 1,
    pricingMargin: 1,
    indicativeCof: 1
  }
})
