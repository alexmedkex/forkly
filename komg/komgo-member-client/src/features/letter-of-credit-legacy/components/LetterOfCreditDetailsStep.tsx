import * as React from 'react'
import { Fragment } from 'react'
import { Divider, Grid, Input } from 'semantic-ui-react'
import {
  GridDropdownController,
  GridTextController,
  CheckboxController,
  enumToDropdownOptions,
  TextController,
  DropdownController,
  fieldColumnStyling,
  FormattedInputController,
  RadioController,
  enumToRadioOptions
} from './InputControllers'
import { Field, connect, FormikContext } from 'formik'
import {
  AVAILABLE_WITH_OPTIONS,
  AVAILABLE_BY_OPTIONS,
  LetterOfCreditValues,
  STEP,
  TEMPLATE_TYPE_OPTIONS,
  ADDITIONAL_COMMENTS_CHARACTER_LIMIT,
  documentsWhichOverrideLOI,
  LOI_TYPE_OPTIONS,
  LOI_TEMPLATE_CHARACTER_LIMIT
} from '../constants'
import { findLabel } from '../constants/fieldsByStep'
import styled from 'styled-components'
import Numeral from 'numeral'
import { stringOrNull } from '../../../utils/types'
import { CharacterLimitedTextArea } from './InputControllers/CharacterLimitedTextArea'
import { Heading } from './LetterOfCreditTypeStep'
import { CapitalizedHeader } from './CapitalizedHeader'
import { toDecimalPlaces } from '../../../utils/field-formatters'
import { hasError } from '../../../utils/formikFieldHasError'
import { Currency } from '@komgo/types'

const Label = styled.label`
  font-weight: bold;
`

interface LetterOfCreditDetailsStepOwnProps {
  disabled?: boolean
}

export interface LetterOfCreditDetailsStepProps {
  formik: FormikContext<LetterOfCreditValues>
}

const findLabelForPage = (label: keyof LetterOfCreditValues): string => findLabel(STEP.LC_DETAILS, label)

export const LetterOfCreditDetailsStep: React.SFC<
  LetterOfCreditDetailsStepProps & LetterOfCreditDetailsStepOwnProps
