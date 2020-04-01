import {
  buildFakeQuote,
  InterestType,
  IParticipantRFPSummary,
  ParticipantRFPStatus,
  PricingType,
  Currency,
  LiborType,
  FeeCalculationType,
  RequestType,
  IReceivablesDiscountingInfo,
  DiscountingType
} from '@komgo/types'
import { sentenceCase } from '../../../utils/casings'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { IMember } from '../../members/store/types'
import { IFilterReceivablesDiscountingRequestOption } from '../components/quotes/FilterRequestsDropdown'
import { fakeRFPReply, fakeRdInfo } from '../utils/faker'
import {
  ALL_STATUSES,
  getLatestReply,
  mapAndFilterToDropdown,
  transformToRFPRequestSummaryProps
} from './quotesTableSelectors'

const testFilterOptions: IFilterReceivablesDiscountingRequestOption[] = [
  {
    text: 'Quote submitted',
    content: 'Quote submitted',
    value: ParticipantRFPStatus.QuoteSubmitted
  },
  {
    text: 'Requested',
    content: 'Requested',
    value: ParticipantRFPStatus.Requested
  }
]

describe('mapAndFilterToDropdown', () => {
  it('adds a default dropdown option', () => {
    const options = mapAndFilterToDropdown(testFilterOptions)

    expect(options.length).toEqual(3)
    expect(options[0].value).toEqual(ALL_STATUSES)
  })
  it('swaps Requested for Awaiting response', () => {
    const options = mapAndFilterToDropdown(testFilterOptions)

    expect(options[2]).toEqual({
      text: 'Requested',
      content: 'Requested',
      value: ParticipantRFPStatus.Requested
    })
  })
})

