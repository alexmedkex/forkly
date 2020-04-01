import * as React from 'react'
import { Formik, FormikProps, Field, FieldProps, FormikErrors, FormikTouched, FormikValues } from 'formik'
import styled from 'styled-components'
import moment from 'moment'
import { Form, Dropdown, DropdownProps as SemanticDropdownProps, Button, Input } from 'semantic-ui-react'
import { Currency, fieldIsPresent, DATA_LETTER_OF_CREDIT_BASE_SCHEMA, IDataLetterOfCreditBase } from '@komgo/types'
import { rose, SPACES } from '@komgo/ui-components'
import {
  enumToDropdownOptions,
  GridTextController,
  FormattedInputController,
  TextController,
  enumToRadioOptions,
  TextAreaController
} from '../../letter-of-credit-legacy/components'
import { FieldStyling } from '../../trades/components/trade-form-fields/TradeData'
import { stringOrNull } from '../../../utils/types'
import { toDecimalPlaces } from '../../../utils/field-formatters'
import Numeral from 'numeral'
import { isInPast } from '../../../utils/date'
import FormikEffect from '../../standby-letter-of-credit-legacy/components/formik-effect'
import Ajv from 'ajv'
import { toFormikErrors } from '../../../utils/validator'
import { isErrorActive } from '../../trades/utils/isErrorActive'
import { SimpleRadioController } from '../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import { ReviewDecision } from '../constants'
import { FileUpload } from '../../../components/form'

export type IssueFormData = IDataLetterOfCreditBase & {
  reviewDecision: ReviewDecision | string
  comment?: string
  file?: any
}

export interface ReviewStandbyLetterOfCreditIssuingBankProps {
  initialValues: IssueFormData
  templateModel: any
  disableSubmit?: boolean
  beneficiaryIsMember: boolean
  applicantName: string
  onSubmit: (data: IssueFormData) => void
  onChange?: (data: IssueFormData) => void
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
  errors: FormikErrors<IssueFormData>
  touched: FormikTouched<IssueFormData>
  field: string
}

const FieldError: React.FC<FormErrorProps> = ({ errors, touched, field, children }) => (
  <ErrorText data-test-id={`${field}-error`}>{isErrorActive(field, errors, touched) ? children : ''}</ErrorText>
)

const VALIDATOR = new Ajv({ allErrors: true }).addSchema(DATA_LETTER_OF_CREDIT_BASE_SCHEMA)
const validate = (values: IssueFormData) => {
  let errors = {}

  const { reviewDecision, comment, file, ...dataToValidate } = values
  if (!VALIDATOR.validate('http://komgo.io/schema/data-letter-of-credit/1/base', dataToValidate)) {
    errors = toFormikErrors(VALIDATOR.errors)
  }
  return errors
}

