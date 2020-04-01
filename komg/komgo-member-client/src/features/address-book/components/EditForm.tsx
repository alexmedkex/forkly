import { MemberType, ICompanyRequest } from '@komgo/types'
import { Button, Form } from 'semantic-ui-react'
import { FormikProps } from 'formik'
import * as React from 'react'
import styled from 'styled-components'
import * as _ from 'lodash'
import { getErrors } from '../../../utils/getErrors'
import { MultiErrorMessage } from '../../../components/error-message'
import { CompanyInformation } from './CompanyInformation'
import { AdditionalInformation } from './AdditionalInformation'
import { FileSelection } from './FileSelection'
import { VaktRegistration } from './VaktRegistration'

interface IActionsProps {
  readonly dirty: boolean
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void
  isModification: boolean
  staticId?: string
  onEditClick: () => void
  onClose: () => void
}
interface EditFormProps extends FormikProps<ICompanyRequest>, IActionsProps {
  clearError: () => void
}

const StyledFooter = styled.div`
  margin-top: 1.5em;
  text-align: right;
`
const vakt = {
  staticId: '',
  mnid: '',
  messagingPublicKey: undefined
}

export const ActionButtons = (props: IActionsProps) => {
  const { onClose, isModification, onEditClick, dirty, handleSubmit, staticId } = props
  return (
    <StyledFooter>
      <Button type="button" onClick={onClose}>
        Close
      </Button>
      {!isModification && <Button onClick={onEditClick}>Edit</Button>}
      {isModification && (
        <Button disabled={!dirty} id="submit-company-form" type="submit" onClick={() => handleSubmit()} primary={true}>
          {staticId ? 'Update' : 'Add'} company
        </Button>
      )}
    </StyledFooter>
  )
}

export const EditForm = (props: EditFormProps) => {
  const {
    errors,
    touched,
    values,
    dirty,
    handleSubmit,
    isModification,
    staticId,
    onEditClick,
    onClose,
    clearError
  } = props
  const touchedErrors = getErrors(errors, touched)
  const toggleCheckbox = (e, { name, checked }) => {
    props.setFieldValue(name, !!checked)
    if (name === 'isMember') {
      const memberTypeValue = checked ? props.initialValues.memberType : MemberType.Empty
      props.setFieldValue('memberType', memberTypeValue)
    }
  }
  const resetVakt = () => {
    props.setValues({ ...values, vakt })
  }
  return (
    <Form>
      {!_.isEmpty(touchedErrors) && (
        <MultiErrorMessage title="Validation Errors" data-test-id="Validation Errors" messages={touchedErrors} />
      )}
      <CompanyInformation
        isModification={isModification}
        errors={errors}
        touched={touched}
        values={values}
        clearError={clearError}
      />
      {isModification && <FileSelection values={values} setFieldValue={props.setFieldValue} />}
      <AdditionalInformation
        isModification={isModification}
        values={values}
        errors={errors}
        touched={touched}
        toggleCheckbox={toggleCheckbox}
      />
      <VaktRegistration
        isModification={isModification}
        values={values}
        errors={errors}
        touched={touched}
        resetVakt={resetVakt}
      />
      <ActionButtons
        onClose={onClose}
        isModification={isModification}
        onEditClick={onEditClick}
        dirty={dirty}
        handleSubmit={handleSubmit}
        staticId={staticId}
      />
    </Form>
  )
}
