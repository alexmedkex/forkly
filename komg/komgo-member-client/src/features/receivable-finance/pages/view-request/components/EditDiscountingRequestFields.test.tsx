import * as React from 'react'
import { IEditDiscountingRequestFieldsProps, EditDiscountingRequestFields } from './EditDiscountingRequestFields'
import { buildFakeReceivablesDiscountingBase, RequestType, DiscountingType } from '@komgo/types'
import { fakeFormikContext } from '../../../../../store/common/faker'
import { FormikProvider } from 'formik'
import { render } from '@testing-library/react'
import {
  FieldDataContext,
  FieldDataProvider
} from '../../../../receivable-discounting-legacy/presentation/FieldDataProvider'
import { rdDiscountingSchema } from '../../../../receivable-discounting-legacy/utils/constants'

describe('EditDiscountingRequestFields', () => {
  let testProps: IEditDiscountingRequestFieldsProps

  beforeEach(() => {
    testProps = {
      formik: { ...fakeFormikContext(buildFakeReceivablesDiscountingBase()) }
    }
  })

  it('renders correctly for Discounting without recourse', () => {
    testProps.formik.values.requestType = RequestType.Discount
    testProps.formik.values.discountingType = DiscountingType.WithoutRecourse

    expectMatchSnapshot(testProps)
  })

  it('renders correctly for Discounting with recourse', () => {
    testProps.formik.values.requestType = RequestType.Discount
    testProps.formik.values.discountingType = DiscountingType.Recourse

    expectMatchSnapshot(testProps)
  })

  it('renders correctly for Discounting blended', () => {
    testProps.formik.values.requestType = RequestType.Discount
    testProps.formik.values.discountingType = DiscountingType.Blended

    expectMatchSnapshot(testProps)
  })

  it('renders correctly for Risk Cover with discounting option', () => {
    testProps.formik.values.requestType = RequestType.RiskCoverDiscounting

    expectMatchSnapshot(testProps)
  })

  it('renders correctly for Risk Cover only', () => {
    testProps.formik.values.requestType = RequestType.RiskCover

    expectMatchSnapshot(testProps)
  })

  it('should disable advancedRate, currency and numberOfDaysDiscounting', () => {
    const { getByTestId } = render(
      wrapFieldDataContext(
        <FormikProvider value={testProps.formik}>
          <EditDiscountingRequestFields {...testProps} />
        </FormikProvider>
      )
    )

    expect(getByTestId('advancedRate').classList.contains('disabled')).toBe(true)
    expect(getByTestId('numberOfDaysDiscounting').classList.contains('disabled')).toBe(true)
    expect(getByTestId('currency').classList.contains('disabled')).toBe(true)
  })

  it('should disable advancedRate, currency and numberOfDaysRiskCover, hiding numberOfDaysDiscounting, for Risk Cover Only', () => {
    testProps.formik.values.requestType = RequestType.RiskCover

    const { getByTestId, queryByTestId } = render(
      wrapFieldDataContext(
        <FormikProvider value={testProps.formik}>
          <EditDiscountingRequestFields {...testProps} />
        </FormikProvider>
      )
    )

    expect(getByTestId('advancedRate').classList.contains('disabled')).toBe(true)
    expect(getByTestId('numberOfDaysRiskCover').classList.contains('disabled')).toBe(true)
    expect(getByTestId('currency').classList.contains('disabled')).toBe(true)
    expect(queryByTestId('numberOfDaysDiscounting')).toBeNull()
  })

  it('should disable advancedRate, currency, numberOfDaysRiskCover and  numberOfDaysDiscounting, for Risk Cover with discounting option', () => {
    testProps.formik.values.requestType = RequestType.RiskCoverDiscounting

    const { getByTestId } = render(
      wrapFieldDataContext(
        <FormikProvider value={testProps.formik}>
          <EditDiscountingRequestFields {...testProps} />
        </FormikProvider>
      )
    )

    expect(getByTestId('advancedRate').classList.contains('disabled')).toBe(true)
    expect(getByTestId('numberOfDaysRiskCover').classList.contains('disabled')).toBe(true)
    expect(getByTestId('numberOfDaysDiscounting').classList.contains('disabled')).toBe(true)
    expect(getByTestId('currency').classList.contains('disabled')).toBe(true)
  })

  function wrapFieldDataContext(component: any) {
    return (
      <FieldDataContext.Provider value={new FieldDataProvider(rdDiscountingSchema)}>
        {component}
      </FieldDataContext.Provider>
    )
  }

  function expectMatchSnapshot(testProps) {
    expect(
      render(
        wrapFieldDataContext(
          <FormikProvider value={testProps.formik}>
            <EditDiscountingRequestFields {...testProps} />
          </FormikProvider>
        )
      ).asFragment()
    ).toMatchSnapshot()
  }
})
