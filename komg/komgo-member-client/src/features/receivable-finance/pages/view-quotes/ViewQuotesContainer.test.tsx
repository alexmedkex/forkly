import { tradeFinanceManager } from '@komgo/permissions'
import {
  buildFakeQuote,
  buildFakeReceivablesDiscountingExtended,
  ParticipantRFPStatus,
  RequestType,
  DiscountingType
} from '@komgo/types'
import { shallow } from 'enzyme'
import moment from 'moment-timezone'
import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import renderer from 'react-test-renderer'
import { sentenceCase } from '../../../../utils/casings'
import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import FilterRequestsDropdown from '../../../receivable-discounting-legacy/components/quotes/FilterRequestsDropdown'
import RFPSummaryList from '../../../receivable-discounting-legacy/components/quotes/RFPSummaryList'
import { ViewQuotesContainer } from './ViewQuotesContainer'

const participantStaticId = 'test-static-id'

describe('ViewQuotesContainer', () => {
  const mockQuote = buildFakeQuote({}, false, RequestType.Discount, DiscountingType.WithoutRecourse)
  let defaultProps

  beforeEach(() => {
    Date.now = jest.fn(() => 1487076708000)
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    defaultProps = {
      errors: [],
      isFetching: false,
      isAuthorized: jest.fn(() => true),
      fetchDiscountRequestRFPSummaries: jest.fn(),
      rfpSummaries: [
        {
          status: ParticipantRFPStatus.Requested,
          participantStaticId,
          replies: [{ quote: mockQuote, createdAt: Date.now() } as any]
        },
        {
          status: ParticipantRFPStatus.QuoteAccepted,
          participantStaticId,
          replies: [{ quote: mockQuote, createdAt: Date.now() * 2 } as any]
        }
      ],
      members: [fakeMember({ staticId: participantStaticId }), fakeMember()],
      rdInfo: {
        rd: buildFakeReceivablesDiscountingExtended(),
        rfp: {
          acceptedParticipantStaticIds: [participantStaticId],
          createdAt: new Date(0)
        }
      }
    }
  })

  afterEach(() => {
    moment.tz.setDefault()
  })

  it('renders correctly', () => {
    expect(
      renderer
        .create(
          <Router>
            <ViewQuotesContainer {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should render unauthorized when user do not have permission', () => {
    const isAuthorized = jest.fn(permission => {
      if (permission === tradeFinanceManager.canReadRD) {
        return false
      }
      return true
    })
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} isAuthorized={isAuthorized} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should find ErrorMessage when error exists', () => {
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} errors={[{ message: 'test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(1)
  })

  it('should find LoadingTransition when error exists', () => {
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} isFetching={true} />)

    const fetching = wrapper.find('LoadingTransition')

    expect(fetching.length).toBe(1)
  })

  it('should format and count dropdown options text', () => {
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} />)
    wrapper.instance().componentWillReceiveProps!(defaultProps, null)

    const dropdown = wrapper.find(FilterRequestsDropdown)

    expect(dropdown.props().options).toEqual(
      expect.arrayContaining([
        {
          value: ParticipantRFPStatus.Requested,
          content: 'Requested (1)',
          text: 'Requested (1)'
        }
      ])
    )
  })

  it('should format and count dropdown options text if there are no rfp summaries', () => {
    defaultProps.rfpSummaries = []
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} />)
    wrapper.instance().componentWillReceiveProps!(defaultProps, null)

    const dropdown = wrapper.find(FilterRequestsDropdown)

    expect(dropdown.props().options).toEqual(
      expect.arrayContaining([
        {
          value: ParticipantRFPStatus.Requested,
          content: 'Requested (0)',
          text: 'Requested (0)'
        }
      ])
    )
  })

  it('should show all statuses by default', () => {
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} />)

    const summaryList = wrapper.find(RFPSummaryList)

    expect(summaryList.props().summaries).toHaveLength(2)
  })

  it('should be able to filter the requests / quotes by status', () => {
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} />)

    const dropdown = wrapper.find(FilterRequestsDropdown)
    dropdown.props().onChange({ value: ParticipantRFPStatus.Requested })

    const summaryList = wrapper.find(RFPSummaryList)
    expect(summaryList.props().summaries).toHaveLength(1)
    expect(summaryList.props().summaries[0].status).toEqual(ParticipantRFPStatus.Requested)
  })

  it('should sort the requests / quotes by createdAt except the ones with no replies that goes at the bottom', () => {
    defaultProps.rfpSummaries = [
      { status: ParticipantRFPStatus.Requested, replies: [] } as any,
      { status: ParticipantRFPStatus.QuoteSubmitted, replies: [{ createdAt: '2019-01-05' }] } as any,
      { status: ParticipantRFPStatus.QuoteAccepted, replies: [{ createdAt: '2019-01-10' }] } as any
    ]
    const wrapper = shallow(<ViewQuotesContainer {...defaultProps} />)

    const summaryList = wrapper.find(RFPSummaryList)

    expect(sentenceCase(summaryList.props().summaries[0].status)).toEqual('Quote accepted')
    expect(sentenceCase(summaryList.props().summaries[1].status)).toEqual('Quote submitted')
    expect(sentenceCase(summaryList.props().summaries[2].status)).toEqual('Requested')
  })
})
