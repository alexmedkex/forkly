import { ICargo, ITrade, IDataLetterOfCreditBase } from '@komgo/types'
import { IMember } from '../../members/store/types'
import { ImmutableObject } from '../../../utils/types'

interface BuildDataLetterOfCreditBaseForCreateProps {
  cargo?: ICargo
  trade: ImmutableObject<ITrade>
  applicant: IMember
  beneficiary: IMember
}
export const buildFormDataLetterOfCredit = ({
  cargo,
  trade,
  applicant,
  beneficiary
}: BuildDataLetterOfCreditBaseForCreateProps): IDataLetterOfCreditBase => {
  const startAmount = parseFloat(Number(trade.get('quantity') * trade.get('price')).toFixed())

  return {
    version: 1,
    amount: !isNaN(startAmount) ? startAmount : 0.0,
    currency: trade.get('currency'),
    trade: { sourceId: trade.get('sourceId'), source: trade.get('source') },
    applicant: { staticId: applicant.staticId },
    beneficiary: { staticId: beneficiary.staticId },
    issuingBank: { staticId: '' },
    expiryDate: 'Choose a valid expiry date',
    cargo: cargo && { source: cargo.source, sourceId: cargo.sourceId, cargoId: cargo.cargoId }
  }
}
