import React from 'react'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { rdQuoteSchema } from '../../utils/constants'
import { FormikProvider } from 'formik'
import { PercentageInputField } from './PercentageInputField'

describe('PercentageInputField', () => {
  it('should render correctly', () => {
    const formik = fakeFormikContext({}) as any
    expect(
      render(
        <FormikProvider value={formik}>
          <PercentageInputField schema={rdQuoteSchema} name="advanceRate" data-test-id="advanceRate" formik={formik} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
