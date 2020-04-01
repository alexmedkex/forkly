import React from 'react'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { GenericInputField, IGenericInputFieldProps } from './GenericInputField'

export const GenericInputFieldWithLabel = <T extends object>({
  formik,
  name,
  schema,
  labelText,
  labelStyle,
  ...props
}: IGenericInputFieldProps<T>): React.ReactElement => {
  return (
    <>
      <label style={labelStyle}>{labelText || findFieldFromSchema('title', name, schema)}</label>
      <GenericInputField name={name} schema={schema} formik={formik} {...props} />
    </>
  )
}
