import { get } from 'lodash'
import { IMember } from '../../members/store/types'
import { DropdownOptions } from '../components'
import { emptyCounterparty, initialLetterOfCreditValues, LetterOfCreditValues, ACTION_NAME } from '../constants'
import { ITradeEnriched } from '../../trades/store/types'
import moment from 'moment'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import Numeral from 'numeral'
import { Task, TaskStatus, TaskContextType } from '../../tasks/store/types'
import { Counterparty } from '../../counterparties/store/types'
import { LetterOfCreditTaskType } from '../constants/taskType'
import { Step } from '../../../components/vertical-steps'
import { letterOfCreditStateStepsText } from '../constants/letterOfCreditStatus'
import { IStateTransitionEnriched } from '../store/types'
import { ILCPresentation } from '../types/ILCPresentation'
import { ApplicationState } from '../../../store/reducers'
import { LCPresentationStatus } from '../store/presentation/types'
import { productLC } from '@komgo/products'
import { Currency, ICargo } from '@komgo/types'

export const findByStaticId = <T extends { staticId: string }>(items: T[], staticId?: string): T | undefined =>
  items.find(i => i.staticId && i.staticId === staticId)

export const findMembersByStatic = (members: IMember[], staticId?: string): IMember | undefined =>
  findByStaticId(members, staticId)

export const findCounterpartyByStatic = (counterparties: Counterparty[], staticId?: string) =>
  findByStaticId(counterparties, staticId)

export const selectBeneficiaryIdOptions = (
  counterparties: Array<Counterparty | IMember>,
  applicantId: string
): DropdownOptions[] => {
  return counterparties
    .filter(m => !m.isFinancialInstitution && m.staticId !== applicantId && m.x500Name !== undefined)
    .map(m => ({ value: m.staticId, text: m.x500Name.CN, content: m.x500Name.CN }))
}
export const selectIssuingBankIdOptions = (
  counterparties: Array<Counterparty | IMember>,
  isLicenseEnabledForCompany
): DropdownOptions[] => {
  return counterparties
    .filter(
      m =>
        m.isFinancialInstitution &&
        m.x500Name !== undefined &&
        m.isMember &&
        isLicenseEnabledForCompany(productLC, m.staticId)
    )
    .map(m => ({ value: m.staticId, text: m.x500Name.CN, content: m.x500Name.CN }))
}
// deprecate use  findBeneficiaryBankIdOptions and map to DropdownOptions in the render method
export const selectBeneficiaryBankIdOptions = (members: IMember[]): DropdownOptions[] => {
  return members
    .filter(m => m.isFinancialInstitution && m.x500Name !== undefined)
    .map(m => ({ value: m.staticId, text: m.x500Name.CN, content: m.x500Name.CN }))
}

export const findFinancialInstitutions = <T>(members: T[]): T[] => {
  return (
    members
      // TODO LS m.x500Name !== undefined this is defensive programming evaluate if we can remove it
      .filter((m: any) => m.isFinancialInstitution && m.x500Name !== undefined)
  )
}

export const participantDetailsFromMember = (
  member: IMember | Counterparty | undefined
): {
  address: string
  city: string
  country: string
  companyName: string
  companyLegalName: string
  isMember: boolean
} => {
  if (!member || !member.x500Name) {
    member = emptyCounterparty
  }
  const {
    x500Name: { CN, C, PC, STREET, L, O },
    isMember
  } = member

  return {
    address: [STREET, L, PC].join('\n'),
    city: L,
    country: C,
    companyName: CN,
    companyLegalName: O,
    isMember
  }
}

export interface IParam {
  applicantId: string
  members: Counterparty[]
  tradeEnriched?: ITradeEnriched
  cargoMovements?: ICargo[]
}

