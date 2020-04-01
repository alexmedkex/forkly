import { toFormikErrors } from '../../../utils/validator'
import { selectCurrentStepErrors, fieldToStep, currentStepFields, fieldToLabel } from './fieldsByStep'
import { STEP } from '../constants'

describe('selectCurrentStepErrors', () => {
  it('only returns errors related to the current step', () => {
    const ajvErrors = [
      {
        keyword: 'enum',
        dataPath: '.feesPayableBy',
        schemaPath: '#/properties/feesPayableBy/enum',
        params: {
          allowedValues: ['APPLICANT', 'BENEFICIARY', 'SPLIT']
        },
        message: 'should be equal to one of the allowed values'
      },
      {
        keyword: 'format',
        dataPath: '.expiryDate',
        schemaPath: '#/properties/expiryDate/format',
        params: {
          format: 'date'
        },
        message: `should match format 'date'`
      }
    ]

    const errors = toFormikErrors(ajvErrors)

    const selectedErrorObject = selectCurrentStepErrors(errors, STEP.PARTICIPANTS)

    expect(selectedErrorObject.feesPayableBy).toEqual(errors.feesPayableBy)
    expect(selectedErrorObject.expiryDate).toBeUndefined()
  })
})

describe('fieldToStep', () => {
  it('returns the step for a certain field', () => {
    expect(fieldToStep('applicantId')).toEqual(STEP.PARTICIPANTS)
  })
  it('returns the step for a certain field', () => {
    expect(fieldToStep('transhipmentAllowed')).toEqual(STEP.LC_DETAILS)
  })
})

describe('fieldToLabel', () => {
  it('returns the label for a given field', () => {
    expect(fieldToLabel('currency')).toEqual('Currency')
  })
})

describe('currentStepFields', () => {
  it('returns correct fields for the participants step', () => {
    expect(currentStepFields(STEP.PARTICIPANTS)).toEqual([
      'applicantId',
      'applicantAddress',
      'beneficiaryAddress',
      'issuingBankAddress',
      'beneficiaryBankAddress',
      'applicantCountry',
      'beneficiaryCountry',
      'issuingBankId',
      'issuingBankCountry',
      'beneficiaryBankCountry',
      'applicantContactPerson',
      'beneficiaryContactPerson',
      'issuingBankContactPerson',
      'beneficiaryId',
      'beneficiaryBankId',
      'beneficiaryBankContactPerson',
      'beneficiaryBankRole',
      'feesPayableBy',
      'direct'
    ])
  })
  it('returns correct fields for the lc type step', () => {
    expect(currentStepFields(STEP.LC_TYPE)).toEqual([
      'type',
      'applicableRules',
      'templateType',
      'billOfLadingEndorsement',
      'invoiceRequirement',
      'freeTextLc',
      'issueDueDateDuration',
      'issueDueDateUnit',
      'issueDueDateActive'
    ])
  })
})
