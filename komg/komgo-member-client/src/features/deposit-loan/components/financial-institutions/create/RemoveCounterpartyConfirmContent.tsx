import * as React from 'react'
import { getCompanyName } from '../../../../counterparties/utils/selectors'
import { findCounterpartyByStatic } from '../../../../letter-of-credit-legacy/utils/selectors'
import { Counterparty } from '../../../../counterparties/store/types'
import { ISharedDepositLoanForm } from '../../../store/types'

interface IProps {
  counterparties: Counterparty[]
  sharedWithData: ISharedDepositLoanForm
}

const RemoveCounterpartyConfirmContent: React.FC<IProps> = (props: IProps) => (
  <div>
    Are you sure you want to remove{' '}
    <b>{getCompanyName(findCounterpartyByStatic(props.counterparties, props.sharedWithData.sharedWithStaticId))}</b>{' '}
    from your list?
    {props.sharedWithData.staticId
      ? " This counterparty will no longer have access to this currency an tenor's information."
      : null}
  </div>
)

export default RemoveCounterpartyConfirmContent
