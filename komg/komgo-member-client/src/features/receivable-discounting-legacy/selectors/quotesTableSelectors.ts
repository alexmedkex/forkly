import {
  IParticipantRFPSummary,
  IQuote,
  ParticipantRFPStatus,
  PricingType,
  QUOTE_SCHEMA,
  IReceivablesDiscounting,
  RequestType,
  DiscountingType
} from '@komgo/types'
import { displayDate } from '../../../utils/date'
import { IMember } from '../../members/store/types'
import {
  displayPercentage,
  displayQuantity,
  findCommonNameByStaticId,
  formatPrice
} from '../../trades/utils/displaySelectors'
import { IFilterReceivablesDiscountingRequestOption } from '../components/quotes/FilterRequestsDropdown'
import { IRFPSummaryProps, IQuoteTerm } from '../components/quotes/RFPSummary'
import { findFieldFromSchema } from '../../../store/common/selectors/displaySelectors'
import { displayMaturity, displayQuoteInterestType } from '../utils/displaySelectors'
import { enumValueToString } from '../resources/enumValueToString'
import { Strings } from '../resources/strings'

const findTitle = (field: keyof IQuote, findField = findFieldFromSchema) => findField('title', field, QUOTE_SCHEMA)

const ALL_STATUSES = 'ALL'
const defaultQuoteFilterOptions: IFilterReceivablesDiscountingRequestOption[] = [
  {
    text: 'All quotes',
    content: 'All quotes',
    value: ALL_STATUSES
  }
]

const getLatestReply = (summary: IParticipantRFPSummary) =>
  summary.replies.length === 0
    ? undefined
    : summary.replies.reduce(
        (reply1, reply2) => (new Date(reply1.createdAt) > new Date(reply2.createdAt) ? reply1 : reply2)
      )

const mapAndFilterToDropdown = (
  options: IFilterReceivablesDiscountingRequestOption[]
): IFilterReceivablesDiscountingRequestOption[] => [
  ...defaultQuoteFilterOptions,
  ...options.map(opt => ({
    ...opt,
    content: opt.content,
    text: opt.text
  }))
]

const pricingFields = (quote: IQuote) => {
  if (quote.pricingType === PricingType.AllIn) {
    return [
      {
        header: enumValueToString[PricingType.AllIn],
        values: [displayPercentage(quote.pricingAllIn)]
      }
    ]
    // The above should use the findFieldFromSchema, but schema title is currently 'All in'
  }
  if (quote.pricingType === PricingType.Split) {
    return [
      {
        header: findTitle('pricingRiskFee'),
        values: [displayPercentage(quote.pricingRiskFee)]
      },
      {
        header: findTitle('pricingMargin'),
        values: [displayPercentage(quote.pricingMargin)]
      }
    ]
  }
  if (quote.pricingType === PricingType.FlatFee) {
    return [
      {
        header: findTitle('pricingFlatFeeAmount'),
        values: [`${quote.pricingFlatFeeAmount.currency} ${formatPrice(quote.pricingFlatFeeAmount.amount)}`]
      }
    ]
  }
  if (quote.pricingType === PricingType.RiskFee) {
    return [
      {
        header: findTitle('pricingRiskFee'),
        values: [displayPercentage(quote.pricingRiskFee)]
      }
    ]
  }
  if (quote.pricingType === PricingType.Margin) {
    return [
      {
        header: findTitle('pricingMargin'),
        values: [displayPercentage(quote.pricingMargin)]
      }
    ]
  }
  return []
}

const interestFields = (quote: IQuote) => {
  const fields: IQuoteTerm[] = [
    {
      header: findTitle('interestType'),
      values: [displayQuoteInterestType(quote)]
    }
  ]
  if (quote.indicativeCof) {
    fields.push({
      header: Strings.IndicativeCostOfFundsMediumTitle,
      values: [displayPercentage(quote.indicativeCof)]
    })
    // The above should use findFieldFromSchema, but schema title is currently 'indicative cost of funds'
  }
  if (quote.addOnValue) {
    fields.push({
      header: findTitle('addOnValue'),
      values: [displayPercentage(quote.addOnValue)]
    })
  }
  if (quote.daysUntilMaturity) {
    fields.push({
      header: findTitle('daysUntilMaturity'),
      values: [displayMaturity(quote.daysUntilMaturity)]
    })
  }
  return fields
}

