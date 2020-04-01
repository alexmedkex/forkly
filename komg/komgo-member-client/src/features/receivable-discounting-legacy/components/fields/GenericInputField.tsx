import React from 'react'
import { FieldAttributes, FormikProps, Field } from 'formik'
import { FieldStyling } from '../../../trades/components/trade-form-fields/TradeData'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { get } from 'lodash'

export interface IGenericInputFieldProps<T extends object> extends FieldAttributes<any> {
  formik: FormikProps<T>
  name: string
  schema: object
  labelText?: string
  labelStyle?: object
}

export const GenericInputField = <T extends object>({
  formik,
  name,
  schema,
  ...props
}: IGenericInputFieldProps<T>): React.ReactElement => (
  <Field
    name={name}
    fieldName={findFieldFromSchema('title', name, schema)}
    value={get(formik.values, name)}
    fieldStyle={FieldStyling}
    hideLabel={true}
    error={isErrorActive(name, formik.errors, formik.touched)}
    {...props}
  />
)
