import * as React from 'react'
import { Formik, FormikProps, Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import FormikEffect from '../formik-effect'
import styled from 'styled-components'
import moment from 'moment'
import { Form, Dropdown, DropdownProps as SemanticDropdownProps, Card, Input } from 'semantic-ui-react'
import { DuplicateClause, IStandbyLetterOfCreditBase, CompanyRoles, Currency, Fee, ITrade, ICargo } from '@komgo/types'
import {
  DropdownOptions,
  enumToDropdownOptions,
  enumToRadioOptions,
  FormattedInputController,
  GridDropdownController,
  GridTextController
} from '../../../letter-of-credit-legacy/components/InputControllers'

import { FieldStyling } from '../../../trades/components/trade-form-fields/TradeData'
import { SimpleRadioController } from '../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import { Counterparty } from '../../../counterparties/store/types'
import { IMember } from '../../../members/store/types'
import Numeral from 'numeral'
import { toDecimalPlaces } from '../../../../utils/field-formatters'
import { stringOrNull } from '../../../../utils/types'
import { sentenceCaseWithAcronyms } from '../../../../utils/casings'
import { scrollTo } from '../../utils/scrollTo'
import { validateStandbyLetterOfCredit } from './validateStandbyLetterOfCredit'
import { rose } from '../../../../styles/colors'
import { isInPast } from '../../../../utils/date'
import { hasError } from '../../../../utils/formikFieldHasError'
import { Warning } from '../../../../components/warning'

// TODO fix the actual AVAILABLE_WITH_OPTIONS import { AVAILABLE_WITH_OPTIONS } from '../../../letter-of-credit-legacy/constants'
const AVAILABLE_WITH_OPTIONS = {
  ADVISING_BANK: CompanyRoles.AdvisingBank,
  ISSUING_BANK: CompanyRoles.IssuingBank
}

const BENEFICIARY_BANK_ROLE_OPTIONS = {
  ADVISING_BANK: CompanyRoles.AdvisingBank,
  ISSUING_BANK: CompanyRoles.IssuingBank
  // CONFIRMING_BANK: CompanyRoles.confirmingBank,
}

const ErrorText = styled.div`
  font-size: small;
  color: ${rose};
  margin-top: -1em;
  padding-top: 3px;
  min-height: 21px;
  margin-bottom: 9px;
`

interface FormErrorProps {
  errors: FormikErrors<IStandbyLetterOfCreditBase>
  touched: FormikTouched<IStandbyLetterOfCreditBase>
  field: keyof IStandbyLetterOfCreditBase
}

const FieldError: React.FC<FormErrorProps> = ({ errors, touched, field, children }) => (
  <ErrorText data-test-id={`${field}-error`}>{hasError(field, errors, touched) ? children : ''}</ErrorText>
)

const CurrencyField: React.FC = (props: any) => {
  return (
    <Field
      name="currency"
      component={({ field, form }: FieldProps) => {
        const onChange = (_: React.SyntheticEvent, { name, value }: SemanticDropdownProps) => {
          form.setFieldValue(name, value)
        }

        const onBlur = (_: React.SyntheticEvent, { name, value }: SemanticDropdownProps) => {
          form.setFieldValue(name, value)
          form.setFieldTouched(name)
        }
        return (
          <Dropdown
            {...field}
            className="label"
            style={{
              border: form.errors.amount ? '1px solid rgb(227, 85, 101)' : '1px solid rgb(226, 226, 226)'
            }}
            onChange={onChange}
            onBlur={onBlur}
            options={enumToDropdownOptions(Currency)}
          />
        )
      }}
    />
  )
}

export const fieldsWithValidations: Array<Partial<keyof IStandbyLetterOfCreditBase>> = [
  'contractReference',
  'contractDate',
  'issuingBankId',
  'beneficiaryBankId',
  'amount',
  'expiryDate',
  'feesPayableBy',
  'duplicateClause',
  'overrideStandardTemplate'
]

export interface CreateFormProps {
  initialValues: IStandbyLetterOfCreditBase
  issuingBanks: Counterparty[]
  beneficiaryBanks: IMember[]
  onSubmit: (values: IStandbyLetterOfCreditBase) => void
  onChange: (values: IStandbyLetterOfCreditBase) => void
}

export const CreateForm: React.FC<CreateFormProps> = ({
  initialValues,
  issuingBanks,
  beneficiaryBanks,
  onSubmit,
  onChange
}: CreateFormProps) => {
  const toDropDownOption = (member): DropdownOptions => ({
    value: member.staticId,
    text: member.x500Name.CN,
    content: member.x500Name.CN
  })

  // TODO just a prototype to check we pass the values
  const OPTIONS = Object.entries(BENEFICIARY_BANK_ROLE_OPTIONS).map(([label, value]) => {
    return {
      label: sentenceCaseWithAcronyms(label),
      value
    }
  })

  const handleFocus = selector => {
    scrollTo(selector)
  }

  return (
    <Formik
      onSubmit={(values, actions) => {
        actions.setSubmitting(false)
        onSubmit(values)
      }}
      initialValues={initialValues}
      validate={validateStandbyLetterOfCredit}
      render={({ values, handleSubmit, errors, touched }: FormikProps<IStandbyLetterOfCreditBase>) => {
        return (
          <Form onSubmit={handleSubmit} id="create-standby-letter-of-credit">
            <FormikEffect
              onChange={values => {
                return onChange && onChange(values as IStandbyLetterOfCreditBase)
              }}
            />

            <Warning visible={fieldsWithValidations.map(f => hasError(f, errors, touched)).includes(true)}>
              Please complete all required fields
            </Warning>

            <Field
              name="contractReference"
              id="field_contractReference"
              fieldName="Contract reference"
              onFocus={() => handleFocus('#preview_contractReference')}
              tabIndex="1"
              type="text"
              inline={false}
              customStyle={{ width: '100%' }}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={hasError('contractReference', errors, touched)}
            />
            <FieldError touched={touched} errors={errors} field="contractReference">
              Please enter a valid contract reference
            </FieldError>

            <Field
              name="contractDate"
              id="field_contractDate"
              onFocus={() => handleFocus('#preview_contractDate')}
              fieldName="Contract date"
              tabIndex="2"
              type="date"
              inline={false}
              customStyle={{ width: '100%' }}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={hasError('contractDate', errors, touched)}
            />
            <FieldError touched={touched} errors={errors} field="contractDate">
              Please choose a valid contract date
            </FieldError>

            <Field
              name="issuingBankId"
              onFocus={() => handleFocus('#preview_issuingBankId')}
              fieldName="Issuing bank"
              tabIndex="3"
              selection={true}
              search={true}
              options={issuingBanks.map(toDropDownOption)}
              customStyle={{ width: '100%' }}
              inline={false}
              component={GridDropdownController}
              tooltip={false}
              error={hasError('issuingBankId', errors, touched)}
            />
            <FieldError touched={touched} errors={errors} field="issuingBankId">
              Please choose a valid issuing bank
            </FieldError>

            <Field
              name="beneficiaryBankId"
              onFocus={() => handleFocus('#preview_beneficiaryBankId')}
              tabIndex="4"
              disabled={true}
              fieldName="Beneficiary bank"
              selection={true}
              search={true}
              placeholder="No Advising Bank"
              options={[{ text: 'No Advising Bank', value: undefined }, ...beneficiaryBanks.map(toDropDownOption)]}
              customStyle={{ width: '100%' }}
              inline={false}
              component={GridDropdownController}
              tooltip={false}
            />
            <FieldError touched={touched} errors={errors} field="beneficiaryBankId">
              Please choose a valid beneficiary bank
            </FieldError>

            {values.beneficiaryBankId && (
              <Field
                name="availableWith"
                fieldName="Available with"
                tabIndex="5"
                selection={true}
                search={true}
                placeholder="No Advising Bank"
                options={enumToDropdownOptions(AVAILABLE_WITH_OPTIONS)}
                customStyle={{ width: '100%' }}
                inline={false}
                component={GridDropdownController}
                tooltip={false}
              />
            )}

            {values.beneficiaryBankId && (
              <Field
                name="beneficiaryBankRole"
                fieldName="Beneficiary bank role"
                tabIndex="6"
                options={OPTIONS}
                component={SimpleRadioController}
              />
            )}

            <Form.Field>
              <label>Opening amount</label>
              <Field
                name="amount"
                id="field_amount"
                onFocus={() => handleFocus('#preview_amount')}
                tabIndex="7"
                type="text"
                label={CurrencyField}
                labelPosition="right"
                formatAsString={(v: number) => Numeral(v).format('0,0.00')}
                toValue={(s: stringOrNull) => toDecimalPlaces(s)}
                component={FormattedInputController}
                error={hasError('amount', errors, touched)}
              />
            </Form.Field>
            <FieldError touched={touched} errors={errors} field="amount">
              Please enter a valid opening amount
            </FieldError>

            <Field
              name="expiryDate"
              id="field_expiryDate"
              onFocus={() => handleFocus('#preview_expiryDate')}
              fieldName="Expiry date"
              tabIndex="8"
              type="date"
              inline={false}
              min={moment(Date.now()).format('YYYY-MM-DD')}
              customStyle={{ width: '100%' }}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={hasError('expiryDate', errors, touched)}
              validate={isInPast}
            />
            <FieldError touched={touched} errors={errors} field="expiryDate">
              Please choose a valid expiry date
            </FieldError>

            <Field
              name="feesPayableBy"
              onFocus={() => handleFocus('#preview_feesPayableBy')}
              tabIndex="9"
              fieldName="Fees payable by"
              options={enumToRadioOptions(Fee).filter(option => option.value !== Fee.Split)} // todo remove split
              component={SimpleRadioController}
            />
            <FieldError touched={touched} errors={errors} field="feesPayableBy">
              Please choose a valid option
            </FieldError>

            <Field
              name="duplicateClause"
              onFocus={() => handleFocus('#preview_duplicateClause')}
              tabIndex="10"
              fieldName="Duplicate clause"
              options={enumToRadioOptions(DuplicateClause)}
              component={SimpleRadioController}
            />
            <FieldError touched={touched} errors={errors} field="duplicateClause">
              Please choose a valid option
            </FieldError>

            <Field
              name="overrideStandardTemplate"
              id="field_overrideStandardTemplate"
              onFocus={() => handleFocus('#preview_overrideStandardTemplate')}
              tabIndex="11"
              fieldName="Override standard template"
              type="textarea"
              customStyle={{ width: '100%', height: '300px' }}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={hasError('overrideStandardTemplate', errors, touched)}
            />
            <FieldError touched={touched} errors={errors} field="overrideStandardTemplate">
              Please enter a valid override for the standard template
            </FieldError>

            <Field
              name="additionalInformation"
              fieldName="Additional information"
              tabIndex="12"
              type="textarea"
              customStyle={{ width: '100%' }}
              fieldStyle={FieldStyling}
              component={GridTextController}
            />
            <p>
              Additional information will be shared with all participants of the SBLC. It will not be included within
              the SBLC itself
            </p>
          </Form>
        )
      }}
    />
  )
}