const optional = (selector: (..._: any[]) => string, ...args: any[]) =>
  args.length !== 0 && args[0] ? selector(...args) : '-'

const riskCoverDiscountingFields = (quote: IQuote, requestType: RequestType, discountingType: DiscountingType) => {
  if (requestType === RequestType.RiskCoverDiscounting) {
    return [
      {
        header: findTitle('numberOfDaysRiskCover'),
        values: [displayQuantity(quote.numberOfDaysRiskCover, 'days')]
      },
      {
        header: findTitle('numberOfDaysDiscounting'),
        values: [optional(displayQuantity, quote.numberOfDaysDiscounting, 'days')]
      }
    ]
  }
  if (requestType === RequestType.RiskCover) {
    return [
      {
        header: findTitle('numberOfDaysRiskCover'),
        values: [displayQuantity(quote.numberOfDaysRiskCover, 'days')]
      }
    ]
  }
  if (requestType === RequestType.Discount) {
    let terms: IQuoteTerm[]
    if (discountingType === DiscountingType.Blended) {
      terms = [
        {
          header: findTitle('numberOfDaysRiskCover'),
          values: [optional(displayQuantity, quote.numberOfDaysRiskCover, 'days')]
        },
        {
          header: findTitle('numberOfDaysDiscounting'),
          values: [displayQuantity(quote.numberOfDaysDiscounting, 'days')]
        }
      ]
    } else {
      terms = [
        {
          header: findTitle('numberOfDaysDiscounting'),
          values: [optional(displayQuantity, quote.numberOfDaysDiscounting, 'days')]
        }
      ]
    }

    return terms
  }

  return []
}

const transformToRFPRequestSummaryProps = (
  summaries: IParticipantRFPSummary[],
  members: IMember[],
  rd: IReceivablesDiscounting,
  selectBankViewQuote: (id: string, rdId: string) => void
): IRFPSummaryProps[] =>
  summaries.map(summary => {
    const latestReply = getLatestReply(summary)
    let quoteTerms: IQuoteTerm[][] = []

    if (latestReply && latestReply.quote) {
      const topRow: IQuoteTerm[] = [
        {
          header: findTitle('advanceRate'),
          values: [displayPercentage(latestReply.quote.advanceRate)]
        },
        ...riskCoverDiscountingFields(latestReply.quote, rd.requestType, rd.discountingType),
        ...pricingFields(latestReply.quote)
      ]
      let bottomRow: IQuoteTerm[] = []
      if (rd.requestType !== RequestType.RiskCover) {
        topRow.push({
          header: findTitle('feeCalculationType'),
          values: [enumValueToString[latestReply.quote.feeCalculationType]]
        })
        bottomRow = [...interestFields(latestReply.quote)]
      }

      quoteTerms = [topRow, bottomRow]
    }

    return {
      id: summary.participantStaticId,
      rdId: rd.staticId,
      quoteTerms,
      company: findCommonNameByStaticId(members, summary.participantStaticId),
      status: summary.status,

      comment: latestReply && latestReply.comment,
      date: latestReply && displayDate(latestReply.createdAt),
      canAcceptOrDecline: summary.status === ParticipantRFPStatus.QuoteSubmitted,
      showTerms: [
        ParticipantRFPStatus.QuoteAccepted,
        ParticipantRFPStatus.QuoteDeclined,
        ParticipantRFPStatus.QuoteSubmitted
      ].includes(summary.status),
      selectBankViewQuote
    }
  })

export { transformToRFPRequestSummaryProps, mapAndFilterToDropdown, getLatestReply, ALL_STATUSES }
