import React from 'react'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { FormikProvider } from 'formik'
import { Currency, PricingType } from '@komgo/types'
import { PricingTypeField, IPricingTypeFieldProps } from './PricingTypeField'

describe('PricingTypeField', () => {
  let testProps: IPricingTypeFieldProps

  beforeEach(() => {
    testProps = {
      formik: fakeFormikContext({}) as any,
      pricingType: PricingType.AllIn,
      defaultCurrency: Currency.CHF
    }
  })

  it('should render correctly for PricingType = AllIn', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <PricingTypeField {...testProps} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render correctly for PricingType = Split', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <PricingTypeField {...testProps} pricingType={PricingType.Split} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render correctly for PricingType = FlatFee', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <PricingTypeField {...testProps} pricingType={PricingType.FlatFee} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render correctly for PricingType = RiskFee', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <PricingTypeField {...testProps} pricingType={PricingType.RiskFee} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render correctly for PricingType = Margin', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <PricingTypeField {...testProps} pricingType={PricingType.Margin} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
