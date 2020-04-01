import { findMembersByStatic } from '../../../features/letter-of-credit-legacy/utils/selectors'
import { Counterparty } from '../../../features/counterparties/store/types'
import { IMember } from '../../../features/members/store/types'

export const getMembersList = (state): IMember[] =>
  state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

export const getMembersByStaticId = (state): { [key: string]: IMember } =>
  state
    .get('members')
    .get('byStaticId')
    .toJS()

export const isCompanyFinancialInstitution = (state, companyStaticId: string): boolean => {
  const members = getMembersList(state)
  const member = findMembersByStatic(members, companyStaticId)

  return member && member.isFinancialInstitution
}

export const isCurrentCompanyFinancialInstitution = (state): boolean => {
  const companyStaticId = getCurrentCompanyStaticId(state)

  return isCompanyFinancialInstitution(state, companyStaticId)
}

export const getCurrentCompanyStaticId = (state): string => {
  const profile = state.get('uiState').get('profile')
  return profile && profile!.company
}
