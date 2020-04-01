import * as React from 'react'
import {
  buildFakeQuote,
  InterestType,
  LiborType,
  PricingType,
  IQuote,
  Currency,
  buildFakeReceivablesDiscountingExtended
} from '@komgo/types'
import { fakeFormikContext } from '../../../../../store/common/faker'
import { FormikProvider } from 'formik'
import { render } from '@testing-library/react'
import { IEditAcceptedQuoteFieldsProps, EditAcceptedQuoteFields } from './EditAcceptedQuoteFields'
import { sentenceCase } from '../../../../../utils/casings'
import { MATURITY_FIELD_NAME } from '../../../../receivable-discounting-legacy/components/fields/MaturityInputFieldWithLabel'
import { interestTypeDisplayValue } from '../../../../receivable-discounting-legacy/utils/displaySelectors'

describe('EditAcceptedQuoteFields', () => {
  it('should render the correct title and fields for Libor - Published', () => {
    const testProps = createTestProps({
      interestType: InterestType.Libor,
      liborType: LiborType.Published,
      pricingType: PricingType.AllIn
    })
    const { queryByTestId } = render(
      <FormikProvider value={testProps.formik}>
        <EditAcceptedQuoteFields {...testProps} />
      </FormikProvider>
    )

    expect(queryByTestId('label-interest-type').textContent).toEqual(
      `${sentenceCase(InterestType.Libor)} - ${sentenceCase(LiborType.Published)}`
    )
    expect(queryByTestId(MATURITY_FIELD_NAME)).toBeVisible()
  })

  it('should render the correct title and fields for AddOnLibor', () => {
    const testProps = createTestProps({
      interestType: InterestType.AddOnLibor,
      pricingType: PricingType.AllIn,
      addOnValue: 50
    })
    const { queryByTestId } = render(
      <FormikProvider value={testProps.formik}>
        <EditAcceptedQuoteFields {...testProps} />
      </FormikProvider>
    )
    expect(queryByTestId('label-interest-type').textContent).toEqual(interestTypeDisplayValue(InterestType.AddOnLibor))
    expect(queryByTestId('addOnValue').querySelector('input').value).toEqual('50')
  })

  it('should render the correct title and fields for COF', () => {
    const testProps = createTestProps({
      interestType: InterestType.CostOfFunds,
      pricingType: PricingType.AllIn,
      indicativeCof: 50
    })

    const { queryByTestId } = render(
      <FormikProvider value={testProps.formik}>
        <EditAcceptedQuoteFields {...testProps} />
      </FormikProvider>
    )

    expect(queryByTestId('label-interest-type').textContent).toEqual(`${sentenceCase(InterestType.CostOfFunds)}`)
    expect(queryByTestId('indicativeCof').querySelector('input').value).toEqual('50')
  })

  it('should render the correct title and fields for PricingType flatFee', () => {
    const testProps = createTestProps({
      pricingType: PricingType.FlatFee,
      interestType: InterestType.CostOfFunds,
      pricingFlatFeeAmount: { amount: 5000, currency: Currency.EUR }
    })

    const { queryByTestId } = render(
      <FormikProvider value={testProps.formik}>
        <EditAcceptedQuoteFields {...testProps} />
      </FormikProvider>
    )

    expect(queryByTestId('label-interest-type').textContent).toEqual(`${sentenceCase(InterestType.CostOfFunds)}`)
    expect(queryByTestId('pricingFlatFeeAmount.amount').querySelector('input').value).toEqual('5,000.00')
    expect(queryByTestId('pricingFlatFeeAmount.currency')).toBeVisible()
  })

  function createTestProps(overrides?: Partial<IQuote>): IEditAcceptedQuoteFieldsProps {
    return {
      formik: {
        ...fakeFormikContext(buildFakeQuote(overrides))
      },
      rd: buildFakeReceivablesDiscountingExtended()
    }
  }
})
