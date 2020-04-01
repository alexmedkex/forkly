import { CompanyRoles, IStandbyLetterOfCreditBase, IStandbyLetterOfCredit, ITrade, ICargo, Grade } from '@komgo/types'

import { IMember } from '../../../members/store/types'
import { Counterparty } from '../../../counterparties/store/types'
import moment from 'moment'
import Numeral from 'numeral'
import { displayTolerance } from '../../../trades/utils/displaySelectors'

export interface Party {
  name: string
  address: string
  organization: string
}
export interface TemplateParams {
  quantity: string
  expiryDate: string
  contractDate: string
  contractReference: string
  currency: string
  amount: string
  availableWith: string
  feesPayableBy: string
  issuingBank: Party & { issuingBankReference: string; issuingBankPostalAddress: string }
  beneficiaryBank: Party
  applicant: Party
  beneficiary: Party
  overrideStandardTemplate: string
  covering: string
}

export interface TemplateInputs {
  letter: IStandbyLetterOfCreditBase | IStandbyLetterOfCredit
  trade?: ITrade
  cargo?: ICargo
  issuingBank: Counterparty
  beneficiaryBank: IMember
  applicant: IMember
  beneficiary: IMember
}

const buildParty = (member: IMember | Counterparty, role: string): Party => {
  const {
    x500Name: { CN, C, PC, STREET, L, O }
  } = member || { x500Name: {} as any }

  const address = [STREET, L, PC].join(' ')
  const city = L || `[[ ${role} city ]]`
  const country = C || `[[ ${role} country ]]`
  return {
    name: CN || `[[ ${role} ]]`,
    organization: O || `[[ ${role} ]]`,
    address: `${address.trim() || `[[ ${role} address ]]`} ${city} ${country}`
  }
}

const buildField = (value: string | number | undefined, templateFieldName: string): string => {
  const placeholder = `[[ ${templateFieldName} ]]`
  return value ? `${value}` : placeholder
}

export const buildTemplate = ({
  letter,
  trade,
  cargo,
  issuingBank,
  beneficiaryBank,
  applicant,
  beneficiary
}: TemplateInputs): TemplateParams => {
  const DATE_FORMAT = 'YYYY-MM-DD'
  const {
    expiryDate,
    amount,
    availableWith,
    feesPayableBy,
    tradeSnapshot,
    cargoSnapshot,
    contractDate,
    issuingBankReference,
    issuingBankPostalAddress,
    contractReference,
    currency,
    overrideStandardTemplate
  } =
    letter || ({} as any)
  const issuingBankReferenceParam = buildField(issuingBankReference, 'Issuing Bank reference')
  const issuingBankPostalAddressParam = buildField(issuingBankPostalAddress, 'Issuing Bank postal address')

  const issuingBankParty = {
    ...buildParty(issuingBank, 'Issuing Bank'),
    issuingBankReference: issuingBankReferenceParam,
    issuingBankPostalAddress: issuingBankPostalAddressParam
  }
  const beneficiaryBankParty = buildParty(beneficiaryBank, 'Beneficiary Bank')
  const expiryDateParam = expiryDate ? moment(expiryDate).format(DATE_FORMAT) : '[[ Expiry Date ]]'
  const contractDateParam = contractDate ? moment(contractDate).format(DATE_FORMAT) : '[[ Contract Date ]]'
  const contractReferenceParam = buildField(contractReference, 'Contract Reference')

  const formatTolerance = trade => {
    if (!trade) {
      return ''
    }
    const { maxTolerance, minTolerance } = trade
    return minTolerance === maxTolerance
      ? `PLUS OR MINUS ${minTolerance}`
      : `PLUS ${maxTolerance} OR MINUS ${minTolerance}`
  }

  const formatAmount = amount => {
    return amount ? Numeral(amount).format('0,0.00') : ''
  }

  const formatQuantity = (trade: ITrade = {} as ITrade) => {
    const { quantity } = trade
    return quantity ? Numeral(quantity).format('0,0') : ''
  }

  const formatPriceUnit = (trade: ITrade = {} as ITrade) => {
    const { priceUnit } = trade
    return priceUnit ? priceUnit : ''
  }
  const data = trade || tradeSnapshot
  const priceUnit = buildField(formatPriceUnit(data), 'priceUnit')
  const quantity = buildField(formatQuantity(data), 'quantity')
  const tolerance = buildField(formatTolerance(data), 'tolerance')

  const formatGrade = cargo => {
    if (!cargo) {
      return ''
    }
    const { grade } = cargo || cargoSnapshot
    return grade ? grade : ''
  }
  const grade = buildField(formatGrade(cargo || cargoSnapshot), 'grade')
  const isBFOET = Object.values(Grade).includes(grade.toUpperCase())
  const formatCovering = ({ isBFOET, quantity, grade, priceUnit }) => {
    return isBFOET
      ? `${quantity} ${tolerance} PCT BARRELS OF ${grade} CRUDE OIL`
      : `${quantity} ${tolerance} PCT ${priceUnit} OF ${grade}`
  }

  return {
    quantity: buildField(formatQuantity(data), 'quantity'),
    issuingBank: issuingBankParty,
    beneficiaryBank: beneficiaryBankParty,
    applicant: buildParty(applicant, 'Applicant'),
    beneficiary: buildParty(beneficiary, 'Beneficiary'),
    expiryDate: expiryDateParam,
    contractReference: contractReferenceParam,
    contractDate: contractDateParam,
    currency: buildField(currency, 'currency'),
    amount: buildField(formatAmount(amount), 'amount'),
    overrideStandardTemplate: buildField(overrideStandardTemplate, 'Standard Template'),
    availableWith: availableWith === CompanyRoles.IssuingBank ? issuingBankParty.name : beneficiaryBankParty.name,
    feesPayableBy: buildField(feesPayableBy, 'Fees Payable By'),
    covering: buildField(formatCovering({ isBFOET, quantity, grade, priceUnit }), 'covering')
  }
}
