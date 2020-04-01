import * as React from 'react'
import { FieldAttributes, FormikContext, Field } from 'formik'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { rdDiscountingSchema } from '../../utils/constants'
import { FieldWithLabel } from '../../../trades/components/Field'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import { FieldStyling } from '../../../trades/components/trade-form-fields/TradeData'
import { GridTextController } from '../../../letter-of-credit-legacy/components'
import { getFieldConfiguration } from '../../../trades/utils/getFieldConfiguration'
import { IReceivablesDiscountingBase } from '@komgo/types'
import { FieldDataProvider, FieldDataContext } from '../../presentation/FieldDataProvider'

export interface IRDFieldWithLabelProps {
  name: string
  formik: FormikContext<IReceivablesDiscountingBase>
  hasError: boolean
  customStyling?: string
  marginLeftLabel?: number
  customFieldWidth?: string
}

export const RDFieldWithLabel: React.FC<IRDFieldWithLabelProps & FieldAttributes<any>> = ({
  name,
  formik,
  marginLeftLabel,
  customFieldWidth,
  ...props
}) => {
  const fieldDescription = findFieldFromSchema('description', name, rdDiscountingSchema)
  if (customFieldWidth) {
    props.style = { width: customFieldWidth }
  }
  return (
    <FieldDataContext.Consumer>
      {(fieldDataProvider: FieldDataProvider) => (
        <FieldWithLabel
          customWidth={'240px'}
          verticalAlignLabel={'top'}
          marginLeftLabel={marginLeftLabel}
          bold={true}
          marginBottom={16}
        >
          <Field
            name={name}
            error={isErrorActive(name, formik.errors, formik.touched)}
            fieldName={fieldDataProvider.getTitle(name)}
            fieldStyle={props.customStyling ? props.customStyling : FieldStyling}
            component={GridTextController}
            configuration={getFieldConfiguration(fieldDescription !== name ? fieldDescription : undefined)}
            data-test-id={name}
            {...props}
          />
        </FieldWithLabel>
      )}
    </FieldDataContext.Consumer>
  )
}
