import { MemberType } from '@komgo/types'
import { Form } from 'semantic-ui-react'
import { Field } from 'formik'
import {
  DropdownOptions,
  GridDropdownController,
  GridTextController
} from '../../letter-of-credit-legacy/components/InputControllers'
import * as _ from 'lodash'
import * as React from 'react'
import * as i18nIsoCountries from 'i18n-iso-countries'
import styled from 'styled-components'
import validateEmail from '../../../utils/validateEmail'

const StyledSmallHeader = styled.h4`
  background-color: #f2f5f8;
  margin-bottom: 1.5em;
  margin-top: 1.5em;
  padding: 0.5em;
`
export const objectToDropdownOptions = (input: object): DropdownOptions[] =>
  Object.entries(input).map((entry: string[]) => ({
    value: entry[0],
    content: entry[1],
    text: entry[1]
  }))

const FieldWithLabel = props => {
  const { isModification, errors, touched, id, name, label, validate, onFocus } = props
  return (
    <Form.Field>
      <label htmlFor={id}>{label}</label>
      <Field
        disabled={!isModification}
        name={name}
        id={id}
        validate={validate}
        onFocus={onFocus}
        component={GridTextController}
        error={_.get(errors, name) && _.get(touched, name)}
      />
    </Form.Field>
  )
}

export const CompanyInformation = props => {
  const { isModification, errors, touched, values, clearError } = props
  return (
    <>
      <StyledSmallHeader>COMPANY INFORMATION</StyledSmallHeader>
      <FieldWithLabel
        isModification={isModification}
        errors={errors}
        touched={touched}
        id={'company-name'}
        name={'x500Name.O'}
        label={'Company name'}
      />

      <Form.Field>
        <label htmlFor="country-code">Country</label>
        <Field
          name="x500Name.C"
          disabled={!isModification}
          id="country-code"
          error={errors.x500Name && errors.x500Name.C && touched.x500Name && touched.x500Name.C}
          options={objectToDropdownOptions(i18nIsoCountries.getNames('en'))}
          component={GridDropdownController}
          value={values.x500Name.C}
        />
      </Form.Field>
      <FieldWithLabel
        isModification={isModification}
        errors={errors}
        touched={touched}
        id="city"
        name="x500Name.L"
        label="City"
      />
      <FieldWithLabel
        isModification={isModification}
        errors={errors}
        touched={touched}
        id="street"
        name="x500Name.STREET"
        label="Street"
      />
      <FieldWithLabel
        isModification={isModification}
        errors={errors}
        touched={touched}
        id="postal-code"
        name="x500Name.PC"
        label="Postal code"
      />
      {values.isMember &&
        values.memberType === MemberType.SMS && (
          <FieldWithLabel
            isModification={isModification}
            errors={errors}
            touched={touched}
            id="company-admin-email"
            name="companyAdminEmail"
            label="Company Admin Email"
            onFocus={clearError}
            validate={validateEmail('Company Admin Email')}
          />
        )}
    </>
  )
}
