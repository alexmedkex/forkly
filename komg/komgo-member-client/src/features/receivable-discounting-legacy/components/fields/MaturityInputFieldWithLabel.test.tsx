import React from 'react'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { FormikProvider } from 'formik'
import { MaturityInputFieldWithLabel } from './MaturityInputFieldWithLabel'

describe('MaturityInputFieldWithLabel', () => {
  it('should render correctly', () => {
    const formik = fakeFormikContext({}) as any
    expect(
      render(
        <FormikProvider value={formik}>
          <MaturityInputFieldWithLabel formik={formik} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
