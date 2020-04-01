import * as React from 'react'
import { Confirm, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { LoadingTransition, ErrorMessage } from '../../../../../components'
import { ServerError } from '../../../../../store/common/types'
import { ICreateOrEditCreditLineForm, IExtendedCreditLineRequest, CreditLineType } from '../../../store/types'
import { dictionary } from '../../../dictionary'
import { capitalize } from '../../../../../utils/casings'

interface IProps {
  isEdit: boolean
  open: boolean
  isSubmitting: boolean
  submittingError: ServerError[]
  values: ICreateOrEditCreditLineForm
  requests?: IExtendedCreditLineRequest[]
  feature: CreditLineType
  handleCancel(): void
  handleConfirm(): void
}

const SubmitConfirm = (props: IProps) => {
  const { isEdit, open, isSubmitting, handleCancel, handleConfirm, submittingError, values, requests, feature } = props
  const [error] = submittingError

  const { createOrEdit } = dictionary[feature].financialInstitution

  const rejectedRequests = requests
    ? requests.filter(
        request =>
          !values.sharedCreditLines.find(creditLine => creditLine.sharedWithStaticId === request.companyStaticId)
      )
    : []

  const getEditTextDependsOnSharedCreditLines = () => {
    return values.sharedCreditLines.length
      ? `Are you sure you want to edit this ${createOrEdit.counterpartyRole}? All ${
          createOrEdit.companyRolePlural
        } for whom you have modified information to which they have visibility will be notified.${
          props.requests && props.requests.length
            ? ` If you have not changed the information within an update request, the ${
                dictionary[feature].financialInstitution.createOrEdit.companyRole
              } will be notified that information has been updated.`
            : ''
        }`
      : `Are you sure you want to edit this ${createOrEdit.counterpartyRole}?`
  }

  const getCreateTextDependsOnSharedCreditLines = () => {
    return values.sharedCreditLines.length
      ? `Are you sure you want to add this ${
          createOrEdit.counterpartyRole
        } and share the selected information with the ${
          createOrEdit.companyRolePlural
        } that have been added in "visibility to ${
          dictionary[feature].financialInstitution.createOrEdit.companyRole
        }" section?`
      : `Are you sure you want to add this ${createOrEdit.counterpartyRole} to your list?`
  }

  const getListOfRejectedSellers = () => {
    if (rejectedRequests.length) {
      return (
        <SellerList data-test-id="declined-companies">
          {rejectedRequests.map(request => (
            <li data-test-id="declined-company" key={request.companyStaticId}>
              {request.companyName}
            </li>
          ))}
        </SellerList>
      )
    }
    return null
  }

  const getDecliningText = () => {
    if (rejectedRequests.length) {
      return (
        <React.Fragment>
          <p data-test-id="declining-text">
            {capitalize(createOrEdit.companyRolePlural)} who have requested information and for whom you have decided
            not to diclose information will notified that their request is rejected. The{' '}
            {createOrEdit.companyRolePlural} concerned are:
          </p>
          {getListOfRejectedSellers()}
        </React.Fragment>
      )
    }
    return null
  }

  const getEditText = () => {
    return (
      <React.Fragment>
        <p data-test-id="confirm-text">{getEditTextDependsOnSharedCreditLines()}</p>
        {getDecliningText()}
      </React.Fragment>
    )
  }

  const getCreateText = () => {
    return (
      <React.Fragment>
        <p data-test-id="confirm-text">{getCreateTextDependsOnSharedCreditLines()}</p>
        {getDecliningText()}
      </React.Fragment>
    )
  }

  const getContent = () => {
    if (isSubmitting) {
      return <LoadingTransition title="Submitting" marginTop="15px" />
    } else if (error) {
      return <ErrorMessage title="Error" error={error.message} />
    } else if (isEdit) {
      return getEditText()
    }
    return getCreateText()
  }

  return (
    <Confirm
      open={open}
      header={isEdit ? 'Update information' : `Add ${createOrEdit.counterpartyRole}`}
      content={<div className="content">{getContent()}</div>}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      cancelButton={
        <Button disabled={isSubmitting} data-test-id="submit-modal-cancel">
          Cancel
        </Button>
      }
      confirmButton={
        <Button disabled={isSubmitting} data-test-id="submit-modal-confirm">
          Confirm
        </Button>
      }
    />
  )
}

const SellerList = styled.ul`
  font-weight: bold;
  padding-left: 15px;
`

export default SubmitConfirm
