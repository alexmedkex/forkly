import * as React from 'react'
import { IDepositLoanResponse } from '@komgo/types'
import { getCurrencyWithTenor } from '../../../utils/selectors'

interface IProps {
  depoistLoan: IDepositLoanResponse
}

const RemoveConfirmContent: React.FC<IProps> = (props: IProps) => {
  const { depoistLoan } = props
  return (
    <div>
      Are you sure you want to remove <b>{getCurrencyWithTenor(depoistLoan)}</b> from your list?
      {depoistLoan.sharedWith.length
        ? ' This will remove the currency and tenor information from counterparties who have access to this information.'
        : null}
    </div>
  )
}

export default RemoveConfirmContent
