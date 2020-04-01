import { formatPrice, displayPercentage, displayYesOrNo } from '../../trades/utils/displaySelectors'
import { IMemberMarketSelectionItem } from '../store/types'
import { Counterparty } from '../../counterparties/store/types'
import { IDisclosedCreditLine } from '../../credit-line/store/types'

const EMPTY_VALUE_TEXT = '-'

export const tranformToMemberMarketSelectionData = (
  counterparties: Counterparty[],
  creditLines: IDisclosedCreditLine[]
): IMemberMarketSelectionItem[] => {
  const mapCounterpartyToCreditLineResponse: Map<string, IDisclosedCreditLine> = new Map(
    creditLines.map(
      (creditLine: IDisclosedCreditLine) => [creditLine.ownerStaticId, creditLine] as [string, IDisclosedCreditLine]
    )
  )

  const result: IMemberMarketSelectionItem[] = counterparties.map(counterparty => {
    const item: IMemberMarketSelectionItem = createDefaultMemberMarketSelectionItem(counterparty)

    if (mapCounterpartyToCreditLineResponse.has(counterparty.staticId)) {
      const creditLine: IDisclosedCreditLine = mapCounterpartyToCreditLineResponse.get(counterparty.staticId)
      item.appetite = decorateValue(displayYesOrNo, creditLine.appetite)
      item.availability = decorateValue(displayYesOrNo, creditLine.availability)
      item.creditLimit = decorateValue(formatPrice, creditLine.creditLimit)
      if (creditLine.data) {
        item.riskFee = decorateValue(displayPercentage, creditLine.data.fee)
        item.margin = decorateValue(displayPercentage, creditLine.data.margin)
        item.maxTenor = creditLine.data.maximumTenor ? `${creditLine.data.maximumTenor}` : EMPTY_VALUE_TEXT
      }
    }

    return item
  })
  return result
}

export const createDefaultMemberMarketSelectionItem = (counterparty: Counterparty): IMemberMarketSelectionItem => {
  return {
    counterparty,
    location: counterparty.x500Name.L,
    appetite: EMPTY_VALUE_TEXT,
    availability: EMPTY_VALUE_TEXT,
    creditLimit: EMPTY_VALUE_TEXT,
    riskFee: EMPTY_VALUE_TEXT,
    margin: EMPTY_VALUE_TEXT,
    maxTenor: EMPTY_VALUE_TEXT
  }
}

const decorateValue = (decorator: ((_: number | boolean | string) => string), value?: number | boolean | string) => {
  if (value !== undefined) {
    return decorator(value)
  } else {
    return EMPTY_VALUE_TEXT
  }
}
