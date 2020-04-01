import { supportingInstrumentToSentenceList, displayRequestType, displaySimpleRequestType } from './displaySelectors'
import { SupportingInstrument, RequestType, DiscountingType } from '@komgo/types'
import { Strings } from '../resources/strings'

describe('supportingInstrumentToSentenceList', () => {
  it('should output correctly if list has more than 1 item', () => {
    const supportingInsrtumentList: SupportingInstrument[] = [
      SupportingInstrument.FinancialInstrument,
      SupportingInstrument.CreditInsurance,
      SupportingInstrument.PaymentUndertaking,
      SupportingInstrument.PromissoryNote
    ]

    expect(supportingInstrumentToSentenceList(supportingInsrtumentList)).toEqual(
      'Financial instrument, Credit insurance, Payment undertaking and Promissory note'
    )
  })

  it('should output correctly if list has 1 item', () => {
    const supportingInsrtumentList: SupportingInstrument[] = [SupportingInstrument.FinancialInstrument]

    expect(supportingInstrumentToSentenceList(supportingInsrtumentList)).toEqual('Financial instrument')
  })

  it('should output correctly if list has nothing in it', () => {
    const supportingInsrtumentList: SupportingInstrument[] = []

    expect(supportingInstrumentToSentenceList(supportingInsrtumentList)).toEqual('')
  })
})

describe('displayRequestType', () => {
  it('should output correct discounting/risk cover type', () => {
    expect(displayRequestType(RequestType.Discount, DiscountingType.WithoutRecourse)).toEqual(
      Strings.DiscountWithoutRecourseTitle
    )

    expect(displayRequestType(RequestType.Discount, DiscountingType.Recourse)).toEqual(
      Strings.DiscountWithRecourseTitle
    )

    expect(displayRequestType(RequestType.Discount, DiscountingType.Blended)).toEqual(Strings.DiscountBlendedTitle)

    expect(displayRequestType(RequestType.RiskCover)).toEqual(Strings.RiskCoverOnlyTitle)

    expect(displayRequestType(RequestType.RiskCoverDiscounting)).toEqual(Strings.RiskCoverWithDiscountingOptionTitle)

    expect(displayRequestType(RequestType.RiskCover, DiscountingType.WithoutRecourse)).toEqual(
      Strings.RiskCoverOnlyTitle
    )

    expect(displayRequestType(RequestType.RiskCoverDiscounting, DiscountingType.WithoutRecourse)).toEqual(
      Strings.RiskCoverWithDiscountingOptionTitle
    )

    expect(displayRequestType('Not an option' as any, DiscountingType.WithoutRecourse)).toEqual('Undefined')
  })
})

describe('displaySimpleRequestTyle', () => {
  expect(displaySimpleRequestType(RequestType.Discount)).toEqual(Strings.ReceivableDiscountingSimpleDisplayTitle)

  expect(displaySimpleRequestType(RequestType.RiskCover)).toEqual(Strings.RiskCoverSimpleDisplayTitle)

  expect(displaySimpleRequestType(RequestType.RiskCoverDiscounting)).toEqual(
    Strings.RiskCoverWithDiscountingOptionTitle
  )

  expect(displaySimpleRequestType(undefined)).toEqual(Strings.ReceivableDiscountingAndRiskCoverSimpleDisplayTitle)
})
