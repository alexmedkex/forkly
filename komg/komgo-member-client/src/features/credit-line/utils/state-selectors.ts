import { CreditLineType, IDisclosedCreditLine, IExtendedCreditLine } from '../store/types'

export const getAllDisclosedCreditLinesArray = (state, creditLineType: CreditLineType): IDisclosedCreditLine[] =>
  Object.values(
    state
      .get('creditLines')
      .get(creditLineType)
      .get('disclosedCreditLinesById')
      .toJS()
  )

export const getExtendedCreditLineArray = (state, creditLineType: CreditLineType): IExtendedCreditLine[] =>
  Object.values(
    state
      .get('creditLines')
      .get(creditLineType)
      .get('creditLinesById')
      .toJS()
  )
