import { LetterOfCreditValues, STEP } from '../constants'
import { FormikErrors, FormikValues, FormikTouched } from 'formik'
import { stringOrUndefined } from '../../../utils/types'

enum COMMON_PARTICIPANT_INFO {
  ADDRESS = 'Address',
  COUNTRY = 'Country',
  CONTACT = 'Contact person'
}

const fieldsByStep: any = {
  [STEP.PARTICIPANTS]: {
    applicantId: { label: 'Applicant name' },
    applicantAddress: { label: COMMON_PARTICIPANT_INFO.ADDRESS },
    beneficiaryAddress: { label: COMMON_PARTICIPANT_INFO.ADDRESS },
    issuingBankAddress: { label: COMMON_PARTICIPANT_INFO.ADDRESS },
    beneficiaryBankAddress: { label: COMMON_PARTICIPANT_INFO.ADDRESS },
    applicantCountry: { label: COMMON_PARTICIPANT_INFO.COUNTRY },
    beneficiaryCountry: { label: COMMON_PARTICIPANT_INFO.COUNTRY },
    issuingBankId: { label: 'Issuing bank name' },
    issuingBankCountry: { label: COMMON_PARTICIPANT_INFO.COUNTRY },
    beneficiaryBankCountry: { label: COMMON_PARTICIPANT_INFO.COUNTRY },
    applicantContactPerson: { label: COMMON_PARTICIPANT_INFO.CONTACT },
    beneficiaryContactPerson: { label: COMMON_PARTICIPANT_INFO.CONTACT },
    issuingBankContactPerson: { label: COMMON_PARTICIPANT_INFO.CONTACT },
    beneficiaryId: { label: 'Beneficiary name' },
    beneficiaryBankId: { label: 'Beneficiary bank name' },
    beneficiaryBankContactPerson: { label: COMMON_PARTICIPANT_INFO.CONTACT },
    beneficiaryBankRole: { label: 'Beneficiary bank role' },
    feesPayableBy: { label: 'Fees payable by' },
    direct: { label: 'Issue the LC directly to the beneficiary' }
  },
  [STEP.LC_TYPE]: {
    type: { label: 'Type of LC' },
    applicableRules: { label: 'Applicable rules' },
    templateType: { label: 'Template type' },
    billOfLadingEndorsement: { label: 'Bill of lading endorsement' },
    invoiceRequirement: { label: 'Invoice requirement' },
    freeTextLc: { label: 'Free text' },
    issueDueDateDuration: { label: 'Duration' },
    issueDueDateUnit: { label: 'Unit' },
    issueDueDateActive: { label: 'Due Date' }
  },
  [STEP.SUMMARY_OF_TRADE]: {
    tradeId: { label: 'Trade ID' }
  },
  [STEP.LC_DETAILS]: {
    currency: { label: 'Currency' },
    amount: { label: 'Opening amount' },
    expiryPlace: { label: 'Place of expiry' },
    availableWith: { label: 'Available with' },
    availableBy: { label: 'Available by' },
    partialShipmentAllowed: { label: 'Partial shipment allowed' },
    transhipmentAllowed: { label: 'Transhipment allowed' },
    documentPresentationDeadlineDays: { label: 'Document presentation deadline' },
    comments: { label: 'Additional comments' },
    expiryDate: { label: 'Date of expiry' },
    LOIAllowed: { label: 'Allow LOI to be presented in lieu of documents' },
    LOIType: { label: 'LOI template' },
    LOI: { label: 'LOI template' }
  },
  [STEP.CARGO_MOVEMENTS]: {
    cargoIds: { label: 'Cargo IDs' }
  },
  [STEP.LC_DOCUMENTS]: {},
  [STEP.REVIEW]: {
    generatedPDF: { label: 'LC Application PDF' }
  }
}

export const findLabel = (step: string, field: keyof LetterOfCreditValues | string): stringOrUndefined =>
  fieldsByStep[step] ? (fieldsByStep[step][field] ? fieldsByStep[step][field].label : undefined) : undefined

export const selectCurrentStepErrors = (errors: FormikErrors<FormikValues>, step: STEP) =>
  Object.entries(errors).reduce((memo: any, [fieldName, message]) => {
    return fieldsByStep[step][fieldName] !== undefined
      ? {
          ...memo,
          [fieldName]: message
        }
      : memo
  }, {})

export const fieldToStep = (field: keyof LetterOfCreditValues | string): STEP | undefined => {
  const step = Object.keys(fieldsByStep).find(step => fieldsByStep[step][field])
  return STEP[step as STEP]
}

export const fieldToLabel = (field: keyof LetterOfCreditValues | string): stringOrUndefined =>
  findLabel(fieldToStep(field), field)

export const currentStepFields = (step: string): any => Object.keys(fieldsByStep[step])
