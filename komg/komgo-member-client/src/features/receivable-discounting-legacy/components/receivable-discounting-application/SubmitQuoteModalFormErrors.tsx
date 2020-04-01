import * as React from 'react'
import { FormikContext } from 'formik'
import { MultiErrorMessage } from '../../../../components/error-message'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { findTouchedErrors } from '../../../trades/utils/findTouchedErrors'
import { rdQuoteSchema } from '../../utils/constants'

interface IProps {
  formik: FormikContext<any>
}

const SubmitQuoteModalFormErrors: React.FC<IProps> = (props: IProps) => {
  const { formik } = props
  const touchedErrors: any = findTouchedErrors(formik.errors, formik.touched)
  const errors = Object.keys(touchedErrors).map(field => {
    return touchedErrors[field].replace(field, findFieldFromSchema('title', field, rdQuoteSchema))
  })
  if (errors.length) {
    return <MultiErrorMessage title="Validation Errors" messages={errors} />
  }

  return null
}

export default SubmitQuoteModalFormErrors
