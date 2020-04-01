import React from 'react'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { rdQuoteSchema } from '../../utils/constants'
import { FormikProvider } from 'formik'
import { MonetaryAmountField } from './MonetaryAmountField'
import { Currency } from '@komgo/types'

describe('MonetaryAmountField', () => {
  it('should render correctly', () => {
    const formik = fakeFormikContext({}) as any
    expect(
      render(
        <FormikProvider value={formik}>
          <MonetaryAmountField
            schema={rdQuoteSchema}
            name="pricingFlatFeeAmount"
            formik={formik}
            defaultCurrency={Currency.CHF}
          />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
