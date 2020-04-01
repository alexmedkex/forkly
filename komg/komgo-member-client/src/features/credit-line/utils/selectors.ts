import _ from 'lodash'
import {
  IExtendedCreditLine,
  IDisclosedCreditLineSummaryEnriched,
  IDisclosedCreditLineSummary,
  IDisclosedCreditLine,
  IDisclosedCreditLineEnriched,
  IExtendedCreditLineRequest,
  CreditLineType,
  IMemberWithDisabledFlag
} from '../store/types'
import { IMember } from '../../members/store/types'
import { getCompanyName } from '../../counterparties/utils/selectors'
import { ICreditLineRequest } from '@komgo/types'
import { isMemberKomgo } from '../../members/store/selectors'

export const populateCreditLinesData = (
  riskCovers: IExtendedCreditLine[],
  members: IMember[]
): IExtendedCreditLine[] => {
  return riskCovers.map(creditLine => populateCreditLineData(creditLine, members))
}

export const populateCreditLineData = (riskCover: IExtendedCreditLine, members: IMember[]): IExtendedCreditLine => {
  const counterparty = members.find(m => m.staticId === riskCover.counterpartyStaticId)

  if (riskCover.sharedCreditLines) {
    riskCover.sharedCreditLines.forEach(item => {
      const counterparty = members.find(m => m.staticId === item.sharedWithStaticId)
      item.counterpartyName = counterparty ? counterparty.x500Name.CN : '-'
    })
  }

  return {
    ...riskCover,
    counterpartyName: counterparty && counterparty.x500Name ? counterparty.x500Name.CN : '-',
    counterpartyLocation: counterparty && counterparty.x500Name ? counterparty.x500Name.L : '-',
    data: riskCover.data || {}
  }
}

export const populateDisclosedCreditLineSummaryData = (
  disclosedCreditLineSummaries: IDisclosedCreditLineSummary[],
  membersByStaticId: { [key: string]: IMember }
): IDisclosedCreditLineSummaryEnriched[] => {
  return disclosedCreditLineSummaries.map(summary => {
    const counterparty = membersByStaticId[summary.counterpartyStaticId]
    if (counterparty && counterparty.x500Name) {
      return { ...summary, counterpartyName: counterparty.x500Name.CN, counterpartyLocation: counterparty.x500Name.L }
    }
    return { ...summary, counterpartyName: '-', counterpartyLocation: '-' }
  })
}

export const populateDisclosedCreditLineData = (
  disclosedCreditLines: IDisclosedCreditLine[],
  membersByStaticId: { [key: string]: IMember },
  buyerId: string
): IDisclosedCreditLineEnriched[] => {
  return disclosedCreditLines.filter(line => line.counterpartyStaticId === buyerId).map(line => {
    const company = membersByStaticId[line.ownerStaticId]
    const counterparty = membersByStaticId[line.counterpartyStaticId]
    const creditLine = { ...line } as IDisclosedCreditLineEnriched
    creditLine.companyName = company && company.x500Name && company.x500Name.CN ? company.x500Name.CN : '-'
    creditLine.counterpartyName =
      counterparty && counterparty.x500Name && counterparty.x500Name.CN ? counterparty.x500Name.CN : '-'
    creditLine.companyLocation = company && company.x500Name ? company.x500Name.L : '-'
    return creditLine
  })
}

export const groupRequestsByBuyerId = (
  requests: IExtendedCreditLineRequest[]
): { [buyerId: string]: IExtendedCreditLineRequest[] } => {
  const grouped = _.groupBy(requests, request => request.counterpartyStaticId)
  return grouped
}

export const populateRequestsData = (
  requests: ICreditLineRequest[],
  members: IMember[]
): IExtendedCreditLineRequest[] => {
  return requests.map(request => populateRequest(request, members))
}

export const populateRequest = (request: ICreditLineRequest, members: IMember[]): IExtendedCreditLineRequest => {
  const buyer = members.find(m => m.staticId === request.counterpartyStaticId)
  const seller = members.find(m => m.staticId === request.companyStaticId)
  return {
    ...request,
    companyName: getCompanyName(seller),
    counterpartyName: getCompanyName(buyer)
  }
}

export const getMembersWithDisabledFlag = (
  members: IMember[],
  feature: CreditLineType,
  creditLines: Array<{ counterpartyStaticId: string }>,
  company: string
): IMemberWithDisabledFlag[] => {
  const membersFiltered = members.filter(member => {
    const commonFilter = member.x500Name && company !== member.staticId && !isMemberKomgo(member)
    return (
      commonFilter &&
      (feature === CreditLineType.RiskCover ? !member.isFinancialInstitution : member.isFinancialInstitution)
    )
  })

  return membersFiltered.map(member => {
    const memberThatAlreadyHaveCreditLine = creditLines.find(
      creditLine => creditLine.counterpartyStaticId === member.staticId
    )

    if (memberThatAlreadyHaveCreditLine) {
      return {
        ...member,
        disabled: true
      }
    }
    return {
      ...member,
      disabled: false
    }
  })
}
