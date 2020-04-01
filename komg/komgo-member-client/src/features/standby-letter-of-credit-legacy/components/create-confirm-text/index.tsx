import * as React from 'react'
import { Counterparty } from '../../../counterparties/store/types'
import { IStandbyLetterOfCreditBase, ITrade } from '@komgo/types'

interface CreateConfirmProps {
  trade: ITrade
  issuingBanks: Counterparty[]
  letter: IStandbyLetterOfCreditBase
}

export const CreateConfirm: React.FC<CreateConfirmProps> = ({ trade, issuingBanks, letter }) => {
  const [issuingBank] = issuingBanks.filter(
    counterparty => counterparty.staticId === (letter || ({} as any)).issuingBankId
  )

  return (
    <p>
      You are about to submit an SBLC application for the financing of trade {trade ? trade.buyerEtrmId : '-'} to{' '}
      {((issuingBank || ({} as any)).x500Name || {}).CN}.
    </p>
  )
}
