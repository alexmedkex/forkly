import React from 'react'
import { Currency } from '@komgo/types'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import { enumToDropdownOptions, DropdownController } from '../../../letter-of-credit-legacy/components'
import { Field, FieldAttributes } from 'formik'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { get } from 'lodash'

export interface ICurrencyFieldProps extends FieldAttributes<any> {
  schema: object
  name: string
}

export const CurrencyField: React.FC<ICurrencyFieldProps> = ({ schema, formik, name, ...props }) => (
  <Field
    name={name}
    fieldName={findFieldFromSchema('title', name, schema)}
    style={{ margin: '0', marginLeft: '5px', width: '80px' }}
    error={isErrorActive(name, formik.errors, formik.touched)}
    selection={true}
    search={true}
    compact={true}
    defaultValue={Currency.USD}
    options={enumToDropdownOptions(Currency, true)}
    component={DropdownController}
    data-test-id={`${name}.currency`}
    value={get(formik.values, name)}
    {...props}
  />
)
