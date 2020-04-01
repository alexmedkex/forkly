import { shallow } from 'enzyme'
import { FormikProvider } from 'formik'
import * as React from 'react'
import { MinimalAccordionWrapper } from '../../../../../components/accordion/MinimalAccordionWrapper'
import BasicPanel from '../../../../trades/components/BasicPanel'
import ApplyForDiscountingData from './ApplyForDiscountingData'
import { fakeFormik } from '../../../../receivable-discounting-legacy/utils/faker'
import {
  IReceivablesDiscountingBase,
  SupportingInstrument,
  FinancialInstrument,
  RequestType,
  DiscountingType,
  buildFakeReceivablesDiscountingBase
} from '@komgo/types'
import { RDInvoiceAmountAndCurrency } from '../../../../receivable-discounting-legacy/components/fields/RDInvoiceAmountWithCurrencyField'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../../store/common/faker'
import {
  FieldDataContext,
  FieldDataProvider
} from '../../../../receivable-discounting-legacy/presentation/FieldDataProvider'
import { rdDiscountingSchema } from '../../../../receivable-discounting-legacy/utils/constants'

describe('ApplyForDiscountingData component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      formik: { ...fakeFormikContext(buildFakeReceivablesDiscountingBase()) },
      receivableDiscountingPanelActive: true,
      index: 'FakePanelIndex'
    }
  })

  it('renders correctly for Discounting without recourse', () => {
    defaultProps.formik.values.requestType = RequestType.Discount
    defaultProps.formik.values.discountingType = DiscountingType.WithoutRecourse

    expectMatchSnapshot(defaultProps)
  })

  it('renders correctly for Discounting with recourse', () => {
    defaultProps.formik.values.requestType = RequestType.Discount
    defaultProps.formik.values.discountingType = DiscountingType.Recourse

    expectMatchSnapshot(defaultProps)
  })

  it('renders correctly for Discounting Blended', () => {
    defaultProps.formik.values.requestType = RequestType.Discount
    defaultProps.formik.values.discountingType = DiscountingType.Blended

    expectMatchSnapshot(defaultProps)
  })

  it('renders correctly for Risk Cover only', () => {
    defaultProps.formik.values.requestType = RequestType.RiskCover

    expectMatchSnapshot(defaultProps)
  })

  it('renders correctly for Risk Cover with discounting option', () => {
    defaultProps.formik.values.requestType = RequestType.RiskCoverDiscounting

    expectMatchSnapshot(defaultProps)
  })

  it('should show Risk Cover fields for Risk Cover only', () => {
    defaultProps.formik.values.requestType = RequestType.RiskCover

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...defaultProps} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('numberOfDaysDiscounting')).toBeNull()
    expect(rendered.queryByTestId('discountingDate')).toBeNull()
    expect(rendered.queryByTestId('numberOfDaysRiskCover')).toBeVisible()
    expect(rendered.queryByTestId('riskCoverDate')).toBeVisible()
  })

  it('should show Risk Cover and Discounting fields for Risk Cover with discounting option', () => {
    defaultProps.formik.values.requestType = RequestType.RiskCoverDiscounting

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...defaultProps} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('numberOfDaysDiscounting')).toBeVisible()
    expect(rendered.queryByTestId('numberOfDaysRiskCover')).toBeVisible()
  })

  it('should show Risk Cover and Discounting fields for Discounting blended', () => {
    defaultProps.formik.values.requestType = RequestType.Discount
    defaultProps.formik.values.discountingType = DiscountingType.Blended

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...defaultProps} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('numberOfDaysDiscounting')).toBeVisible()
    expect(rendered.queryByTestId('discountingDate')).toBeVisible()
    expect(rendered.queryByTestId('numberOfDaysRiskCover')).toBeVisible()
    expect(rendered.queryByTestId('riskCoverDate')).toBeVisible()
  })

  it('should show  Discounting fields for Discounting without recourse', () => {
    defaultProps.formik.values.requestType = RequestType.Discount
    defaultProps.formik.values.discountingType = DiscountingType.WithoutRecourse

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...defaultProps} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('numberOfDaysDiscounting')).toBeVisible()
    expect(rendered.queryByTestId('discountingDate')).toBeVisible()
    expect(rendered.queryByTestId('numberOfDaysRiskCover')).toBeNull()
    expect(rendered.queryByTestId('riskCoverDate')).toBeNull()
  })

  it('should find 1 RDInvoiceAmountAndCurrency', () => {
    const wrapper = shallow(wrapFieldDataContext(wrapFieldDataContext(<ApplyForDiscountingData {...defaultProps} />)))

    const rdInvoiceAmountAndCurrency = wrapper
      .find(ApplyForDiscountingData)
      .shallow()
      .find(MinimalAccordionWrapper)
      .shallow()
      .find(BasicPanel)
      .shallow()
      .find(RDInvoiceAmountAndCurrency)

    expect(rdInvoiceAmountAndCurrency.length).toBe(1)
  })

  it('should show Financial Instrument fields if SupportingInstrument.FinancialInstrument is selected, on Discounting without recourse', () => {
    const props = { ...defaultProps }
    const newValues: IReceivablesDiscountingBase = {
      ...props.formik.values,
      requestType: RequestType.Discount,
      discountingType: DiscountingType.WithoutRecourse,
      supportingInstruments: [SupportingInstrument.FinancialInstrument],
      financialInstrumentInfo: {}
    }
    props.formik.values = newValues

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...defaultProps} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('financialInstrumentInfo.financialInstrumentIssuerName')).toBeVisible()
    expect(rendered.queryByTestId('financialInstrumentInfo.financialInstrumentIfOther')).toBeNull()
  })

  it('should show Financial Instrument & guarantor fields if SupportingInstrument (FinancialInstrument & ParentCompanyGuarantee) is selected, on Discounting without recourse', () => {
    const props = { ...defaultProps }
    const newValues: IReceivablesDiscountingBase = {
      ...props.formik.values,
      requestType: RequestType.Discount,
      discountingType: DiscountingType.WithoutRecourse,
      supportingInstruments: [SupportingInstrument.FinancialInstrument, SupportingInstrument.ParentCompanyGuarantee],
      financialInstrumentInfo: {}
    }
    props.formik.values = newValues

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...props} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('financialInstrumentInfo.financialInstrumentIssuerName')).toBeVisible()
    expect(rendered.queryByTestId('guarantor')).toBeVisible()
    expect(rendered.queryByTestId('financialInstrumentInfo.financialInstrumentIfOther')).toBeNull()
  })

  it('should show Financial Instrument Other field if SupportingInstrument.FinancialInstrument Other is selected, on Discounting without recourse', () => {
    const props = { ...defaultProps }
    const newValues: IReceivablesDiscountingBase = {
      ...props.formik.values,
      requestType: RequestType.Discount,
      discountingType: DiscountingType.WithoutRecourse,
      supportingInstruments: [SupportingInstrument.FinancialInstrument],
      financialInstrumentInfo: { financialInstrument: FinancialInstrument.Other }
    }
    props.formik.values = newValues

    const rendered = render(
      wrapFieldDataContext(
        <FormikProvider value={fakeFormik}>
          <ApplyForDiscountingData {...props} />
        </FormikProvider>
      )
    )

    expect(rendered.queryByTestId('financialInstrumentInfo.financialInstrumentIssuerName')).toBeVisible()
    expect(rendered.queryByTestId('financialInstrumentInfo.financialInstrumentIfOther')).toBeVisible()
  })

  function expectMatchSnapshot(defaultProps) {
    expect(
      render(
        wrapFieldDataContext(
          <FormikProvider value={fakeFormik}>
            <ApplyForDiscountingData {...defaultProps} />
          </FormikProvider>
        )
      ).asFragment()
    ).toMatchSnapshot()
  }

  function wrapFieldDataContext(component: any) {
    return (
      <FieldDataContext.Provider value={new FieldDataProvider(rdDiscountingSchema)}>
        {component}
      </FieldDataContext.Provider>
    )
  }
})
