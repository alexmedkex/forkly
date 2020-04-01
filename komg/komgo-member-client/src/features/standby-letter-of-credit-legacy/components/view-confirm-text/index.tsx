import * as React from 'react'
import { ReviewDecision } from '../issue-form'
import { IStandbyLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'
import { IMember } from '../../../members/store/types'
import { displayDate } from '../../../../utils/date'

interface ViewConfirmProps {
  taskType: StandbyLetterOfCreditTaskType // useful for later when we are approving as beneficiary
  reviewDecision: ReviewDecision
  applicant: IMember
  standbyLetterOfCredit: IStandbyLetterOfCredit
}

export const ViewConfirm: React.FC<ViewConfirmProps> = ({ applicant, standbyLetterOfCredit, reviewDecision }) => {
  const applicantName = applicant.x500Name.CN

  const formattedDate = displayDate(standbyLetterOfCredit.createdAt)

  return reviewDecision === ReviewDecision.RejectApplication ? (
    <p>
      You are about to reject the credit application <b>{standbyLetterOfCredit.reference}</b> submitted by{' '}
      {applicantName} on {formattedDate}.
    </p>
  ) : (
    <p>
      You are about to approve the credit application <b>{standbyLetterOfCredit.reference}</b> submitted by{' '}
      {applicantName} on {formattedDate}.
    </p>
  )
}
