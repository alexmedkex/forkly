import * as React from 'react'
import { IDepositLoanForm } from '../../../store/types'

interface IProps {
  requested?: boolean
  values?: IDepositLoanForm
}

const SharedWithCounterpartiesTextInfo: React.FC<IProps> = (props: IProps) => {
  if (props.requested) {
    return (
      <React.Fragment>
        <h3>Requests to disclose information</h3>
        <p>
          The counterparties below requested information on {props.values ? props.values.currencyAndTenor : ''} to be
          shared with them. Choose what data to disclose to individual counterparts. This data will be disclosed
          bilaterally as non-binding and does not represent or warrant any commitment on your part.
        </p>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <h3>Visibility to counterparties</h3>
      <p>
        Information shared with your counterparties on a bilateral basis. This information is displayed to
        counterparties as non-binding and does not represent or warrant any commitment on your part.
      </p>
    </React.Fragment>
  )
}

export default SharedWithCounterpartiesTextInfo