> = ({ disabled, formik: { initialValues, values, setFieldValue, setFieldTouched, errors, touched } }) => (
  <Fragment>
    <CapitalizedHeader content="LC details" block={true} />
    <Grid centered={true} columns={2}>
      <Grid.Row>
        <Grid.Column width={7} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label>{findLabelForPage('amount')}</Label>
          <span style={{ width: '50%', display: 'flex' }}>
            <Field
              name="currency"
              disabled={disabled}
              style={{ margin: '0' }}
              selection={true}
              search={true}
              compact={true}
              options={enumToDropdownOptions(Currency)}
              component={DropdownController}
            />
            <Field
              name="amount"
              disabled={disabled}
              style={{ flexGrow: 1 }}
              fieldName="amount"
              error={hasError('amount', errors, touched)}
              formatAsString={(v: number) => Numeral(v).format('0,0.00')}
              toValue={(s: stringOrNull) => toDecimalPlaces(s)}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              initialValue={values.amount}
              defaultValue={0}
              component={FormattedInputController}
            />
          </span>
        </Grid.Column>

        <Grid.Column width={7} />
      </Grid.Row>
      <Grid.Row />
      <Grid.Row>
        <Grid.Column width={7}>
          <Field
            name="expiryDate"
            disabled={disabled}
            fieldName={findLabelForPage('expiryDate')}
            error={hasError('expiryDate', errors, touched)}
            type="date"
            fieldStyle={fieldColumnStyling}
            component={GridTextController}
            value={values.expiryDate}
          />
        </Grid.Column>
        <Grid.Column width={7} />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={7}>
          <Field
            name="availableWith"
            disabled={
              disabled ||
              (values.beneficiaryBankId === undefined && values.templateType === TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET)
            }
            fieldName={findLabelForPage('availableWith')}
            fieldStyle={fieldColumnStyling}
            component={GridDropdownController}
            options={enumToDropdownOptions(AVAILABLE_WITH_OPTIONS)}
            onChange={(_: React.SyntheticEvent, field: any) => {
              const value = field.value
              setFieldValue('availableWith', value)
              if (values.beneficiaryBankId) {
                setFieldValue('expiryPlace', value)
              }
            }}
            value={values.availableWith}
          />
        </Grid.Column>
        <Grid.Column width={7} />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={7}>
          <Field
            name="expiryPlace"
            disabled={disabled || values.templateType === TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET}
            fieldName={findLabelForPage('expiryPlace')}
            error={errors.expiryPlace !== undefined}
            fieldStyle={fieldColumnStyling}
            component={GridDropdownController}
            options={enumToDropdownOptions(AVAILABLE_WITH_OPTIONS)}
            value={values.expiryPlace}
          />
        </Grid.Column>
        <Grid.Column width={7} />
      </Grid.Row>
      <Grid.Row />

      <Grid.Row>
        <Grid.Column width={7}>
          <Field
            name="availableBy"
            disabled={disabled || values.templateType === TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET}
            fieldName={findLabelForPage('availableBy')}
            component={GridDropdownController}
            fieldStyle={fieldColumnStyling}
            options={enumToDropdownOptions(AVAILABLE_BY_OPTIONS)}
          />
        </Grid.Column>
        <Grid.Column width={7} />
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <Grid.Column width={7}>
          <Field
            name="partialShipmentAllowed"
            disabled={disabled}
            component={CheckboxController}
            fieldName={findLabelForPage('partialShipmentAllowed')}
          />
        </Grid.Column>
        <Grid.Column width={7} />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={7}>
          <Field
            name="transhipmentAllowed"
            disabled={disabled}
            component={CheckboxController}
            fieldName={findLabelForPage('transhipmentAllowed')}
          />
        </Grid.Column>
        <Grid.Column width={7} />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={14}>
          Documents presented later than{' '}
          <Field
            name="documentPresentationDeadlineDays"
            disabled={disabled}
            type="number"
            error={errors.documentPresentationDeadlineDays !== undefined}
            component={TextController}
            style={{ width: '90px' }}
          />{' '}
          days
          <br />
          after the B/L date or deemed B/L or date of completion of pumpover but within the LC validity are acceptable.
        </Grid.Column>
      </Grid.Row>
    </Grid>
    {values.templateType === TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET && (
      <Fragment>
        <CapitalizedHeader content="Letter of indemnity" block={true} />
        <Grid centered={true} columns={2}>
          <Grid.Row>
            <Grid.Column width={7}>
              <Field
                name="LOIAllowed"
                disabled={true}
                component={CheckboxController}
                fieldName={findLabelForPage('LOIAllowed')}
              />
            </Grid.Column>
            <Grid.Column width={7} />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={7}>
              <Heading>LOI can be presented in lieu of:</Heading>
              <p />
              {documentsWhichOverrideLOI.map(({ name }, idx) => (
                <p key={idx} style={{ paddingLeft: '5px' }}>
                  - {name}
                </p>
              ))}
            </Grid.Column>
            <Grid.Column width={7} />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={7}>
              <Field
                disabled={disabled}
                name="LOIType"
                fieldName={findLabelForPage('LOIType')}
                component={RadioController}
                options={enumToRadioOptions(LOI_TYPE_OPTIONS)}
                customOnChange={() =>
                  setFieldValue('LOI', values.LOIType === LOI_TYPE_OPTIONS.FREE_TEXT ? initialValues.LOI : '')
                }
              />
            </Grid.Column>
            <Grid.Column width={7} />
          </Grid.Row>
        </Grid>
        <br />
        <Field
          name="LOI"
          disabled={values.LOIType === LOI_TYPE_OPTIONS.KOMGO_LOI || disabled}
          autoFocus={false}
          autoHeight={true}
          style={{ maxHeight: '410px', overflow: 'auto' }}
          component={CharacterLimitedTextArea}
          maxLength={LOI_TEMPLATE_CHARACTER_LIMIT}
          error={hasError('LOI', errors, touched)}
        />
      </Fragment>
    )}

    <CapitalizedHeader content={findLabelForPage('comments')} block={true} />
    <Field
      name="comments"
      disabled={disabled}
      autoFocus={false}
      autoHeight={true}
      style={{ maxHeight: '200px', overflow: 'auto' }}
      component={CharacterLimitedTextArea}
      maxLength={ADDITIONAL_COMMENTS_CHARACTER_LIMIT}
      error={hasError('comments', errors, touched)}
    />
  </Fragment>
)

export default connect<LetterOfCreditDetailsStepOwnProps, LetterOfCreditValues>(LetterOfCreditDetailsStep)
