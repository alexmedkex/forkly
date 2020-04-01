import * as React from 'react'
import { Fragment } from 'react'
import { compose } from 'redux'
import { Grid } from 'semantic-ui-react'
import { Field, connect, FormikContext } from 'formik'
import {
  GridTextController,
  GridDropdownController,
  CheckboxController,
  RadioController,
  fieldColumnStyling,
  enumToRadioOptions,
  DropdownOptions
} from './InputControllers'
import {
  BENEFICIARY_BANK_ROLE_OPTIONS,
  FEES_PAYABLE_BY_OPTIONS,
  LetterOfCreditValues,
  FEES_PAYABLE_BY_TOOLTIP,
  STEP
} from '../constants'
import {
  participantDetailsFromMember,
  selectBeneficiaryBankIdOptions,
  findMembersByStatic,
  selectIssuingBankIdOptions,
  selectBeneficiaryIdOptions
} from '../utils/selectors'
import { findLabel } from '../constants/fieldsByStep'
import { Counterparty } from '../../counterparties/store/types'
import { IMember } from '../../members/store/types'
import { truncate } from '../../../utils/casings'
import { CapitalizedHeader } from './CapitalizedHeader'
import { withLicenseCheck, WithLicenseCheckProps } from '../../../components/with-license-check'
import { hasError } from '../../../utils/formikFieldHasError'

interface ParticipantsStepOwnProps {
  disabled?: boolean
  counterparties?: Counterparty[]
  members: IMember[]
}

export type ParticipantStepProps = ParticipantsStepOwnProps & {
  formik: FormikContext<LetterOfCreditValues>
} & WithLicenseCheckProps
const TRUNCATE_OPTION = 25

const findLabelForPage = (label: keyof LetterOfCreditValues): string => findLabel(STEP.PARTICIPANTS, label)