export const selectInitialValuesFromLetterOfCredit = (
  letter: ILetterOfCredit,
  members: IMember[],
  tradeId: string
): LetterOfCreditValues => {
  const { address: applicantAddress, country: applicantCountry } = participantDetailsFromMember(
    findMembersByStatic(members, letter.applicantId)
  )

  const { address: beneficiaryAddress, country: beneficiaryCountry } = participantDetailsFromMember(
    findMembersByStatic(members, letter.beneficiaryId)
  )

  const enumToString = (input: any, defaultValue: any) => input || defaultValue

  return {
    type: enumToString(letter.type, initialLetterOfCreditValues.type),
    expiryDate: letter.expiryDate as string,
    applicantAddress,
    applicantCountry,
    beneficiaryCountry,
    beneficiaryAddress,
    tradeId,
    direct: letter.direct !== undefined ? letter.direct : initialLetterOfCreditValues.direct,
    applicantId: letter.applicantId,
    beneficiaryId: letter.beneficiaryId,
    issuingBankId: letter.issuingBankId,
    beneficiaryBankId: letter.beneficiaryBankId,
    billOfLadingEndorsement: letter.billOfLadingEndorsement,
    currency: enumToString(letter.currency, initialLetterOfCreditValues.currency),
    amount: enumToString(letter.amount, initialLetterOfCreditValues.amount),
    applicantContactPerson: letter.applicantContactPerson,
    beneficiaryContactPerson: letter.beneficiaryContactPerson,
    issuingBankContactPerson: letter.issuingBankContactPerson,
    beneficiaryBankContactPerson: letter.beneficiaryBankContactPerson,
    feesPayableBy: letter.feesPayableBy,
    beneficiaryBankRole: letter.beneficiaryBankRole,
    applicableRules: enumToString(letter.applicableRules, initialLetterOfCreditValues.applicableRules),
    availableBy: enumToString(letter.availableBy, initialLetterOfCreditValues.availableBy),
    cargoIds: [],
    expiryPlace: letter.expiryPlace! || initialLetterOfCreditValues.expiryPlace,
    availableWith: letter.availableWith || initialLetterOfCreditValues.availableWith,
    documentPresentationDeadlineDays:
      letter.documentPresentationDeadlineDays || initialLetterOfCreditValues.documentPresentationDeadlineDays,
    templateType: enumToString(letter.templateType, initialLetterOfCreditValues.templateType),
    freeTextLc: letter.freeTextLc,
    partialShipmentAllowed: letter.partialShipmentAllowed || initialLetterOfCreditValues.partialShipmentAllowed,
    transhipmentAllowed: letter.transhipmentAllowed || initialLetterOfCreditValues.transhipmentAllowed,
    comments: letter.comments,
    LOI: letter.LOI,
    LOIType: enumToString(letter.LOIType, initialLetterOfCreditValues.LOIType),
    LOIAllowed: letter.LOIAllowed,
    invoiceRequirement: enumToString(letter.invoiceRequirement, initialLetterOfCreditValues.invoiceRequirement)
  }
}

export const selectInitialValues = ({
  applicantId,
  members,
  tradeEnriched,
  cargoMovements
}: IParam): LetterOfCreditValues => {
  const applicantDetails = participantDetailsFromMember(findCounterpartyByStatic(members, applicantId))
  const beneficiaryDetails = tradeEnriched
    ? participantDetailsFromMember(findCounterpartyByStatic(members, tradeEnriched.seller!))
    : { address: '', country: '', companyName: '' }

  const cargoIds = cargoMovements ? cargoMovements.map(m => m.cargoId) : []

  return tradeEnriched
    ? {
        ...initialLetterOfCreditValues,
        applicantId,
        applicantAddress: applicantDetails.address,
        applicantCountry: applicantDetails.country,
        beneficiaryAddress: beneficiaryDetails.address,
        beneficiaryCountry: beneficiaryDetails.country,
        beneficiaryId: tradeEnriched.seller || '',
        currency: formatCurrency(tradeEnriched),
        expiryDate: formatExpiryDate(tradeEnriched),
        amount: formatAmount(tradeEnriched),
        tradeId: formatTradeId(tradeEnriched),
        cargoIds
      }
    : {
        ...initialLetterOfCreditValues,
        applicantId
      }
}

