import { Counterparty } from '../../counterparties/store/types'
import { findCounterpartyByStatic } from '../../letter-of-credit-legacy/utils/selectors'

export const counterpartyName = (counterparty: Counterparty): string => {
  return counterparty.x500Name.O
}

export const fetchCounterpartyName = (counterparties: Counterparty[], companyId: string): string => {
  const counterParty = findCounterpartyByStatic(counterparties, companyId)
  return counterParty ? counterParty.x500Name.CN : ''
}
