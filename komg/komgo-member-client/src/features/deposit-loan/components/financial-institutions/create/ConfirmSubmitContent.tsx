import * as React from 'react'

import { IDepositLoanForm, IExtendRequestDepositLoan } from '../../../store/types'
import styled from 'styled-components'

interface IProps {
  depositLoan: IDepositLoanForm
  isEdit: boolean
  requests?: IExtendRequestDepositLoan[]
}

const ConfirmSubmitContent: React.FC<IProps> = (props: IProps) => {
  const { depositLoan, isEdit, requests } = props
  const { sharedWith } = depositLoan

  const withoutCounterparties = `Are you sure you want to add this currency and tenor to your list of currency and tenors?`
  const withCounterparties = `Are you sure you want to add this currency and tenor and share the selected information with the counterparties that have been added in "visibility to counterparties" ?`

  const editWithoutCounterparties = `Are you sure you want to edit this currency and tenor?`
  const editWithCounterparties = `Are you sure you want to edit this currency and tenor? All counterparties for whom you have modified information to which they have visibility will be notified. `

  const rejectedRequests = requests
    ? requests.filter(
        request => !depositLoan.sharedWith.find(shared => shared.sharedWithStaticId === request.companyStaticId)
      )
    : []

  const getDecliningText = () => {
    if (rejectedRequests.length) {
      return (
        <React.Fragment>
          <p data-test-id="declining-text">
            Counterparties for whom you have decided to disclose new information will be notified.
            <br />
            Couonterparties who have requested information and for whom you have decided not to diclose information will
            notified that their request is rejected. The counterparties concerned are:
          </p>
          {getListOfRejectedSellers()}
        </React.Fragment>
      )
    }
    return null
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

  if (isEdit) {
    return (
      <React.Fragment>
        <p>{sharedWith.length ? editWithCounterparties : editWithoutCounterparties}</p>
        {getDecliningText()}
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <p>{sharedWith.length ? withCounterparties : withoutCounterparties}</p>
      {getDecliningText()}
    </React.Fragment>
  )
}

const SellerList = styled.ul`
  font-weight: bold;
  padding-left: 15px;
`

export default ConfirmSubmitContent
