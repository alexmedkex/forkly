import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { SubmitQuoteFields, ISubmitQuoteFieldsProps } from './SubmitQuoteFields'
import { fakeFormikContext } from '../../../../../store/common/faker'
import { fakeRdInfo } from '../../../../receivable-discounting-legacy/utils/faker'
import { initialSubmitQuoteData } from '../../../../receivable-discounting-legacy/utils/constants'
import { FormikProvider } from 'formik'
import {
  PricingType,
  InterestType,
  Currency,
  RequestType,
  DiscountingType,
  LiborType,
  buildFakeReceivablesDiscountingExtended
} from '@komgo/types'
import moment from 'moment-timezone'

describe('SubmitQuoteFields', () => {
  let testProps: ISubmitQuoteFieldsProps
  let rendered: RenderResult
  let initialValues: any

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')

    testProps = {
      formik: undefined,
      discountingRequest: fakeRdInfo(),
      sellerName: 'Ms. Seller',
      defaultCofDate: new Date(2020, 6, 31)
    }
  })

  describe.each([
    { requestType: RequestType.RiskCover },
    { requestType: RequestType.RiskCoverDiscounting },
    { requestType: RequestType.Discount, discountingType: DiscountingType.WithoutRecourse },
    { requestType: RequestType.Discount, discountingType: DiscountingType.Recourse },
    { requestType: RequestType.Discount, discountingType: DiscountingType.Blended }
  ])('Common tests', testValues => {
    beforeEach(() => {
      testProps.discountingRequest.rd = buildFakeReceivablesDiscountingExtended(false, {
        requestType: testValues.requestType,
        discountingType: testValues.discountingType
      })
      initialValues = initialSubmitQuoteData(Currency.CHF, testValues.requestType, testValues.discountingType)
      testProps.formik = fakeFormikContext(initialValues)

      rendered = render(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields {...testProps} />
        </FormikProvider>
      )
    })

    describe(`${testValues.requestType} ${testValues.discountingType}`, () => {
      it('should render correctly', () => {
        expect(rendered.asFragment()).toMatchSnapshot()
      })

      it('should display flat fee and currency if pricing type flat fee is selected', () => {
        const first = rendered.asFragment()

        initialValues.pricingType = PricingType.FlatFee
        rendered.rerender(
          <FormikProvider value={testProps.formik}>
            <SubmitQuoteFields
              {...testProps}
              formik={fakeFormikContext({ ...initialValues, pricingType: PricingType.FlatFee })}
            />
          </FormikProvider>
        )

        expect(rendered.queryByTestId('pricingFlatFeeAmount.amount')).toBeVisible()
        expect(rendered.queryByTestId('pricingFlatFeeAmount.currency')).toBeVisible()
        expect(first).toMatchDiffSnapshot(rendered.asFragment())
      })
    })
  })

  describe.each([
    // No risk cover only as it does not show interest type fields
    { requestType: RequestType.RiskCoverDiscounting },
    { requestType: RequestType.Discount, discountingType: DiscountingType.WithoutRecourse },
    { requestType: RequestType.Discount, discountingType: DiscountingType.Recourse },
    { requestType: RequestType.Discount, discountingType: DiscountingType.Blended }
  ])('Interest type fields', testValues => {
    beforeEach(() => {
      initialValues = initialSubmitQuoteData(Currency.CHF, testValues.requestType, testValues.discountingType)
      testProps.formik = fakeFormikContext(initialValues)

      rendered = render(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields {...testProps} />
        </FormikProvider>
      )
    })

    it('should render correctly', () => {
      expect(rendered.asFragment()).toMatchSnapshot()
    })

    it('should display Indicative COF if Cost of funds is selected', () => {
      const first = rendered.asFragment()
      rendered.rerender(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields
            {...testProps}
            formik={fakeFormikContext({ ...initialValues, interestType: InterestType.CostOfFunds })}
          />
        </FormikProvider>
      )

      expect(rendered.queryByTestId('indicativeCof')).toBeVisible()
      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })

    it('should display Libor value if interest type is Libor', () => {
      const first = rendered.asFragment()
      rendered.rerender(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields
            {...testProps}
            formik={fakeFormikContext({ ...initialValues, interestType: InterestType.Libor })}
          />
        </FormikProvider>
      )

      expect(rendered.queryByTestId('liborType_PUBLISHED')).toBeVisible()
      expect(rendered.queryByTestId('liborType_INTERPOLATED')).toBeVisible()
      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })

    it('should display days until maturity if libor type is Published', () => {
      const first = rendered.asFragment()
      rendered.rerender(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields
            {...testProps}
            formik={fakeFormikContext({
              ...initialValues,
              interestType: InterestType.Libor,
              liborType: LiborType.Published
            })}
          />
        </FormikProvider>
      )

      expect(rendered.queryByTestId('daysUntilMaturity')).toBeVisible()
      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })

    it('should display add on value if interest type is AddOnLibor', () => {
      const first = rendered.asFragment()
      rendered.rerender(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields
            {...testProps}
            formik={fakeFormikContext({
              ...initialValues,
              interestType: InterestType.AddOnLibor
            })}
          />
        </FormikProvider>
      )

      expect(rendered.queryByTestId('addOnValue')).toBeVisible()
      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })
  })

  describe.each([
    { requestType: RequestType.RiskCoverDiscounting },
    { requestType: RequestType.Discount, discountingType: DiscountingType.WithoutRecourse },
    { requestType: RequestType.Discount, discountingType: DiscountingType.Blended }
  ])('Pricing type: split', testValues => {
    beforeEach(() => {
      initialValues = initialSubmitQuoteData(Currency.CHF, testValues.requestType, testValues.discountingType)
      testProps.formik = fakeFormikContext(initialValues)

      rendered = render(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields {...testProps} />
        </FormikProvider>
      )
    })

    it('should display risk fee and margin if pricing type split is selected', () => {
      const first = rendered.asFragment()

      rendered.rerender(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields
            {...testProps}
            formik={fakeFormikContext({ ...initialValues, pricingType: PricingType.Split })}
          />
        </FormikProvider>
      )

      expect(rendered.queryByTestId('riskFee')).toBeVisible()
      expect(rendered.queryByTestId('margin')).toBeVisible()
      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })
  })

  describe('Discounting without recourse', () => {
    beforeEach(() => {
      initialValues = initialSubmitQuoteData(Currency.CHF, RequestType.Discount, DiscountingType.WithoutRecourse)
      testProps.formik = fakeFormikContext(initialValues)

      rendered = render(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields {...testProps} />
        </FormikProvider>
      )
    })

    it('should display pricing AllIn if pricing type AllIn is selected', () => {
      const first = rendered.asFragment()

      rendered.rerender(
        <FormikProvider value={testProps.formik}>
          <SubmitQuoteFields
            {...testProps}
            formik={fakeFormikContext({ ...initialValues, pricingType: PricingType.AllIn })}
          />
        </FormikProvider>
      )

      expect(rendered.queryByTestId('pricingAllIn')).toBeVisible()
      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })
  })
})
