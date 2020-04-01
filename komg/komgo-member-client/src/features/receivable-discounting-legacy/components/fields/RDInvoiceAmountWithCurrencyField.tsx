import * as React from 'react'
import { FieldAttributes, FormikContext, Field } from 'formik'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { rdDiscountingSchema } from '../../utils/constants'
import { FieldWithLabel } from '../../../trades/components/Field'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import {
  FormattedInputController,
  enumToDropdownOptions,
  DropdownController
} from '../../../letter-of-credit-legacy/components'
import { IReceivablesDiscountingBase, Currency } from '@komgo/types'
import Label from '../../../trades/components/Label'
import { stringOrNull } from '../../../../utils/types'
import { toDecimalPlaces } from '../../../../utils/field-formatters'
import Numeral from 'numeral'
import { FieldDataContext, FieldDataProvider } from '../../presentation/FieldDataProvider'
import { Dimensions } from '../../resources/dimensions'

export interface IRDInvoiceAmountAndCurrencyProps {
  formik: FormikContext<IReceivablesDiscountingBase>
  currencyDisabled: boolean
}

export const RDInvoiceAmountAndCurrency: React.FC<IRDInvoiceAmountAndCurrencyProps & FieldAttributes<any>> = ({
  formik,
  ...props
}) => {
  return (
    <FieldDataContext.Consumer>
      {(fieldDataProvider: FieldDataProvider) => (
        <FieldWithLabel customWidth={Dimensions.FormInputLabelWidth}>
          <Label style={{ width: Dimensions.FormInputLabelWidth }}>{fieldDataProvider.getTitle('invoiceAmount')}</Label>
          <Field
            name="invoiceAmount"
            style={{ flexGrow: 1, width: '270px' }}
            fieldName={findFieldFromSchema('title', 'invoiceAmount', rdDiscountingSchema)}
            error={isErrorActive('invoiceAmount', formik.errors, formik.touched)}
            formatAsString={(v: number) => Numeral(v).format('0,0.00')}
            toValue={(s: stringOrNull) => toDecimalPlaces(s)}
            setFieldValue={formik.setFieldValue}
            setFieldTouched={formik.setFieldTouched}
            initialValue={formik.values.invoiceAmount}
            defaultValue={0}
            component={FormattedInputController}
            data-test-id="invoiceAmount"
          />
          <Field
            name="currency"
            style={{ margin: '0', marginLeft: '5px', width: '80px' }}
            error={isErrorActive('currency', formik.errors, formik.touched)}
            selection={true}
            disabled={props.currencyDisabled}
            search={true}
            compact={true}
            defaultValue={formik.values.currency}
            options={enumToDropdownOptions(Currency, true)}
            component={DropdownController}
            data-test-id="currency"
          />
        </FieldWithLabel>
      )}
    </FieldDataContext.Consumer>
  )
}
