import * as React from 'react'
import {
  buildFakeQuote,
  InterestType,
  LiborType,
  PricingType,
  IQuote,
  Currency,
  RequestType,
  DiscountingType
} from '@komgo/types'
import { render } from '@testing-library/react'
import {
  IDisplayQuoteProps,
  DisplayQuote,
  MATURITY_VIEW_FIELD_NAME,
  INTEREST_TYPE_VIEW_FIELD_NAME,
  COF_VIEW_FIELD_NAME,
  PRICING_TYPE_VIEW_FIELD_NAME,
  FLAT_FEE__AMOUNT_VIEW_FIELD_NAME,
  ADD_ON_VALUE_FIELD_NAME
} from './DisplayQuote'
import { sentenceCase } from '../../../../../utils/casings'
import { displayViewQuoteInterestType } from '../../../../receivable-discounting-legacy/utils/displaySelectors'

const SECTION_NAME = 'Quote section'
describe('DisplayQuote', () => {
  it('should render the correct title and fields for Libor - Published', () => {
    const testProps = createTestProps({
      interestType: InterestType.Libor,
      liborType: LiborType.Published,
      pricingType: PricingType.AllIn,
      daysUntilMaturity: 30
    })
    const { queryByTestId } = render(<DisplayQuote {...testProps} />)

    expect(queryByTestId(createInterestTypeDataTestId(INTEREST_TYPE_VIEW_FIELD_NAME)).textContent).toContain(
      displayViewQuoteInterestType(InterestType.Libor, LiborType.Published)
    )

    const addOnValue = queryByTestId(createFieldValueDataTestId(MATURITY_VIEW_FIELD_NAME)).textContent
    expect(addOnValue).toEqual('1 month')
  })

  it('should render the correct title and fields for AddOnLibor', () => {
    const testProps = createTestProps({
      interestType: InterestType.AddOnLibor,
      pricingType: PricingType.AllIn,
      addOnValue: 50
    })
    const { queryByTestId } = render(<DisplayQuote {...testProps} />)

    expect(queryByTestId(createInterestTypeDataTestId(INTEREST_TYPE_VIEW_FIELD_NAME)).textContent).toContain(
      sentenceCase(InterestType.AddOnLibor)
    )

    const addOnValue = queryByTestId(createFieldValueDataTestId(ADD_ON_VALUE_FIELD_NAME)).textContent
    expect(addOnValue).toEqual('50.00%')
  })

  it('should render the correct title and fields for COF', () => {
    const testProps = createTestProps({
      interestType: InterestType.CostOfFunds,
      pricingType: PricingType.AllIn,
      indicativeCof: 50
    })

    const { queryByTestId } = render(<DisplayQuote {...testProps} />)

    expect(queryByTestId(createInterestTypeDataTestId(INTEREST_TYPE_VIEW_FIELD_NAME)).textContent).toContain(
      `${sentenceCase(InterestType.CostOfFunds)}`
    )

    const cof = queryByTestId(createFieldValueDataTestId(COF_VIEW_FIELD_NAME)).textContent
    expect(cof).toEqual('50.00%')
  })

  it('should render the correct title and fields for PricingType flatFee', () => {
    const testProps = createTestProps({
      pricingType: PricingType.FlatFee,
      interestType: InterestType.CostOfFunds,
      pricingFlatFeeAmount: { amount: 5000, currency: Currency.EUR }
    })

    const { queryByTestId } = render(<DisplayQuote {...testProps} />)

    expect(queryByTestId(createInterestTypeDataTestId(PRICING_TYPE_VIEW_FIELD_NAME)).textContent).toContain(
      `${sentenceCase(PricingType.FlatFee)}`
    )

    const flatFeeValue = queryByTestId(createFieldValueDataTestId(FLAT_FEE__AMOUNT_VIEW_FIELD_NAME)).textContent
    expect(flatFeeValue).toEqual('5,000 EUR')
  })

  function createInterestTypeDataTestId(fieldName: string) {
    return `${SECTION_NAME}-field-component-${fieldName}`
  }

  function createFieldValueDataTestId(fieldName: string) {
    return `${SECTION_NAME}-value-${fieldName}`
  }

  function createTestProps(overrides?: Partial<IQuote>): IDisplayQuoteProps {
    return {
      quote: buildFakeQuote(overrides),
      sectionName: 'Quote section',
      requestType: RequestType.Discount,
      discountingType: DiscountingType.WithoutRecourse
    }
  }
})
