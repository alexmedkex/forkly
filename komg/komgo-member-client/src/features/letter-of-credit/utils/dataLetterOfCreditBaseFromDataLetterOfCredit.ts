import { IDataLetterOfCredit, IDataLetterOfCreditBase } from '@komgo/types'

export const buildDataLetterOfCreditBase = (input: IDataLetterOfCredit): IDataLetterOfCreditBase => {
  return {
    version: input.version,
    applicant: {
      staticId: input.applicant.staticId
    },
    issuingBank: {
      staticId: input.issuingBank.staticId
    },
    beneficiary: {
      staticId: input.beneficiary.staticId
    },
    beneficiaryBank: input.beneficiaryBank ? { staticId: input.beneficiaryBank.staticId } : undefined,
    trade: {
      source: input.trade.source,
      sourceId: input.trade.sourceId
    },
    cargo: input.cargo
      ? {
          source: input.cargo.source,
          cargoId: input.cargo.cargoId,
          sourceId: input.cargo.sourceId
        }
      : undefined,
    amount: input.amount,
    expiryDate: input.expiryDate,
    currency: input.currency,
    issuingBankReference: input.issuingBankReference || ''
  }
}
