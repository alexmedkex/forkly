import { ReviewDecision, IssueFormValues } from '../components/issue-form'
import { StandbyLetterOfCreditTaskType, IStandbyLetterOfCredit } from '@komgo/types'
import { IMember } from '../../members/store/types'

export const findActiveFields = (
  taskType: StandbyLetterOfCreditTaskType,
  reviewDecision: ReviewDecision
): Array<Partial<keyof IStandbyLetterOfCredit>> =>
  taskType === StandbyLetterOfCreditTaskType.ReviewRequested && reviewDecision === ReviewDecision.ApproveApplication
    ? ['issuingBankReference', 'issuingBankPostalAddress']
    : []

const isSet = (val?: string) => !!val

// cyclomatic complexity....
const isApproveApplicationUseCase = (
  taskIsReviewRequested: boolean,
  reviewDecision: ReviewDecision,
  hasIssuingBankReference: boolean,
  hasIssuingBankPostalAddress: boolean,
  beneficiary: IMember,
  document?: File
) => {
  const rules = [
    taskIsReviewRequested &&
      reviewDecision === ReviewDecision.ApproveApplication &&
      hasIssuingBankReference &&
      hasIssuingBankPostalAddress &&
      beneficiary.isMember,
    taskIsReviewRequested &&
      reviewDecision === ReviewDecision.ApproveApplication &&
      !beneficiary.isMember &&
      document &&
      hasIssuingBankReference &&
      hasIssuingBankPostalAddress
  ]

  return rules.includes(true)
}

export const isSubmitResponseEnabled = (
  values: IssueFormValues,
  beneficiary: IMember,
  taskType: StandbyLetterOfCreditTaskType
) => {
  const { document, reviewDecision, standbyLetterOfCredit } = values

  const taskIsReviewRequested = taskType === StandbyLetterOfCreditTaskType.ReviewRequested

  const hasIssuingBankPostalAddress = isSet(standbyLetterOfCredit.issuingBankPostalAddress)
  const hasIssuingBankReference = isSet(standbyLetterOfCredit.issuingBankReference)

  const rules = [
    taskIsReviewRequested && reviewDecision === ReviewDecision.RejectApplication,
    isApproveApplicationUseCase(
      taskIsReviewRequested,
      reviewDecision,
      hasIssuingBankReference,
      hasIssuingBankPostalAddress,
      beneficiary,
      document
    )
  ]
  return rules.includes(true)
}

export const viewSubmitHandler = (
  values: IssueFormValues,
  taskType: StandbyLetterOfCreditTaskType,
  issueStandbyLetterOfCredit: (standbyLetterOfCredit: IStandbyLetterOfCredit, file: File) => void,
  rejectStandbyLetterOfCreditRequest: (staticId: string, issuingBankReference: string) => void
) => {
  const taskIsReviewRequested = taskType === StandbyLetterOfCreditTaskType.ReviewRequested

  if (taskIsReviewRequested && values.reviewDecision === ReviewDecision.ApproveApplication) {
    issueStandbyLetterOfCredit(values.standbyLetterOfCredit, values.document)
  } else if (taskIsReviewRequested && values.reviewDecision === ReviewDecision.RejectApplication) {
    rejectStandbyLetterOfCreditRequest(values.standbyLetterOfCredit.staticId, values.rejectionReference)
  }
}
