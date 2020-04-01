import React from 'react'
import { render } from '@testing-library/react'
import { IRDFieldWithLabelProps, RDFieldWithLabel } from './RDFieldWithLabel'
import { fakeFormik } from '../../utils/faker'
import { FormikProvider } from 'formik'
import { RDInvoiceAmountAndCurrency, IRDInvoiceAmountAndCurrencyProps } from './RDInvoiceAmountWithCurrencyField'
import { shallow } from 'enzyme'
import { MinimalAccordionWrapper } from '../../../../components/accordion/MinimalAccordionWrapper'
import BasicPanel from '../../../trades/components/BasicPanel'
import { FieldWithLabel } from '../../../trades/components/Field'
import { Field } from 'formik'
import { FieldDataContext, FieldDataProvider } from '../../presentation/FieldDataProvider'
import { rdDiscountingSchema } from '../../utils/constants'

describe('RDInvoiceAmountAndCurrency', () => {
  let testProps: IRDInvoiceAmountAndCurrencyProps

  beforeEach(() => {
    testProps = {
      currencyDisabled: false,
      formik: fakeFormik
    }
  })

  it('matches snapshot ', () => {
    const fakeFormik = {
      ...testProps.formik
    }
    expect(
      render(
        <FieldDataContext.Provider value={new FieldDataProvider(rdDiscountingSchema)}>
          <FormikProvider value={fakeFormik}>
            <RDInvoiceAmountAndCurrency {...testProps} />
          </FormikProvider>
        </FieldDataContext.Provider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('sets currency to disabled if property set ', () => {
    const fakeFormik = {
      ...testProps.formik
    }

    const { getByTestId } = render(
      <FieldDataContext.Provider value={new FieldDataProvider(rdDiscountingSchema)}>
        <FormikProvider value={fakeFormik}>
          <RDInvoiceAmountAndCurrency {...testProps} currencyDisabled={true} />
        </FormikProvider>
      </FieldDataContext.Provider>
    )

    expect(getByTestId('currency').classList.contains('disabled')).toBe(true)
  })
})
