import React from 'react'
import { Currency } from '@komgo/types'
import { fakeFormikContext } from '../../../../store/common/faker'
import { rdQuoteSchema } from '../../utils/constants'
import { render } from '@testing-library/react'
import { CurrencyField, ICurrencyFieldProps } from './CurrencyField'
import { FormikProvider } from 'formik'

describe('CurrencyField', () => {
  let testProps: ICurrencyFieldProps
  beforeEach(() => {
    testProps = {
      formik: fakeFormikContext({ currency: Currency.CHF }),
      schema: rdQuoteSchema,
      name: 'currency'
    }
  })
  it('should render correctly', () => {
    expect(
      render(
        <FormikProvider value={testProps.formik}>
          <CurrencyField {...testProps} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