export const ParticipantsStep: React.SFC<ParticipantStepProps> = ({
  formik: { values, initialValues, errors, setFieldValue, touched },
  disabled,
  counterparties,
  members,
  isLicenseEnabledForCompany
}) => {
  const displayBeneficiaryBankFields = !values.direct

  const { companyName: applicantCompanyName } = participantDetailsFromMember(
    findMembersByStatic(members, values.applicantId)
  )

  const { address: beneficiaryAddress, country: beneficiaryCountry } = participantDetailsFromMember(
    findMembersByStatic(members, values.beneficiaryId)
  )

  const { address: issuingBankAddress, country: issuingBankCountry } = participantDetailsFromMember(
    findMembersByStatic(members, values.issuingBankId)
  )

  const { address: beneficiaryBankAddress, country: beneficiaryBankCountry } = participantDetailsFromMember(
    findMembersByStatic(members, values.beneficiaryBankId)
  )

  const beneficiaryBankIdOptions = selectBeneficiaryBankIdOptions(members).filter(o => o.value !== values.issuingBankId)

  const issuingBankIdOptions = selectIssuingBankIdOptions(
    disabled ? members : counterparties || [],
    isLicenseEnabledForCompany
  ).filter(o => o.value !== values.beneficiaryBankId)

  const beneficiaryIdOptions = selectBeneficiaryIdOptions(members, values.applicantId)

  const truncateOptions = (options: DropdownOptions[], length: number) =>
    options.map(option => ({
      ...option,
      text: truncate(option.text, length)
    }))

  return (
    <Fragment>
      <CapitalizedHeader content="Applicant and Beneficiary" block={true} />
      <Grid centered={true} columns={2}>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="text"
              name="applicantCN"
              disabled={true}
              value={applicantCompanyName}
              fieldStyle={fieldColumnStyling}
              fieldName="Applicant name"
              component={GridTextController}
              configuration={{ tooltipValue: applicantCompanyName, maxLengthOfValue: 40 }}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            <Field
              name="beneficiaryId"
              fieldStyle={fieldColumnStyling}
              fieldName={findLabelForPage('beneficiaryId')}
              selection={true}
              search={true}
              error={hasError('beneficiaryId', errors, touched)}
              disabled={initialValues.beneficiaryId !== undefined || disabled}
              options={truncateOptions(beneficiaryIdOptions, TRUNCATE_OPTION)}
              component={GridDropdownController}
              tooltip={true}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="textarea"
              name="applicantAddress"
              fieldName={findLabelForPage('applicantAddress')}
              disabled={true}
              value={initialValues.applicantAddress}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            <Field
              type="textarea"
              name="beneficiaryAddress"
              fieldName={findLabelForPage('beneficiaryAddress')}
              disabled={true}
              value={beneficiaryAddress}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="text"
              name="applicantCountry"
              fieldName={findLabelForPage('applicantCountry')}
              disabled={true}
              value={initialValues.applicantCountry}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            <Field
              type="text"
              name="beneficiaryCountry"
              fieldName={findLabelForPage('beneficiaryCountry')}
              disabled={true}
              value={beneficiaryCountry}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="text"
              disabled={disabled}
              name="applicantContactPerson"
              fieldName={findLabelForPage('applicantContactPerson')}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
              value={values.applicantContactPerson}
              error={hasError('applicantContactPerson', errors, touched)}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            <Field
              type="text"
              disabled={disabled}
              name="beneficiaryContactPerson"
              fieldName={findLabelForPage('beneficiaryContactPerson')}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
              value={values.beneficiaryContactPerson}
              error={hasError('beneficiaryContactPerson', errors, touched)}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <CapitalizedHeader content="Banks" block={true} />
      <Grid centered={true} columns={2}>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              name="direct"
              disabled={disabled}
              component={CheckboxController}
              fieldName={findLabelForPage('direct')}
              customOnChange={() => setFieldValue('beneficiaryBankId', undefined)}
            />
          </Grid.Column>
          <Grid.Column width={7} />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              name="issuingBankId"
              disabled={disabled}
              fieldName={findLabelForPage('issuingBankId')}
              fieldStyle={fieldColumnStyling}
              selection={true}
              search={true}
              error={hasError('issuingBankId', errors, touched)}
              options={truncateOptions(issuingBankIdOptions, TRUNCATE_OPTION)}
              component={GridDropdownController}
              tooltip={true}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            {displayBeneficiaryBankFields && (
              <Field
                name="beneficiaryBankId"
                disabled={disabled}
                fieldName={findLabelForPage('beneficiaryBankId')}
                fieldStyle={fieldColumnStyling}
                selection={true}
                search={true}
                error={hasError('beneficiaryBankId', errors, touched)}
                options={truncateOptions(beneficiaryBankIdOptions, TRUNCATE_OPTION)}
                component={GridDropdownController}
                tooltip={true}
              />
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="textarea"
              name="issuingBankAddress"
              fieldName={findLabelForPage('issuingBankAddress')}
              disabled={true}
              value={issuingBankAddress}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            {displayBeneficiaryBankFields && (
              <Field
                type="textarea"
                name="beneficiaryBankAddress"
                fieldName={findLabelForPage('beneficiaryBankAddress')}
                disabled={true}
                value={beneficiaryBankAddress}
                fieldStyle={fieldColumnStyling}
                component={GridTextController}
              />
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="text"
              name="issuingBankCountry"
              fieldName={findLabelForPage('issuingBankCountry')}
              disabled={true}
              value={issuingBankCountry}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            {displayBeneficiaryBankFields && (
              <Field
                type="text"
                name="beneficiaryBankCountry"
                fieldName={findLabelForPage('beneficiaryBankCountry')}
                disabled={true}
                value={beneficiaryBankCountry}
                fieldStyle={fieldColumnStyling}
                component={GridTextController}
              />
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              type="text"
              disabled={disabled}
              name="issuingBankContactPerson"
              fieldName={findLabelForPage('issuingBankContactPerson')}
              fieldStyle={fieldColumnStyling}
              component={GridTextController}
              value={values.issuingBankContactPerson}
              error={hasError('issuingBankContactPerson', errors, touched)}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            {displayBeneficiaryBankFields && (
              <Field
                type="text"
                disabled={disabled}
                name="beneficiaryBankContactPerson"
                fieldName={findLabelForPage('beneficiaryBankContactPerson')}
                fieldStyle={fieldColumnStyling}
                component={GridTextController}
                value={values.beneficiaryBankContactPerson}
                error={hasError('beneficiaryBankContactPerson', errors, touched)}
              />
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={7}>
            <Field
              name="feesPayableBy"
              disabled={disabled}
              fieldName={findLabelForPage('feesPayableBy')}
              component={RadioController}
              options={enumToRadioOptions(FEES_PAYABLE_BY_OPTIONS, FEES_PAYABLE_BY_TOOLTIP)}
            />
          </Grid.Column>
          <Grid.Column width={7}>
            {displayBeneficiaryBankFields && (
              <Field
                name="beneficiaryBankRole"
                disabled={disabled}
                fieldName={findLabelForPage('beneficiaryBankRole')}
                component={RadioController}
                options={enumToRadioOptions(BENEFICIARY_BANK_ROLE_OPTIONS)}
              />
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Fragment>
  )
}

export default compose(withLicenseCheck, connect)(ParticipantsStep)