describe('transformToRFPRequestSummaryProps', () => {
  let testRFPRequestSummary: IParticipantRFPSummary
  let mockMembers: IMember[]
  let mockRdInfo: IReceivablesDiscountingInfo

  beforeEach(() => {
    mockMembers = [fakeMember({ staticId: 'x' })]
    mockRdInfo = fakeRdInfo({
      rd: { staticId: 'An-RdId', requestType: RequestType.Discount }
    })
    testRFPRequestSummary = {
      status: ParticipantRFPStatus.QuoteSubmitted,
      participantStaticId: 'x',
      replies: [fakeRFPReply({ createdAt: '2019-10-10' })]
    }
  })

  it('finds the company by static ID', () => {
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].company).toEqual(mockMembers[0].x500Name.CN)
  })

  it('sets a readable status to a predefined status message if there is one', () => {
    testRFPRequestSummary.status = ParticipantRFPStatus.Requested

    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(sentenceCase(transformed[0].status)).toEqual('Requested')
  })

  it('adds time to readable status if there has been a response to the request', () => {
    testRFPRequestSummary.status = ParticipantRFPStatus.Rejected

    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(sentenceCase(transformed[0].status)).toEqual('Request declined')
  })

  it('sets can accept or decline to true for QuoteSubmitted', () => {
    testRFPRequestSummary.status = ParticipantRFPStatus.QuoteSubmitted

    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].canAcceptOrDecline).toBeTruthy()
  })

  it('sets can accept or decline to false for all except QuoteSubmitted', () => {
    const statuses = [
      ParticipantRFPStatus.QuoteAccepted,
      ParticipantRFPStatus.QuoteDeclined,
      ParticipantRFPStatus.Rejected,
      ParticipantRFPStatus.Requested
    ]

    const testPropsWithStatuses = statuses.map(status => ({
      ...testRFPRequestSummary,
      status
    }))
    const transformed = transformToRFPRequestSummaryProps(
      testPropsWithStatuses,
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    ).map(({ canAcceptOrDecline }) => canAcceptOrDecline)

    expect(transformed).toEqual([false, false, false, false])
  })

  it('sets showTerms to true if any quote was ever submitted', () => {
    const statuses = [
      ParticipantRFPStatus.QuoteAccepted,
      ParticipantRFPStatus.QuoteSubmitted,
      ParticipantRFPStatus.QuoteDeclined
    ]
    const testPropsWithStatuses = statuses.map(status => ({
      ...testRFPRequestSummary,
      status
    }))

    const transformed = transformToRFPRequestSummaryProps(
      testPropsWithStatuses,
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    ).map(({ showTerms: showTerms }) => showTerms)

    expect(transformed).toEqual([true, true, true])
  })

  it('sets showTerms to false if no quote was ever submitted', () => {
    const statuses = [ParticipantRFPStatus.Requested, ParticipantRFPStatus.Rejected]
    const testPropsWithStatuses = statuses.map(status => ({
      ...testRFPRequestSummary,
      status
    }))

    const transformed = transformToRFPRequestSummaryProps(
      testPropsWithStatuses,
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    ).map(({ showTerms: showTerms }) => showTerms)

    expect(transformed).toEqual([false, false])
  })

  it('sets no quote terms if there is no reply', () => {
    testRFPRequestSummary.replies = []

    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms).toEqual([])
  })

  it('sets no quote terms if there is no quote on a reply', () => {
    testRFPRequestSummary.replies = [{ ...fakeRFPReply(), quote: undefined }]

    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms).toEqual([])
  })

  it('should create quote terms with all in pricing', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          pricingType: PricingType.AllIn,
          pricingAllIn: 75
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([{ header: 'All in pricing', values: ['75.00%'] }])
    )
  })

  it('should create quote terms with split pricing', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          pricingType: PricingType.Split,
          pricingRiskFee: 40,
          pricingMargin: 25
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([{ header: 'Risk fee', values: ['40.00%'] }, { header: 'Margin', values: ['25.00%'] }])
    )
  })

  it('should create quote terms with flat fee pricing', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          pricingType: PricingType.FlatFee,
          pricingFlatFeeAmount: { amount: 20000, currency: Currency.CHF }
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([{ header: 'Flat fee', values: ['CHF 20,000.00'] }])
    )
  })

  it('should create quote terms with risk fee pricing', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          pricingType: PricingType.RiskFee,
          pricingRiskFee: 20
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(expect.arrayContaining([{ header: 'Risk fee', values: ['20.00%'] }]))
  })

  it('should create quote terms with margin pricing', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          pricingType: PricingType.Margin,
          pricingMargin: 20
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(expect.arrayContaining([{ header: 'Margin', values: ['20.00%'] }]))
  })

  it('should create quote terms with indicative COF', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          interestType: InterestType.CostOfFunds,
          indicativeCof: 15
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[1]).toEqual(
      expect.arrayContaining([
        { header: 'Interest type', values: ['COF'] },
        { header: 'Indicative COF', values: ['15.00%'] }
      ])
    )
  })

  it('should not show interest fields if Risk Cover only', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          interestType: InterestType.CostOfFunds
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      { ...mockRdInfo.rd, requestType: RequestType.RiskCover },
      jest.fn()
    )

    expect(transformed[0].quoteTerms[1]).not.toEqual(
      expect.arrayContaining([{ header: 'Interest type', values: ['COF'] }])
    )
  })

  it('should hide indicative COF value if indicative COF is empty', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          interestType: InterestType.CostOfFunds,
          indicativeCof: undefined
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[1]).toEqual(expect.arrayContaining([{ header: 'Interest type', values: ['COF'] }]))
  })

  it('should create quote terms with libor + add on', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          interestType: InterestType.AddOnLibor,
          addOnValue: 15
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[1]).toEqual(
      expect.arrayContaining([
        { header: 'Interest type', values: ['Add on over Libor'] },
        { header: 'Add on value', values: ['15.00%'] }
      ])
    )
  })

  it('should create quote terms with published libor with maturity', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          interestType: InterestType.Libor,
          liborType: LiborType.Published,
          daysUntilMaturity: 98
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[1]).toEqual(
      expect.arrayContaining([
        { header: 'Interest type', values: ['Libor - Published'] },
        { header: 'Maturity', values: ['3 months'] }
      ])
    )
  })

  it('should create quote terms with interpolated libor', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          interestType: InterestType.Libor,
          liborType: LiborType.Interpolated
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[1]).toEqual(
      expect.arrayContaining([{ header: 'Interest type', values: ['Libor - Interpolated'] }])
    )
  })

  it('should create quote terms with fee calculation based on', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          feeCalculationType: FeeCalculationType.Other,
          otherFeeCalculationAmount: { amount: 30000, currency: Currency.CHF }
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([{ header: 'Fee calculation based on', values: ['Other formula'] }])
    )
  })

  it('should not show fee calculation based on if risk cover only', () => {
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          feeCalculationType: FeeCalculationType.Other,
          otherFeeCalculationAmount: { amount: 30000, currency: Currency.CHF }
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      { ...mockRdInfo.rd, requestType: RequestType.RiskCover },
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).not.toEqual(
      expect.arrayContaining([{ header: 'Fee calculation based on', values: ['Other formula'] }])
    )
  })

  it('should return days of risk cover if type is risk cover only', () => {
    mockRdInfo.rd.requestType = RequestType.RiskCover
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          numberOfDaysRiskCover: 14
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([{ header: 'Days of risk cover', values: ['14 days'] }])
    )
  })

  it('should return days of discounting if type is discounting', () => {
    mockRdInfo.rd.requestType = RequestType.Discount
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          numberOfDaysDiscounting: 20
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([{ header: 'Days of discounting', values: ['20 days'] }])
    )
  })

  it('should return both risk cover and discounting if risk cover with discounting', () => {
    mockRdInfo.rd.requestType = RequestType.RiskCoverDiscounting
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          numberOfDaysRiskCover: 27,
          numberOfDaysDiscounting: 20
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([
        { header: 'Days of risk cover', values: ['27 days'] },
        { header: 'Days of discounting', values: ['20 days'] }
      ])
    )
  })

  it('should return blank for number of days discounting if risk cover with discounting', () => {
    mockRdInfo.rd.requestType = RequestType.RiskCoverDiscounting
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          numberOfDaysRiskCover: 27,
          numberOfDaysDiscounting: undefined
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([
        { header: 'Days of risk cover', values: ['27 days'] },
        { header: 'Days of discounting', values: ['-'] }
      ])
    )
  })

  it('should return blank for number of days risk cover if discounting blended', () => {
    mockRdInfo.rd.requestType = RequestType.Discount
    mockRdInfo.rd.discountingType = DiscountingType.Blended
    testRFPRequestSummary.replies = [
      {
        ...fakeRFPReply(),
        quote: buildFakeQuote({
          numberOfDaysRiskCover: undefined,
          numberOfDaysDiscounting: 27
        })
      }
    ]
    const transformed = transformToRFPRequestSummaryProps(
      [testRFPRequestSummary],
      mockMembers,
      mockRdInfo.rd,
      jest.fn()
    )

    expect(transformed[0].quoteTerms[0]).toEqual(
      expect.arrayContaining([
        { header: 'Days of discounting', values: ['27 days'] },
        { header: 'Days of risk cover', values: ['-'] }
      ])
    )
  })

  describe('getLatestReply', () => {
    it('should return the latest reply', () => {
      testRFPRequestSummary.replies = [
        fakeRFPReply({ createdAt: '2019-10-10' }),
        fakeRFPReply({ createdAt: '2019-10-12' }),
        fakeRFPReply({ createdAt: '2019-10-11' })
      ]

      const latest = getLatestReply(testRFPRequestSummary)

      expect(latest.createdAt).toEqual('2019-10-12')
    })

    it('should return undefined if there is no reply', () => {
      testRFPRequestSummary.replies = []

      const latest = getLatestReply(testRFPRequestSummary)

      expect(latest).not.toBeDefined()
    })
  })
})
