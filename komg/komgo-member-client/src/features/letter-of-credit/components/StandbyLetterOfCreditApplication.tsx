import * as React from 'react'
import { Formik, FormikProps, Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import styled from 'styled-components'
import moment from 'moment'
import { Form, Dropdown, DropdownProps as SemanticDropdownProps, Button } from 'semantic-ui-react'
import { Currency, fieldIsPresent, DATA_LETTER_OF_CREDIT_BASE_SCHEMA, IDataLetterOfCreditBase } from '@komgo/types'
import { rose } from '@komgo/ui-components'
import {
  enumToDropdownOptions,
  DropdownOptions,
  GridTextController,
  GridDropdownController,
  FormattedInputController
} from '../../letter-of-credit-legacy/components'
import { Counterparty } from '../../counterparties/store/types'
import { IMember } from '../../members/store/types'
import { FieldStyling } from '../../trades/components/trade-form-fields/TradeData'
import { stringOrNull } from '../../../utils/types'
import { toDecimalPlaces } from '../../../utils/field-formatters'
import Numeral from 'numeral'
import { isInPast } from '../../../utils/date'
import FormikEffect from '../../standby-letter-of-credit-legacy/components/formik-effect'
import Ajv from 'ajv'
import { toFormikErrors } from '../../../utils/validator'
import { isErrorActive } from '../../trades/utils/isErrorActive'

export interface StandbyLetterOfCreditApplicationProps {
  initialValues: IDataLetterOfCreditBase
  issuingBanks: Counterparty[]
  beneficiaryBanks: IMember[]
  templateModel: any
  disableSubmit?: boolean
  onSubmit: (values: IDataLetterOfCreditBase) => void
  onChange?: (values: IDataLetterOfCreditBase) => void
}

const ErrorText = styled.div`
  font-size: small;
  color: ${rose};
  margin-top: -1em;
  padding-top: 3px;
  min-height: 22px;
  margin-bottom: 9px;
`

interface FormErrorProps {
  errors: FormikErrors<IDataLetterOfCreditBase>
  touched: FormikTouched<IDataLetterOfCreditBase>
  field: string
}

const FieldError: React.FC<FormErrorProps> = ({ errors, touched, field, children }) => (
  <ErrorText data-test-id={`${field}-error`}>{isErrorActive(field, errors, touched) ? children : ''}</ErrorText>
)

const VALIDATOR = new Ajv({ allErrors: true }).addSchema(DATA_LETTER_OF_CREDIT_BASE_SCHEMA)
const validate = (values: IDataLetterOfCreditBase) => {
  let errors = {}
  if (!VALIDATOR.validate('http://komgo.io/schema/data-letter-of-credit/1/base', values)) {
    errors = toFormikErrors(VALIDATOR.errors)
  }
  return errors
}

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
            data-test-id="currency"
            {...field}
            className="label"
            style={{
              border:
                form.errors.amount && form.touched.amount
                  ? '1px solid rgb(227, 85, 101)'
                  : '1px solid rgb(226, 226, 226)'
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

export const StandbyLetterOfCreditApplication: React.FC<StandbyLetterOfCreditApplicationProps> = ({
  initialValues,
  issuingBanks,
  beneficiaryBanks,
  onSubmit,
  onChange,
  templateModel,
  disableSubmit = false
}: StandbyLetterOfCreditApplicationProps) => {
  const toDropDownOption = (member, idx): DropdownOptions & { key: string } => ({
    value: member.staticId,
    text: member.x500Name.CN,
    content: member.x500Name.CN,
    key: idx
  })

  const issuingBankFieldInTemplate = fieldIsPresent(templateModel, 'issuingBank.x500Name.CN')
  const beneficiaryBankFieldInTemplate = fieldIsPresent(templateModel, 'beneficiaryBank.x500Name.CN')
  const currencyAndOpeningAmountFieldInTemplate =
    fieldIsPresent(templateModel, 'amount') && fieldIsPresent(templateModel, 'currency')
  const expiryDateFieldInTemplate = fieldIsPresent(templateModel, 'expiryDate')

  return (
    <Formik
      onSubmit={(values, actions) => {
        actions.setSubmitting(false)
        onSubmit(values)
      }}
      initialValues={initialValues}
      validate={validate}
      render={({ handleSubmit, errors, touched, isValid }: FormikProps<IDataLetterOfCreditBase>) => {
        return (
          <Form
            onSubmit={handleSubmit}
            id="create-standby-letter-of-credit"
            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
          >
            <FormikEffect
              onChange={(values: IDataLetterOfCreditBase) => {
                return onChange && onChange(values)
              }}
            />

            <Field
              name="issuingBank.staticId"
              fieldName="Issuing bank"
              data-test-id="issuingBankId"
              tabIndex="1"
              search={true}
              options={issuingBanks.map(toDropDownOption)}
              customStyle={{ width: '100%' }}
              inline={false}
              component={GridDropdownController}
              tooltip={false}
              error={isErrorActive('issuingBank.staticId', errors, touched) || !issuingBankFieldInTemplate}
            />
            {!issuingBankFieldInTemplate ? (
              <ErrorText>Field missing in template</ErrorText>
            ) : (
              <FieldError touched={touched} errors={errors} field="issuingBank.staticId">
                Please choose a valid issuing bank
              </FieldError>
            )}

            <Field
              name="beneficiaryBank.staticId"
              tabIndex="2"
              disabled={true}
              fieldName="Advising bank"
              placeholder="No advising bank"
              options={[
                { text: 'No advising bank', value: undefined, key: 'none' },
                ...beneficiaryBanks.map(toDropDownOption)
              ]}
              customStyle={{ width: '100%' }}
              inline={false}
              component={GridDropdownController}
              error={isErrorActive('beneficiaryBank.staticId', errors, touched) || !beneficiaryBankFieldInTemplate}
              tooltip={false}
            />
            {!beneficiaryBankFieldInTemplate ? (
              <ErrorText>Field missing in template</ErrorText>
            ) : (
              <FieldError touched={touched} errors={errors} field="beneficiaryBank.staticId">
                Please choose a valid beneficiary bank
              </FieldError>
            )}

            <Form.Field>
              <label>Opening amount / Currency</label>
              <Field
                name="amount"
                id="field_amount"
                data-test-id="amount"
                tabIndex="3"
                type="text"
                label={CurrencyField}
                labelPosition="right"
                formatAsString={(v: number) => Numeral(v).format('0,0.00')}
                toValue={(s: stringOrNull) => toDecimalPlaces(s)}
                component={FormattedInputController}
                error={isErrorActive('amount', errors, touched) || !currencyAndOpeningAmountFieldInTemplate}
              />
            </Form.Field>
            {!currencyAndOpeningAmountFieldInTemplate ? (
              <ErrorText>Field missing in template</ErrorText>
            ) : (
              <FieldError touched={touched} errors={errors} field="amount">
                Please enter a valid opening amount
              </FieldError>
            )}

            <Form.Field>
              <label>Expiry date</label>
              <Field
                name="expiryDate"
                id="field_expiryDate"
                data-test-id="expiryDate"
                tabIndex="4"
                type="date"
                inline={false}
                min={moment(Date.now()).format('YYYY-MM-DD')}
                customStyle={{ width: '100%' }}
                fieldStyle={FieldStyling}
                component={GridTextController}
                error={isErrorActive('expiryDate', errors, touched) || !expiryDateFieldInTemplate}
                validate={isInPast}
              />
            </Form.Field>
            {!expiryDateFieldInTemplate ? (
              <ErrorText>Field missing in template</ErrorText>
            ) : (
              <FieldError touched={touched} errors={errors} field="expiryDate">
                Please choose a valid expiry date
              </FieldError>
            )}

            <Button
              primary={true}
              disabled={!isValid || disableSubmit}
              style={{ width: '100%', marginTop: 'auto' }}
              type="submit"
              data-test-id="submit-letter-of-credit-application"
              onClick={() => handleSubmit()}
            >
              Submit Application
            </Button>
          </Form>
        )
      }}
    />
  )
}
