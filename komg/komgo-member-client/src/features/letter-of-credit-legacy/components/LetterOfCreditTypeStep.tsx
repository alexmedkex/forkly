import * as React from 'react'
import { Fragment } from 'react'
import { Field, FormikContext, connect } from 'formik'
import { Grid, Header } from 'semantic-ui-react'
import { RadioController, enumToRadioOptions } from './InputControllers'
import {
  TYPE_OPTIONS,
  APPLICABLE_RULES_OPTIONS,
  TEMPLATE_TYPE_OPTIONS,
  LetterOfCreditValues,
  TEMPLATE_TYPE_TOOLTIP,
  STEP,
  requiredDocuments,
  FREE_TEXT_TEMPLATE_CHARACTER_LIMIT
} from '../constants'
import { findLabel } from '../constants/fieldsByStep'
import styled from 'styled-components'
import { CharacterLimitedTextArea } from './InputControllers/CharacterLimitedTextArea'
import DueDateFormFields from './timer/DueDateFormFields'
import { hasError } from '../../../utils/formikFieldHasError'
import { Grade } from '@komgo/types'

const Label = styled.label`
  font-weight: bold;
  min-width: 200px;
`

export const Heading = styled.label`
  font-weight: bold;
`
Heading.displayName = 'Heading'

const Document = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 80%;
  padding: 10px 0px 10px 0px;
`

const RequiredDocuments = styled.div`
  padding: 10px;
`

const RedItalic = styled.p`
  font-style: italic;
  color: red;
`

interface LetterOfCreditTypeStepOwnProps {
  disabled?: boolean
  grade?: string
}

export interface LetterOfCreditTypeStepProps {
  formik: FormikContext<LetterOfCreditValues>
}

const findLabelForPage = (label: keyof LetterOfCreditValues): string => findLabel(STEP.LC_TYPE, label)

const getTemplateTypes = (type?: TEMPLATE_TYPE_OPTIONS) => {
  const options = enumToRadioOptions(TEMPLATE_TYPE_OPTIONS, TEMPLATE_TYPE_TOOLTIP)

  return type ? options.filter(t => t.value === type) : options
}

export const LetterOfCreditTypeStep: React.FC<LetterOfCreditTypeStepProps & LetterOfCreditTypeStepOwnProps> = ({
  disabled,
  grade,
  formik: { initialValues, values, setFieldValue, errors, touched }
}) => (
  <Fragment>
    <Grid columns={2} centered={true}>
      <Grid.Column width={7}>
        <Field
          name="type"
          disabled={disabled}
          fieldName={findLabelForPage('type')}
          component={RadioController}
          options={enumToRadioOptions(TYPE_OPTIONS)}
        />
        <Field
          name="applicableRules"
          disabled={disabled}
          fieldName={findLabelForPage('applicableRules')}
          component={RadioController}
          options={enumToRadioOptions(APPLICABLE_RULES_OPTIONS)}
        />
        <Field
          name="templateType"
          disabled={disabled}
          fieldName={findLabelForPage('templateType')}
          component={RadioController}
          options={getTemplateTypes(!disabled ? TEMPLATE_TYPE_OPTIONS.FREE_TEXT : values.templateType)}
          customOnChange={() => {
            setFieldValue('freeTextLc', undefined)
            const freeTextAboutToBeChosen = values.templateType === TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET
            setFieldValue('LOI', freeTextAboutToBeChosen ? undefined : initialValues.LOI)
            setFieldValue('LOIType', freeTextAboutToBeChosen ? undefined : initialValues.LOIType)
            setFieldValue('LOIAllowed', freeTextAboutToBeChosen ? undefined : initialValues.LOIAllowed)
          }}
        />
      </Grid.Column>
      <Grid.Column width={7} />
    </Grid>

    {values.templateType === TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET ? (
      <Grid columns={2} centered={true}>
        <Grid.Column width={16}>
          <Header content="Required documents" block={true} />
          <RequiredDocuments>
            <p>
              The required documents for a komgo BFOET LC supersedes the required documents received from VAKT (if any)
              which are displayed on the 'Summary of Trade' screen.
            </p>
            <Heading>Documents for FOB delivery:</Heading>
            {requiredDocuments.map((document, idx) => (
              <Document key={idx}>
                <Label>{document.name}</Label>
                <div>{document.description}</div>
                {document.controller && (
                  <Field
                    disabled={disabled}
                    name={document.controller.fieldName}
                    component={RadioController}
                    options={enumToRadioOptions(
                      document.controller.options,
                      document.controller.tooltip,
                      document.controller.extraInfo
                    )}
                  />
                )}
              </Document>
            ))}
            {!grade ||
            (grade &&
              grade.toUpperCase() !== Grade.Brent &&
              grade.toUpperCase() !== Grade.Oseberg &&
              grade.toUpperCase() !== Grade.Troll) ? (
              <Fragment>
                <br />
                <Heading>Documents for FIP delivery:</Heading>
                <br />
                <br />
                <RedItalic>
                  *Required documents for FIP delivery (Forties and Ekofisk) are as per komgo BFOET LC template
                </RedItalic>
              </Fragment>
            ) : (
              <div />
            )}
          </RequiredDocuments>
        </Grid.Column>
      </Grid>
    ) : (
      <Fragment>
        <br />
        <Field
          name="freeTextLc"
          disabled={disabled}
          autoHeight={true}
          autoFocus={true}
          placeholder="Insert your LC here"
          style={{ maxHeight: '410px', overflow: 'auto' }}
          error={hasError('freeTextLc', errors, touched)}
          component={CharacterLimitedTextArea}
          maxLength={FREE_TEXT_TEMPLATE_CHARACTER_LIMIT}
        />
      </Fragment>
    )}
    {!disabled && <DueDateFormFields />}
  </Fragment>
)

export default connect<LetterOfCreditTypeStepOwnProps, LetterOfCreditValues>(LetterOfCreditTypeStep)
