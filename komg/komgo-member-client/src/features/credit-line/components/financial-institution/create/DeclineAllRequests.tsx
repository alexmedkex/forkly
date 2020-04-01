import * as React from 'react'
import { Confirm, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { IExtendedCreditLineRequest, CreditLineType } from '../../../store/types'
import { ServerError } from '../../../../../store/common/types'
import { LoadingTransition, ErrorMessage } from '../../../../../components'
import { dictionary } from '../../../dictionary'

interface IProps {
  requests: IExtendedCreditLineRequest[]
  open: boolean
  isSubmitting: boolean
  submittingErrors: ServerError[]
  feature: CreditLineType
  handleCancel(): void
  handleConfirm(): void
}

const DeclineAllRequests: React.FC<IProps> = (props: IProps) => {
  const { submittingErrors, isSubmitting, handleCancel, handleConfirm, open, requests, feature } = props
  const [error] = submittingErrors

  const { createOrEdit } = dictionary[feature].financialInstitution

  const getContent = () => {
    if (isSubmitting) {
      return <LoadingTransition title="Declining" marginTop="15px" />
    } else if (error) {
      return <ErrorMessage title="Error" error={error.message} />
    }
    return (
      <React.Fragment>
        <p data-test-id="decline-all-requests-text">
          Are you sure you want to decline all reqests on {createOrEdit.counterpartyRole}? This will notify the
          following {createOrEdit.companyRolePlural} of the decline:
        </p>
        <SellerList data-test-id="decline-all-list-of-companies">
          {requests.map(request => (
            <li data-test-id="declined-company" key={request.companyStaticId}>
              {request.companyName}
            </li>
          ))}
        </SellerList>
      </React.Fragment>
    )
  }

  return (
    <Confirm
      open={open}
      header="Decline all requests"
      content={<div className="content">{getContent()}</div>}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      cancelButton={
        <Button disabled={isSubmitting} data-test-id="decline-modal-cancel">
          Cancel
        </Button>
      }
      confirmButton={
        <Button disabled={isSubmitting} negative={true} data-test-id="decline-modal-confirm">
          Decline
        </Button>
      }
    />
  )
}

const SellerList = styled.ul`
  font-weight: bold;
  padding-left: 15px;
`

export default DeclineAllRequests