export const findLatestShipment = (letter: ILetterOfCredit) => {
  const { trade } = letter.tradeAndCargoSnapshot || { trade: undefined }
  return {
    latestShipment: (trade && trade.deliveryPeriod && trade.deliveryPeriod.endDate) || ''
  }
}

export const findTasksByLetterOfCreditId = (
  tasks: Task[] = [],
  letterOfCreditId: string | undefined | number
): Task[] => {
  const connectedTasks: Task[] = []
  tasks.forEach((t: Task) => {
    if (
      (t.context.type === TaskContextType.LC || t.context.type === TaskContextType.LCPresentation) &&
      t.context.lcid === letterOfCreditId &&
      t.status !== TaskStatus.Done
    ) {
      t.actions = mapActionsToTaskType(t.taskType)
      connectedTasks.push(t)
    }
  })
  return connectedTasks
}

export const findTaskStatusByLetterOfCreditId = (tasks: Task[] = [], letterOfCreditId: string | undefined | number) => {
  const myTasks: Task[] = tasks.filter(
    (t: Task) =>
      (t.context.type === TaskContextType.LC || t.context.type === TaskContextType.LCPresentation) &&
      t.context.lcid === letterOfCreditId &&
      t.status !== TaskStatus.Done
  )
  return myTasks.length > 0 ? TaskStatus.ToDo : TaskStatus.Done
}

const formatExpiryDate = (tradeEnriched: ITradeEnriched) =>
  moment(tradeEnriched.deliveryPeriod && tradeEnriched.deliveryPeriod.endDate, 'YYYY-MM-DD')
    .add(45, 'days')
    .format('YYYY-MM-DD') || ''

const formatCurrency = (tradeEnriched: ITradeEnriched) =>
  ((tradeEnriched.currency && tradeEnriched.currency.toUpperCase()) as Currency) || Currency.USD

const formatAmount = (tradeEnriched: ITradeEnriched) =>
  Numeral(tradeEnriched.quantity && tradeEnriched.price ? tradeEnriched.quantity * tradeEnriched.price : 0).value()

const formatTradeId = (tradeEnriched: ITradeEnriched) => (tradeEnriched._id ? tradeEnriched._id : '')

export const mapActionsToTaskType = (taskType: string) => {
  switch (taskType) {
    case LetterOfCreditTaskType.REVIEW_APPLICATION:
      return [ACTION_NAME.ISSUE_BANK_ISSUE_LC, ACTION_NAME.REJECT_LC]
    case LetterOfCreditTaskType.REVIEW_ISSUED:
      return [ACTION_NAME.REJECT_LC, ACTION_NAME.ACCEPT_LC]
    default:
      return []
  }
}

export const transformStateTransitionToStepData = (stateTransition: IStateTransitionEnriched[]): Step[] =>
  stateTransition.map((transition, i) => ({
    title: (letterOfCreditStateStepsText as any)[transition.toState],
    subtitle: transition.performerName,
    date: transition.date,
    description: transition.comments,
    finished: i === stateTransition.length - 1
  }))

export const prepareStateHistory = (letter: ILetterOfCredit, members: IMember[]) => {
  if (!letter.stateHistory) {
    return null
  }

  const getComment = (letter: ILetterOfCredit, state: string) => {
    switch (state) {
      case ILetterOfCreditStatus.REQUEST_REJECTED:
        return letter.issuingBankComments
      case ILetterOfCreditStatus.ISSUED_LC_REJECTED:
        return letter.beneficiaryComments || letter.advisingBankComments
      default:
        return null
    }
  }

  return letter.stateHistory.map(state => {
    const company = findMembersByStatic(members, state.performer)

    return {
      ...state,
      performerName: company ? company.x500Name.CN : '',
      comments: getComment(letter, state.toState)
    }
  })
}

