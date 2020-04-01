import * as React from 'react'
import { LetterOfCreditStatus } from '@komgo/types'
import { sentenceCase } from '../../../utils/casings'

interface IProps {
  status: string
}

const STATUS_LABELS = {
  [LetterOfCreditStatus.Requested_Verification_Pending]: 'Pending',
  [LetterOfCreditStatus.Requested_Verification_Failed]: 'Failed',
  [LetterOfCreditStatus.RequestRejected]: 'Rejected',
  [LetterOfCreditStatus.RequestRejected_Pending]: 'Pending',
  [LetterOfCreditStatus.RequestRejected_Verification_Failed]: 'Failed',
  [LetterOfCreditStatus.Issued_Verification_Pending]: 'Pending',
  [LetterOfCreditStatus.Issued_Verification_Failed]: 'Failed'
}

export const Status: React.FC<IProps> = ({ status, ...rest }) => {
  const label = STATUS_LABELS[status] || status
  return <span {...rest}>{sentenceCase(label)}</span>
}
