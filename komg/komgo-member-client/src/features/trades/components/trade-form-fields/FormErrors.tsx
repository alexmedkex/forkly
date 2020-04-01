import * as React from 'react'
import { FormikContext, connect } from 'formik'
import { MultiErrorMessage } from '../../../../components/error-message'
import { findFieldFromTradeSchema } from '../../utils/displaySelectors'
import { CARGO_SCHEMA, PARCEL_SCHEMA, TRADE_SCHEMA } from '@komgo/types'
import { findTouchedErrors } from '../../utils/findTouchedErrors'
import { ICreateOrUpdateTrade } from '../../store/types'

export interface FormErrorsOwnProps {
  isParcelForm?: boolean
  showAllValidations?: boolean
  dataTestId?: string
}

const FormErrors: React.FC<FormErrorsOwnProps & { formik: FormikContext<any> }> = props => {
  const { formik, isParcelForm, showAllValidations, dataTestId } = props
  const schema = isParcelForm ? PARCEL_SCHEMA : TRADE_SCHEMA
  const touchedErrors: any = showAllValidations ? formik.errors : findTouchedErrors(formik.errors, formik.touched)

  const chooseSchema = (field: string) => {
    return field.startsWith('cargo') ? CARGO_SCHEMA : schema
  }

  const replaceFieldWithTitle = (field: string) => {
    const strippedField = field.replace('trade.', '').replace('cargo.', '')
    const chosenSchema = chooseSchema(field)
    const fieldToHumanReadable = findFieldFromTradeSchema('title', strippedField, chosenSchema)
    return touchedErrors[field].replace(strippedField, fieldToHumanReadable)
  }

  const errors = Object.keys(touchedErrors).map(field => replaceFieldWithTitle(field))

  if (errors.length) {
    return <MultiErrorMessage title="Validation Errors" messages={errors} dataTestId={dataTestId} />
  }
  return null
}

export default connect<FormErrorsOwnProps, ICreateOrUpdateTrade>(FormErrors)
