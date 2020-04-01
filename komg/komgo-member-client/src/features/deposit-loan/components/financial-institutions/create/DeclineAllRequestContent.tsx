import * as React from 'react'
import styled from 'styled-components'

import { IExtendRequestDepositLoan } from '../../../store/types'
import { capitalize } from '../../../../../utils/casings'

interface IProps {
  declinedRequests: IExtendRequestDepositLoan[]
}

const DeclineAllRequestContent: React.FC<IProps> = (props: IProps) => {
  const { declinedRequests } = props
  return (
    <React.Fragment>
      <p data-test-id="decline-all-requests-text">
        Are you sure you want to decline all requests on {declinedRequests[0].currencyAndTenor}? This will notify the
        following counterparties of the decline:
      </p>
      <SellerList data-test-id="decline-all-list-of-companies">
        {declinedRequests.map(request => (
          <li data-test-id="declined-company" key={request.companyStaticId}>
            {request.companyName}
          </li>
        ))}
      </SellerList>
    </React.Fragment>
  )
}

const SellerList = styled.ul`
  font-weight: bold;
  padding-left: 15px;
`

export default DeclineAllRequestContent