export const findTooltipValueForDropdown = (options: DropdownOptions[], fieldValue: string) => {
  const selectedOption = Object.values(options ? options : {}).find(v => v.value === fieldValue)
  return selectedOption ? selectedOption.content : null
}

export const findMemberName = (searchMemberId: string, members: IMember[]) => {
  const [member] = members.filter(m => m.staticId === searchMemberId)
  return member ? member.x500Name.CN : searchMemberId
}

export const findCommentForLCPresentationStatus = (presentation: ILCPresentation, status: LCPresentationStatus) => {
  const mapStatusToComment = new Map<LCPresentationStatus, string>([
    [LCPresentationStatus.DocumentsPresented, presentation.beneficiaryComments],
    [LCPresentationStatus.DocumentsCompliantByNominatedBank, presentation.nominatedBankComments],
    [LCPresentationStatus.DocumentsDiscrepantByNominatedBank, presentation.nominatedBankComments],
    [LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank, presentation.nominatedBankComments],
    [LCPresentationStatus.DocumentsCompliantByIssuingBank, presentation.issuingBankComments],
    [LCPresentationStatus.DocumentsDiscrepantByIssuingBank, presentation.issuingBankComments],
    [LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank, presentation.issuingBankComments],
    [LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank, presentation.issuingBankComments],
    [LCPresentationStatus.DiscrepanciesRejectedByIssuingBank, presentation.issuingBankComments],
    [LCPresentationStatus.DocumentsAcceptedByApplicant, presentation.applicantComments],
    [LCPresentationStatus.DiscrepanciesRejectedByApplicant, presentation.applicantComments]
  ])
  const comment = mapStatusToComment.get(status)
  return comment || ''
}

export const findRoleForStaticId = (staticId: string, presentation: ILCPresentation) => {
  switch (staticId) {
    case presentation.beneficiaryId:
      return 'Beneficiary'
    case presentation.applicantId:
      return 'Applicant'
    case presentation.nominatedBankId:
      return 'Nominated Bank'
    case presentation.issuingBankId:
      return 'Issuing Bank'
    default:
      return ''
  }
}

export const getLcPresentationWithDocuments = (state: ApplicationState, lcId: string, presentationId: string) => {
  const letterOfCredit: ILetterOfCredit =
    state
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[lcId] || {}

  let presentation: ILCPresentation

  if (letterOfCredit.reference) {
    const presentations = state
      .get('lCPresentation')
      .get('byLetterOfCreditReference')
      .toJS()[letterOfCredit.reference]
    if (presentations) {
      ;[presentation] = presentations.filter(p => p.staticId === presentationId)
    }
  }

  const allDocuments = state
    .get('lCPresentation')
    .get('documentsByPresentationId')
    .toJS()

  let documents: Document[]
  if (presentation) {
    documents = allDocuments[presentation.staticId]
  }

  return {
    letterOfCredit,
    presentation,
    documents
  }
}

export const hasPresentationTasks = (tasks: Task[] = [], letterOfCreditId: string | undefined | number) => {
  return (
    tasks.filter(
      (t: Task) =>
        t.context.lcid === letterOfCreditId &&
        (t.context.type === TaskContextType.LC || t.context.type === TaskContextType.LCPresentation) &&
        t.context.lcid === letterOfCreditId &&
        (t.taskType === LetterOfCreditTaskType.MANAGE_PRESENTATION ||
          t.taskType === LetterOfCreditTaskType.REVIEW_PRESENTATION)
    ).length > 0
  )
}

export const getTimer = (letterOfCredit: ILetterOfCredit) => {
  if (timerExists(letterOfCredit)) {
    return letterOfCredit.timer.timerData[letterOfCredit.timer.timerData.length - 1].time
  }
  return null
}

export const timerExists = (letterOfCredit: ILetterOfCredit) => {
  return letterOfCredit && letterOfCredit.timer && letterOfCredit.timer.timerData.length > 0
}
