import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AcceptQuoteFields, { IAcceptQuoteFieldsProps } from './AcceptQuoteFields'
import {
  buildFakeQuote,
  RequestType,
  DiscountingType,
  PricingType,
  buildFakeReceivablesDiscountingExtended,
  Currency
} from '@komgo/types'
import { fakeFormikContext } from '../../../../../store/common/faker'
import { ISubmitQuoteFormDetails } from '../../../../receivable-discounting-legacy/store/types'
import { cloneDeep } from 'lodash'
import { FormikProvider } from 'formik'

const RISK_COVER_WITH_DISCOUNTING = { requestType: RequestType.RiskCoverDiscounting, discountingType: undefined }
const DISCOUNTING = [
  { requestType: RequestType.Discount, discountingType: DiscountingType.Recourse },
  { requestType: RequestType.Discount, discountingType: DiscountingType.WithoutRecourse }
]
const RISK_COVER = [{ requestType: RequestType.RiskCover, discountingType: undefined }, RISK_COVER_WITH_DISCOUNTING]
const ALL = [...RISK_COVER, ...DISCOUNTING]

describe('AcceptQuoteFields', () => {
  let testProps: IAcceptQuoteFieldsProps
  let values: ISubmitQuoteFormDetails

  beforeEach(() => {
    const quote = buildFakeQuote(undefined, undefined, RequestType.Discount, DiscountingType.WithoutRecourse)
    values = { ...cloneDeep(quote), rdId: 'testRdId' }
    testProps = {
      rd: buildFakeReceivablesDiscountingExtended(),
      bank: 'Mercuria',
      formik: fakeFormikContext(values),
      quote
    }
  })

  it('should render correctly', () => {
    expect(
      render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('it shows the number of days discounting field for request type Discount', () => {
    testProps.rd.requestType = RequestType.Discount

    const { queryByTestId } = render(
      <FormikProvider value={testProps.formik}>
        <AcceptQuoteFields {...testProps} />
      </FormikProvider>
    )

    expect(queryByTestId('numberOfDaysDiscounting')).toBeVisible()
    expect(queryByTestId('numberOfDaysRiskCover')).toBeNull()
  })

  it('it shows both the number of days discounting and number of days risk cover fields for request type RiskCoverDiscounting', () => {
    const quote = buildFakeQuote(undefined, undefined, RequestType.RiskCoverDiscounting)
    values = { ...cloneDeep(quote), rdId: 'testRdId' }
    testProps = {
      rd: { ...buildFakeReceivablesDiscountingExtended(), requestType: RequestType.RiskCoverDiscounting },
      bank: 'Mercuria',
      formik: fakeFormikContext(values),
      quote
    }
    delete testProps.rd.discountingType

    const { queryByTestId } = render(
      <FormikProvider value={testProps.formik}>
        <AcceptQuoteFields {...testProps} />
      </FormikProvider>
    )

    expect(queryByTestId('numberOfDaysDiscounting')).toBeVisible()
    expect(queryByTestId('numberOfDaysRiskCover')).toBeVisible()
  })

  describe('PricingType fields', () => {
    it('it shows pricing type margin for margin', () => {
      resetPricingType(PricingType.Margin)

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('margin')).toBeVisible()
    })

    it('it shows pricing type risk fee for risk fee', () => {
      resetPricingType(PricingType.RiskFee)

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('riskFee')).toBeVisible()
    })

    it('it shows both risk fee and margin for split', () => {
      resetPricingType(PricingType.Split)

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('riskFee')).toBeVisible()
      expect(queryByTestId('margin')).toBeVisible()
    })

    it('it shows flat fee for pricing type flat fee', () => {
      const quote = buildFakeQuote(
        { pricingType: PricingType.FlatFee, pricingFlatFeeAmount: { amount: 100, currency: Currency.CHF } },
        undefined,
        RequestType.RiskCoverDiscounting
      )
      values = { ...cloneDeep(quote), rdId: 'testRdId' }
      testProps = {
        rd: { ...buildFakeReceivablesDiscountingExtended(), requestType: RequestType.RiskCoverDiscounting },
        bank: 'Mercuria',
        formik: fakeFormikContext(values),
        quote
      }
      delete testProps.rd.discountingType

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('pricingFlatFeeAmount.amount')).toBeVisible()
      expect(queryByTestId('pricingFlatFeeAmount.currency')).toBeVisible()
    })

    it('it shows all in for pricing type all in', () => {
      resetPricingType(PricingType.AllIn)

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('pricingAllIn')).toBeVisible()
    })

    function resetPricingType(pricingType: PricingType) {
      const quote = buildFakeQuote({ pricingType }, undefined, RequestType.RiskCoverDiscounting)
      values = { ...cloneDeep(quote), rdId: 'testRdId' }
      testProps = {
        rd: { ...buildFakeReceivablesDiscountingExtended(), requestType: RequestType.RiskCoverDiscounting },
        bank: 'Mercuria',
        formik: fakeFormikContext(values),
        quote
      }
      delete testProps.rd.discountingType
    }
  })

  describe.each(ALL)('Interest type fields', ({ requestType, discountingType }) => {
    beforeEach(() => {
      const quote = buildFakeQuote(undefined, undefined, requestType, discountingType)
      values = { ...cloneDeep(quote), rdId: 'testRdId' }
      testProps = {
        rd: buildFakeReceivablesDiscountingExtended(),
        bank: 'Mercuria',
        formik: fakeFormikContext(values),
        quote
      }
    })

    it('should show pricing all in if pricing type is all in', () => {
      testProps.formik = fakeFormikContext({ ...values, pricingType: PricingType.AllIn })

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('pricingAllIn')).toBeVisible()
    })

    it('should show pricing Margin and Risk Fee if pricing type is Split', () => {
      testProps.formik = fakeFormikContext({ ...values, pricingType: PricingType.Split })

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('margin')).toBeVisible()
      expect(queryByTestId('riskFee')).toBeVisible()
    })

    it('should show pricing Flat fee if pricing type is Flat fee', () => {
      testProps.formik = fakeFormikContext({ ...values, pricingType: PricingType.FlatFee })

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('pricingFlatFeeAmount.amount')).toBeVisible()
      expect(queryByTestId('pricingFlatFeeAmount.currency')).toBeVisible()
    })
  })

  describe.each([...DISCOUNTING, RISK_COVER_WITH_DISCOUNTING])('Interest type fields', ({ requestType }) => {
    beforeEach(() => {
      const quote = buildFakeQuote(undefined, undefined, requestType)
      values = { ...cloneDeep(quote), rdId: 'testRdId' }
      testProps = {
        rd: buildFakeReceivablesDiscountingExtended(),
        bank: 'Mercuria',
        formik: fakeFormikContext(values),
        quote
      }
    })

    it('should show interest data and fee calculation data', () => {
      testProps.formik = fakeFormikContext({ ...values, pricingType: PricingType.Split })

      const { queryByTestId } = render(
        <FormikProvider value={testProps.formik}>
          <AcceptQuoteFields {...testProps} />
        </FormikProvider>
      )

      expect(queryByTestId('interest-data')).toBeVisible()
      expect(queryByTestId('feeCalculationType-data')).toBeVisible()
    })
  })
})
