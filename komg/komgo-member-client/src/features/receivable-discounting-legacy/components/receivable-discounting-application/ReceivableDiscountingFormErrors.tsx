import * as React from 'react'
import { FormikContext } from 'formik'
import { MultiErrorMessage } from '../../../../components/error-message'
import { findTouchedErrors } from '../../../trades/utils/findTouchedErrors'
import { rdDiscountingSchema } from '../../utils/constants'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'

interface IProps {
  formik: FormikContext<any>
}

// TODO : Potential to refactor FormErrors from trade and allow it to scale to RD.
const ReceivableDiscountingFormErrors: React.FC<IProps> = (props: IProps) => {
  const { formik } = props
  const touchedErrors: any = findTouchedErrors(formik.errors, formik.touched)
  const errors = Object.keys(touchedErrors).map(field => {
    return touchedErrors[field].replace(field, findFieldFromSchema('title', field, rdDiscountingSchema))
  })
  if (errors.length) {
    return <MultiErrorMessage title="Validation Errors" messages={errors} />
  }
  return null
}

export default ReceivableDiscountingFormErrors
