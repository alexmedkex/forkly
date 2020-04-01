import { IDataLetterOfCredit, ICargo, ITrade, IDataLetterOfCreditBase } from '@komgo/types'
import { Counterparty } from '../../counterparties/store/types'
import { IMember } from '../../members/store/types'
import { findCounterpartyByStatic, findMembersByStatic } from '../../letter-of-credit-legacy/utils/selectors'
import { ImmutableObject } from '../../../utils/types'

interface BuildDataLetterOfCreditProps {
  cargo?: ICargo
  trade: ImmutableObject<ITrade>
  applicant: IMember
  beneficiary: IMember
  issuingBanks: Counterparty[]
  beneficiaryBanks?: IMember[]
  dataLetterOfCreditBase: IDataLetterOfCreditBase
}
export const buildDataLetterOfCredit = ({
  cargo,
  trade,
  applicant,
  beneficiary,
  issuingBanks,
  beneficiaryBanks,
  dataLetterOfCreditBase
}: BuildDataLetterOfCreditProps): Partial<IDataLetterOfCredit> => ({
  cargo,
  trade: trade.toJS(),
  applicant: applicant as any,
  beneficiary: beneficiary as any,
  issuingBank: findCounterpartyByStatic(issuingBanks, dataLetterOfCreditBase.issuingBank.staticId) as any,
  beneficiaryBank: dataLetterOfCreditBase.beneficiaryBank
    ? (findMembersByStatic(beneficiaryBanks, dataLetterOfCreditBase.beneficiaryBank.staticId) as any)
    : undefined,
  amount: dataLetterOfCreditBase.amount,
  issuingBankReference: dataLetterOfCreditBase.issuingBankReference,
  currency: dataLetterOfCreditBase.currency,
  expiryDate: dataLetterOfCreditBase.expiryDate
})
