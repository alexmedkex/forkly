import { MemberType, ICompanyRequest } from '@komgo/types'
import { Checkbox, Form, CheckboxProps } from 'semantic-ui-react'
import * as React from 'react'
import styled from 'styled-components'
import { Field, FormikErrors, FormikTouched } from 'formik'
import { RadioController, enumToRadioOptions } from '../../letter-of-credit-legacy/components'
import validateRequiredField from '../../../utils/validateRequiredField'

const columnStyle = {
  display: 'none'
}
const fieldStyle = {
  display: 'inline-flex',
  textTransform: 'uppercase',
  marginLeft: 20,
  marginBottom: 0
}
const wrapperFieldsStyle = {
  display: 'flex'
}
const radioStylingValues = {
  columnStyle,
  fieldStyle,
  wrapperFieldsStyle
}

export interface IProps {
  isModification: boolean
  values: ICompanyRequest
  errors: FormikErrors<ICompanyRequest>
  touched: FormikTouched<ICompanyRequest>
  toggleCheckbox: (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => void
}

export const AdditionalInformation = (props: IProps) => {
  const { isModification, values, errors, touched, toggleCheckbox } = props
  return (
    <>
      <StyledSmallHeader>ADDITIONAL INFORMATION</StyledSmallHeader>
      <StyledFormField>
        <StyledCheckbox
          disabled={!isModification}
          checked={values.isMember}
          name="isMember"
          label="Is Member"
          onChange={toggleCheckbox}
        />
        {values.isMember && (
          <Field
            name="memberType"
            disabled={!isModification || !values.isMember}
            value={values.memberType}
            component={RadioController}
            className={errors.memberType && touched.memberType ? 'error' : ''}
            validate={validateRequiredField('Member Type')}
            options={enumToRadioOptions(MemberType).filter(option => !!option.value)}
            stylingValues={radioStylingValues}
          />
        )}
      </StyledFormField>
      <Form.Field>
        <StyledCheckbox
          disabled={!isModification}
          checked={values.isFinancialInstitution}
          name="isFinancialInstitution"
          label="Is Financial Institution"
          onChange={toggleCheckbox}
        />
      </Form.Field>
      <Form.Field>
        <StyledCheckbox
          disabled={!isModification}
          checked={values.hasSWIFTKey}
          name="hasSWIFTKey"
          label="Has SWIFT Key"
          onChange={toggleCheckbox}
        />
      </Form.Field>
    </>
  )
}

const StyledFormField = styled(Form.Field)`
  display: flex;
`
const StyledSmallHeader = styled.h4`
  background-color: #f2f5f8;
  margin-bottom: 1.5em;
  margin-top: 1.5em;
  padding: 0.5em;
`
const StyledCheckbox = styled(Checkbox)`
  margin-right: 10px;
`
