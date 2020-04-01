import React from 'react'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { GridTextController } from '../../../letter-of-credit-legacy/components'
import { getFieldConfiguration } from '../../../trades/utils/getFieldConfiguration'
import { rdQuoteSchema } from '../../utils/constants'
import { GenericInputFieldWithLabel } from './GenericInputFieldWithLabel'
import { FormikProvider } from 'formik'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'

describe('GenericInputFieldWithLabel', () => {
  it('should render correctly', () => {
    const formik = fakeFormikContext({}) as any
    expect(
      render(
        <FormikProvider value={formik}>
          <GenericInputFieldWithLabel
            type="number"
            step="1"
            name="numberOfDaysDiscounting"
            formik={formik}
            component={GridTextController}
            schema={rdQuoteSchema}
            configuration={getFieldConfiguration(
              findFieldFromSchema('description', 'numberOfDaysDiscounting', rdQuoteSchema)
            )}
            data-test-id="numberOfDaysDiscounting"
          />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
