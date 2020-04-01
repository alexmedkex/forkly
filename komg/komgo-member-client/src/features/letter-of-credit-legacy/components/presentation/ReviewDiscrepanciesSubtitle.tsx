import * as React from 'react'
import { LCPresentationStatus } from '../../store/presentation/types'
import { findMemberName } from '../../utils/selectors'
import { ILCPresentation } from '../../types/ILCPresentation'
import { IMember } from '../../../members/store/types'

interface IProps {
  presentation: ILCPresentation
  members: IMember[]
}

const ReviewDiscrepanciesSubtitle: React.FC<IProps> = (props: IProps) => {
  const { presentation, members } = props
  if (presentation.status === LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank) {
    return (
      <p>
        The Issuing bank, <b>{findMemberName(presentation.issuingBankId, members)}</b> has advised discrepancies in
        documents relating to {presentation.LCReference}
      </p>
    )
  } else if (presentation.status === LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank) {
    return (
      <p>
        The Nominated bank, <b>{findMemberName(presentation.nominatedBankId, members)}</b> has advised discrepancies in
        documents relating to {presentation.LCReference}
      </p>
    )
  } else if (presentation.status === LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank) {
    return (
      <p>
        The Issuing bank, <b>{findMemberName(presentation.issuingBankId, members)}</b> has accepted discrepancies in
        documents relating to {presentation.LCReference} advised by the Nominated bank{' '}
        <b>{findMemberName(presentation.nominatedBankId, members)}}</b>
      </p>
    )
  }
  return null
}

export default ReviewDiscrepanciesSubtitle
