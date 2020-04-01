import React from 'react'
import { rdQuoteSchema, maturityLabels, authorizedMaturityValues } from '../../utils/constants'
import {
  enumToDropdownOptionsCustomLabels,
  GridDropdownController,
  withEmptyItem
} from '../../../letter-of-credit-legacy/components'
import { Field, FormikProps } from 'formik'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { FieldStyling } from '../../../trades/components/trade-form-fields/TradeData'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import { IQuoteBase } from '@komgo/types'
import { emptyDropdownItem } from '../../../trades/constants'

export const MATURITY_FIELD_NAME = 'daysUntilMaturity'
export interface MaturityInputFieldWithLabelProps {
  formik: FormikProps<IQuoteBase>
  fieldStyling?: {}
  labelStyle?: {}
  inputStyle?: {}
  optional?: boolean
}

export const MaturityInputFieldWithLabel: React.FC<MaturityInputFieldWithLabelProps> = ({
  formik,
  fieldStyling = FieldStyling,
  labelStyle,
  inputStyle,
  optional = false
}) => {
  let maturityOptions = enumToDropdownOptionsCustomLabels(authorizedMaturityValues, maturityLabels)
  if (optional) {
    maturityOptions = withEmptyItem(maturityOptions, {
      ...emptyDropdownItem,
      value: undefined
    })
  }

  return (
    <>
      <label style={labelStyle}>{findFieldFromSchema('title', MATURITY_FIELD_NAME, rdQuoteSchema)}</label>
      <Field
        name={MATURITY_FIELD_NAME}
        fieldStyle={fieldStyling}
        selection={true}
        search={true}
        error={isErrorActive(MATURITY_FIELD_NAME, formik.errors, formik.touched)}
        options={maturityOptions}
        component={GridDropdownController}
        data-test-id={MATURITY_FIELD_NAME}
        style={inputStyle}
      />
    </>
  )
}
