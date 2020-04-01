import { ILetterOfCreditTemplate, LetterOfCreditValues } from '../constants'
import { IMember } from '../../members/store/types'
import { ITradeEnriched } from '../../trades/store/types'
import { replaceUnderscores } from '../../../utils/casings'
import { participantDetailsFromMember, findMembersByStatic } from './selectors'
import { displayPaymentTerms } from '../../../utils/date'
import { ICargo } from '@komgo/types'

export function buildLetterOfCreditTemplateFields(
  values: LetterOfCreditValues,
  members: IMember[],
  trade: ITradeEnriched,
  cargoMovements: ICargo[]
): ILetterOfCreditTemplate {
  const applicant = participantDetailsFromMember(findMembersByStatic(members, values.applicantId))
  const beneficiary = participantDetailsFromMember(findMembersByStatic(members, values.beneficiaryId))
  const issuingBank = participantDetailsFromMember(findMembersByStatic(members, values.issuingBankId))
  const beneficiaryBank = participantDetailsFromMember(findMembersByStatic(members, values.beneficiaryBankId))
  const paymentTerms = trade.paymentTerms
  const cargoMovement = cargoMovements[0] || { grade: undefined }
  return {
    ...values,
    issuingBankAddress: issuingBank.address,
    issuingBankCountry: issuingBank.country,
    beneficiaryBankAddress: beneficiaryBank.address,
    beneficiaryBankCountry: beneficiaryBank.country,
    applicant: {
      name: applicant.companyLegalName,
      locality: applicant.city
    },
    beneficiary: {
      name: beneficiary.companyLegalName,
      locality: beneficiary.city
    },
    beneficiaryBank: {
      name: beneficiaryBank.companyLegalName,
      locality: beneficiaryBank.city
    },
    issuingBank: {
      name: issuingBank.companyLegalName,
      locality: issuingBank.city
    },
    grade: cargoMovement.grade,
    cargo: {
      deliveryPeriod: {
        startDate: trade.deliveryPeriod.startDate,
        endDate: trade.deliveryPeriod.endDate
      },
      paymentTerms: displayPaymentTerms({
        eventBase: paymentTerms.eventBase,
        when: paymentTerms.when,
        time: paymentTerms.time,
        timeUnit: paymentTerms.timeUnit,
        dayType: paymentTerms.dayType
      }),
      price: trade.price,
      currency: trade.currency,
      priceUnit: trade.priceUnit,
      quantity: trade.quantity,
      deliveryTerms: trade.deliveryTerms,
      minTolerance: trade.minTolerance,
      maxTolerance: trade.maxTolerance
    },
    // Remove underscores
    applicableRules: replaceUnderscores(values.applicableRules),
    availableBy: replaceUnderscores(values.availableBy),
    // MM - Todo, hardcoded values provided until we have the proper values defined.
    // These did not break before, because we were not running that piece of the template,
    // but since we can now provide different grades, then this was now breaking
    LOIAllowed: true,
    LOI: values.LOI || ''
  }
}