const CurrencyField: React.FC = () => {
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

const FileUploadField = ({
  values,
  beneficiaryIsMember,
  setFieldValue
}: {
  values: FormikValues
  beneficiaryIsMember: boolean
  setFieldValue: any
}) => (
  <>
    {values.reviewDecision === ReviewDecision.IssueSBLC &&
      !beneficiaryIsMember && (
        <>
          <FileUpload
            file={values.file}
            name="issuanceDocument"
            accept=""
            label="SBLC issuance document"
            uploadFileText="Upload file"
            onChange={(_, file) => setFieldValue('file', file)}
            maxFileNameWidth="200px"
          />
          <div style={{ fontSize: 'small', paddingBottom: SPACES.DEFAULT }}>
            As the beneficiary is not a komgo member, issuance of the SBLC must be done off-platform. We recommend you
            insert a non duplication clause in the issuance document.
          </div>
        </>
      )}
  </>
)

const CommentField = ({ values, applicantName }: { values: FormikValues; applicantName: string }) => (
  <>
    {values.reviewDecision === ReviewDecision.RejectApplication && (
      <>
        <Form.Field>
          <label>Comment</label>
          <Field
            name="comment"
            id="field_comment"
            data-test-id="comment"
            tabIndex="7"
            type="text"
            component={TextAreaController}
          />
        </Form.Field>
        <div style={{ fontSize: 'small', paddingBottom: SPACES.DEFAULT, lineHeight: '0px' }}>
          Only visible to you and {applicantName}
        </div>
      </>
    )}
  </>
)

interface SendButtonProps {
  disableSubmit: boolean
  values: FormikValues
  beneficiaryIsMember: boolean
  handleSubmit: () => void
}
const SendButton: React.FC<SendButtonProps> = ({ disableSubmit, values, beneficiaryIsMember, handleSubmit }) => (
  <Button
    primary={true}
    disabled={
      disableSubmit ||
      !values.reviewDecision ||
      (values.reviewDecision === ReviewDecision.IssueSBLC && !beneficiaryIsMember && values.file === null)
    }
    style={{ width: '100%', marginTop: 'auto' }}
    type="submit"
    data-test-id="submit-letter-of-credit-review"
    onClick={() => handleSubmit()}
  >
    Send
  </Button>
)

export const ReviewStandbyLetterOfCreditIssuingBank: React.FC<ReviewStandbyLetterOfCreditIssuingBankProps> = ({
  initialValues,
  onSubmit,
  onChange,
  templateModel,
  disableSubmit = false,
  beneficiaryIsMember,
  applicantName
}: ReviewStandbyLetterOfCreditIssuingBankProps) => {
  const templateHasIssuingBankReference = fieldIsPresent(templateModel, 'issuingBankReference')
  const templateHasCurrencyAndOpeningAmount =
    fieldIsPresent(templateModel, 'amount') && fieldIsPresent(templateModel, 'currency')
  const templateHasExpiryDate = fieldIsPresent(templateModel, 'expiryDate')

  return (
    <Formik
      onSubmit={(values, actions) => {
        actions.setSubmitting(false)
        onSubmit(values)
      }}
      initialValues={initialValues}
      validate={validate}
      render={({ handleSubmit, errors, touched, isValid, values, setFieldValue }: FormikProps<IssueFormData>) => {
        return (
          <Form
            onSubmit={handleSubmit}
            id="create-standby-letter-of-credit"
            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
          >
            <FormikEffect
              onChange={(values: IssueFormData) => {
                return onChange && onChange(values)
              }}
            />

            <Form.Field>
              <label>Internal reference</label>
              <Field
                name="issuingBankReference"
                id="field_issuingBankReference"
                data-test-id="issuingBankReference"
                tabIndex="3"
                type="text"
                component={TextController}
                error={isErrorActive('issuingBankReference', errors, touched) || !templateHasIssuingBankReference}
              />
            </Form.Field>
            <div style={{ fontSize: 'small', lineHeight: '0px', paddingBottom: SPACES.DEFAULT }}>
              The reference from your internal system
            </div>
            {!templateHasIssuingBankReference ? (
              <ErrorText>Field missing in template</ErrorText>
            ) : (
              <FieldError touched={touched} errors={errors} field="issuingBankReference">
                Please enter a valid issuing bank reference
              </FieldError>
            )}

            <Form.Field>
              <label>Opening amount / Currency</label>
              <Field
                name="amount"
                id="field_amount"
                data-test-id="amount"
                tabIndex="4"
                type="text"
                label={CurrencyField}
                labelPosition="right"
                formatAsString={(v: number) => Numeral(v).format('0,0.00')}
                toValue={(s: stringOrNull) => toDecimalPlaces(s)}
                component={FormattedInputController}
                error={isErrorActive('amount', errors, touched) || !templateHasCurrencyAndOpeningAmount}
              />
            </Form.Field>
            {!templateHasCurrencyAndOpeningAmount ? (
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
                tabIndex="5"
                type="date"
                inline={false}
                min={moment(Date.now()).format('YYYY-MM-DD')}
                customStyle={{ width: '100%' }}
                fieldStyle={FieldStyling}
                component={GridTextController}
                error={isErrorActive('expiryDate', errors, touched) || !templateHasExpiryDate}
                validate={isInPast}
              />
            </Form.Field>
            {!templateHasExpiryDate ? (
              <ErrorText>Field missing in template</ErrorText>
            ) : (
              <FieldError touched={touched} errors={errors} field="expiryDate">
                Please choose a valid expiry date
              </FieldError>
            )}

            <Form.Field>
              <label>Application decision</label>
              <Field
                name="reviewDecision"
                options={enumToRadioOptions(ReviewDecision, null, null, {
                  [ReviewDecision.IssueSBLC]: 'Issue SBLC',
                  [ReviewDecision.RejectApplication]: 'Reject application'
                })}
                component={SimpleRadioController}
                tabIndex="6"
              />
            </Form.Field>

            <FileUploadField values={values} beneficiaryIsMember={beneficiaryIsMember} setFieldValue={setFieldValue} />

            {/* <CommentField values={values} applicantName={applicantName} /> */}

            <SendButton
              disableSubmit={!isValid || disableSubmit}
              values={values}
              beneficiaryIsMember={beneficiaryIsMember}
              handleSubmit={handleSubmit}
            />
          </Form>
        )
      }}
    />
  )
}
