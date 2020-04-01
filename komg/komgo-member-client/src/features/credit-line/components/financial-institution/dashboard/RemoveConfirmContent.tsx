import * as React from 'react'
import { IExtendedCreditLine, CreditLineType } from '../../../store/types'
import { dictionary } from '../../../dictionary'

interface IProps {
  creditLine: IExtendedCreditLine
  feature: CreditLineType
}

const RemoveConfirmContent: React.FC<IProps> = (props: IProps) => {
  const { creditLine, feature } = props
  return (
    <div>
      Are you sure you want to remove <b>{creditLine.counterpartyName}</b> from your list?
      {creditLine.sharedCreditLines && creditLine.sharedCreditLines.length
        ? ` ${dictionary[feature].financialInstitution.dashboard.removeConfirmSpecificText}`
        : null}
    </div>
  )
}

export default RemoveConfirmContent
