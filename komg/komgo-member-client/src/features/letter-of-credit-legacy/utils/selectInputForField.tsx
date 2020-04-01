import * as React from 'react'
import { IDiff, Currency } from '@komgo/types'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
import {
  Input,
  Radio,
  Dropdown,
  Checkbox,
  CheckboxProps,
  DropdownProps,
  TextAreaProps,
  TextArea
} from 'semantic-ui-react'
import { FormattedInputController, enumToDropdownOptions, enumToRadioOptions } from '../components'
import Numeral from 'numeral'
import { stringOrNull } from '../../../utils/types'
import {
  INVOICE_REQUIREMENT_OPTIONS,
  FEES_PAYABLE_BY_OPTIONS,
  BILL_OF_LADING_ENDORSEMENT_OPTIONS,
  AVAILABLE_WITH_OPTIONS,
  LOI_TEMPLATE_CHARACTER_LIMIT
} from '../constants'
import { toDecimalPlaces } from '../../../utils/field-formatters'

export const selectInputForField = (
  field: keyof ILetterOfCredit | string,
  fieldDiff: IDiff,
  onChange?: (value: ILetterOfCredit[keyof ILetterOfCredit]) => any
) => {
  const disabled = !onChange
  const value = disabled ? fieldDiff.oldValue : (fieldDiff.value as any)

  switch (field) {
    case 'amount':
      return (
        <FormattedInputController
          disabled={disabled}
          initialValue={value}
          style={{ flexGrow: 1 }}
          defaultValue={0}
          fieldName={field}
          formatAsString={(v: number) => Numeral(v).format('0,0.00')}
          toValue={(s: stringOrNull) => toDecimalPlaces(s)}
          onChange={value => onChange(value)}
        />
      )
    case 'transhipmentAllowed':
    case 'partialShipmentAllowed':
      return (
        <div>
          <Checkbox
            checked={!!value}
            disabled={disabled}
            onChange={(_: React.SyntheticEvent<any>, data: CheckboxProps) => onChange(data.checked)}
          />
        </div>
      )
    case 'LOI':
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TextArea
            value={value}
            disabled={disabled}
            onChange={(_: React.ChangeEvent<any>, field: TextAreaProps) => onChange(field.value as any)}
          />
          <p style={{ padding: '15px 5px' }}>
            Used {value ? value.length : 0} / {LOI_TEMPLATE_CHARACTER_LIMIT} character limit
          </p>
        </div>
      )

    default:
      return selectDropdownsAndRadios(field, fieldDiff, onChange)
  }
}

const selectDropdownsAndRadios = (
  field: keyof ILetterOfCredit | string,
  fieldDiff: IDiff,
  onChange?: (value: ILetterOfCredit[keyof ILetterOfCredit]) => any
) => {
  const disabled = !onChange
  const value = disabled ? fieldDiff.oldValue : (fieldDiff.value as any)

  switch (field) {
    case 'feesPayableBy':
      return toRadio(value, FEES_PAYABLE_BY_OPTIONS, onChange, disabled)
    case 'invoiceRequirement':
      return toRadio(value, INVOICE_REQUIREMENT_OPTIONS, onChange, disabled)
    case 'billOfLadingEndorsement':
      return toRadio(value, BILL_OF_LADING_ENDORSEMENT_OPTIONS, onChange, disabled)
    case 'availableWith':
      return toDropdown(value, AVAILABLE_WITH_OPTIONS, onChange, disabled)
    case 'currency':
      return toDropdown(value, Currency, onChange, disabled)
    default:
      return (
        <Input
          disabled={disabled}
          style={{ flexGrow: 1 }}
          value={disabled ? fieldDiff.oldValue : fieldDiff.value}
          type={field === 'expiryDate' ? 'date' : 'text'}
          onChange={(e: React.ChangeEvent<any>) => onChange(e.target.value)}
        />
      )
  }
}

const toRadio = (
  value: any,
  input: any,
  onChange: (value: ILetterOfCredit[keyof ILetterOfCredit]) => any,
  disabled: boolean
) => {
  const options = enumToRadioOptions(input)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {options.map((option, idx) => (
        <Radio
          key={idx}
          style={{ flexGrow: 1, padding: '5px' }}
          disabled={disabled}
          checked={value === option.value}
          label={option.label}
          onChange={(e: React.ChangeEvent<any>) => onChange(option.value)}
        />
      ))}
    </div>
  )
}

const toDropdown = (
  value: any,
  input: any,
  onChange: (value: ILetterOfCredit[keyof ILetterOfCredit]) => any,
  disabled: boolean
) => {
  const options = enumToDropdownOptions(input)

  return (
    <Dropdown
      style={{ width: '100%' }}
      selection={true}
      compact={true}
      disabled={disabled}
      options={options}
      value={value}
      onChange={(_: React.ChangeEvent<any>, field: DropdownProps) => onChange(field.value as any)}
    />
  )
}
