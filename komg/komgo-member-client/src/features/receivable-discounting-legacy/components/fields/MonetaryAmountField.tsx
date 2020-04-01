import * as React from 'react'
import { FieldAttributes, FormikContext, Field } from 'formik'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import {
  FormattedInputController,
  enumToDropdownOptions,
  DropdownController
} from '../../../letter-of-credit-legacy/components'
import { Currency } from '@komgo/types'
import { stringOrNull } from '../../../../utils/types'
import { toDecimalPlaces } from '../../../../utils/field-formatters'
import Numeral from 'numeral'

export interface IMonetaryAmountProps<T = any> {
  formik: FormikContext<T>
  name: string
  schema: any
  defaultCurrency?: Currency
  currencyDisabled?: boolean
}

const monetaryAmountInitialValue = (values: any, fieldName: string) => {
  return values[fieldName] ? values[fieldName].amount : ''
}

export const MonetaryAmountField: React.FC<IMonetaryAmountProps & FieldAttributes<any>> = ({
  formik,
  name,
  defaultCurrency,
  schema,
  currencyDisabled
}: IMonetaryAmountProps) => {
  return (
    <>
      <Field
        name={`${name}.amount`}
        fieldName={findFieldFromSchema('title', `${name}.amount`, schema)}
        style={{ width: 'calc(50% - 85px)' }}
        error={isErrorActive(`${name}.amount`, formik.errors, formik.touched)}
        formatAsString={(v: number) => Numeral(v).format('0,0.00')}
        toValue={(s: stringOrNull) => toDecimalPlaces(s)}
        setFieldValue={formik.setFieldValue}
        setFieldTouched={formik.setFieldTouched}
        initialValue={monetaryAmountInitialValue(formik.values, name)}
        defaultValue={0}
        component={FormattedInputController}
        data-test-id={`${name}.amount`}
      />
      <Field
        name={`${name}.currency`}
        style={{ margin: '0', marginLeft: '5px', width: '80px' }}
        error={isErrorActive(`${name}.currency`, formik.errors, formik.touched)}
        selection={true}
        search={true}
        compact={true}
        defaultValue={defaultCurrency || Currency.USD}
        options={enumToDropdownOptions(Currency, true)}
        component={DropdownController}
        disabled={currencyDisabled}
        data-test-id={`${name}.currency`}
      />
    </>
  )
}
