import React from 'react'
import { render } from '@testing-library/react'
import { IRDFieldWithLabelProps, RDFieldWithLabel } from './RDFieldWithLabel'
import { fakeFormik } from '../../utils/faker'
import { FormikProvider } from 'formik'
import { FieldDataContext, FieldDataProvider } from '../../presentation/FieldDataProvider'
import { rdDiscountingSchema } from '../../utils/constants'

describe('RDFieldWithLabel', () => {
  let testProps: IRDFieldWithLabelProps

  beforeEach(() => {
    testProps = {
      name: 'invoiceType',
      formik: fakeFormik,
      hasError: false,
      customStyling: ''
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
            <RDFieldWithLabel {...testProps} />
          </FormikProvider>
        </FieldDataContext.Provider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
