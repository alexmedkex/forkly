import { LetterOfCreditValues, TEMPLATE_TYPE_OPTIONS } from '../constants'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
export function formDataCleansing(formValues: LetterOfCreditValues) {
  let letterOfCreditData: ILetterOfCredit
  // TODO RR USE FORM VALUES LIKE
  // letterOfCreditData = { ...formValues }
  if (formValues.direct) {
    const {
      applicantAddress,
      applicantCountry,
      beneficiaryAddress,
      beneficiaryCountry,
      issuingBankAddress,
      issuingBankCountry,
      beneficiaryBankId,
      beneficiaryBankRole,
      beneficiaryBankAddress,
      beneficiaryBankCountry,
      beneficiaryBankContactPerson,
      ...data
    } = formValues
    letterOfCreditData = { ...data }
  } else {
    const {
      applicantAddress,
      applicantCountry,
      beneficiaryAddress,
      beneficiaryCountry,
      issuingBankAddress,
      issuingBankCountry,
      beneficiaryBankAddress,
      beneficiaryBankCountry,
      ...data
    } = formValues
    letterOfCreditData = { ...data }
  }

  if (letterOfCreditData.templateType === TEMPLATE_TYPE_OPTIONS.FREE_TEXT) {
    delete letterOfCreditData.billOfLadingEndorsement
    delete letterOfCreditData.invoiceRequirement
  }

  return letterOfCreditData
}
