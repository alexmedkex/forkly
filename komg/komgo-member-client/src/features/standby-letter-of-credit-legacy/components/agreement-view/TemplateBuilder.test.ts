import {
  buildFakeCargo,
  buildFakeStandByLetterOfCreditBase,
  buildFakeStandByLetterOfCredit,
  buildFakeTrade,
  IStandbyLetterOfCredit
} from '@komgo/types'
import { buildTemplate, TemplateInputs } from './TemplateBuilder'
import { fakeCounterparty, fakeMember } from '../../../letter-of-credit-legacy/utils/faker'

describe('TemplateBuilder', () => {
  describe('StandByLetterOfCreditBase', () => {
    it('returns a template with values', () => {
      const letter = buildFakeStandByLetterOfCreditBase()
      const trade = buildFakeTrade()
      const cargo = buildFakeCargo()
      const issuingBank = fakeCounterparty({ isFinancialInstitution: true })
      const beneficiaryBank = fakeMember({ isFinancialInstitution: true })
      const applicant = fakeMember()
      const beneficiary = fakeMember()
      const inputs: TemplateInputs = {
        letter,
        trade,
        cargo,
        issuingBank,
        beneficiaryBank,
        applicant,
        beneficiary
      }
      expect(buildTemplate(inputs)).toEqual({
        amount: '1,000.00',
        applicant: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        availableWith: 'Applicant Name',
        beneficiary: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        beneficiaryBank: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        contractDate: '2019-10-20',
        contractReference: 'CREF-123',
        currency: 'USD',
        expiryDate: '2019-10-11',
        feesPayableBy: 'SPLIT',
        issuingBank: {
          address: 'street city postal code city country',
          issuingBankPostalAddress: '[[ Issuing Bank postal address ]]',
          issuingBankReference: '[[ Issuing Bank reference ]]',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        overrideStandardTemplate: 'Default legal template clauses',
        quantity: '600,000',
        covering: '600,000 PLUS OR MINUS 1.25 PCT BARRELS OF BRENT CRUDE OIL'
      })
    })
    it('returns a template with placeholders', () => {
      const letter = {} as IStandbyLetterOfCredit
      const trade = null
      const cargo = null
      const issuingBank = null
      const beneficiaryBank = null
      const applicant = null
      const beneficiary = null
      const inputs: TemplateInputs = {
        letter,
        trade,
        cargo,
        issuingBank,
        beneficiaryBank,
        applicant,
        beneficiary
      }
      expect(buildTemplate(inputs)).toEqual({
        amount: '[[ amount ]]',
        applicant: {
          address: '[[ Applicant address ]] [[ Applicant city ]] [[ Applicant country ]]',
          name: '[[ Applicant ]]',
          organization: '[[ Applicant ]]'
        },
        availableWith: '[[ Beneficiary Bank ]]',
        beneficiary: {
          address: '[[ Beneficiary address ]] [[ Beneficiary city ]] [[ Beneficiary country ]]',
          name: '[[ Beneficiary ]]',
          organization: '[[ Beneficiary ]]'
        },
        beneficiaryBank: {
          address: '[[ Beneficiary Bank address ]] [[ Beneficiary Bank city ]] [[ Beneficiary Bank country ]]',
          name: '[[ Beneficiary Bank ]]',
          organization: '[[ Beneficiary Bank ]]'
        },
        contractDate: '[[ Contract Date ]]',
        contractReference: '[[ Contract Reference ]]',
        currency: '[[ currency ]]',
        expiryDate: '[[ Expiry Date ]]',
        feesPayableBy: '[[ Fees Payable By ]]',
        covering: '[[ quantity ]] [[ tolerance ]] PCT [[ priceUnit ]] OF [[ grade ]]',
        issuingBank: {
          address: '[[ Issuing Bank address ]] [[ Issuing Bank city ]] [[ Issuing Bank country ]]',
          issuingBankPostalAddress: '[[ Issuing Bank postal address ]]',
          issuingBankReference: '[[ Issuing Bank reference ]]',
          name: '[[ Issuing Bank ]]',
          organization: '[[ Issuing Bank ]]'
        },
        overrideStandardTemplate: '[[ Standard Template ]]',
        quantity: '[[ quantity ]]'
      })
    })
  })

  describe('StandByLetterOfCredit', () => {
    it('returns a template with values', () => {
      const letter = buildFakeStandByLetterOfCredit()
      const cargo = buildFakeCargo()
      const issuingBank = fakeCounterparty({ isFinancialInstitution: true })
      const beneficiaryBank = fakeMember({ isFinancialInstitution: true })
      const applicant = fakeMember()
      const beneficiary = fakeMember()
      const inputs: TemplateInputs = {
        letter,
        cargo,
        issuingBank,
        beneficiaryBank,
        applicant,
        beneficiary
      }
      expect(buildTemplate(inputs)).toEqual({
        amount: '1,000.00',
        applicant: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        availableWith: 'Applicant Name',
        beneficiary: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        beneficiaryBank: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        contractDate: '2019-10-20',
        contractReference: 'CREF-123',
        currency: 'USD',
        expiryDate: '2019-10-11',
        feesPayableBy: 'SPLIT',
        covering: '600,000 PLUS OR MINUS 1.25 PCT BARRELS OF BRENT CRUDE OIL',
        issuingBank: {
          address: 'street city postal code city country',
          issuingBankPostalAddress: '99-97 a street London EC1 000',
          issuingBankReference: 'REF-123',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        overrideStandardTemplate: 'Default legal template clauses',
        quantity: '600,000'
      })
    })

    it('returns a template with values for non BFOET cargo', () => {
      const letter = buildFakeStandByLetterOfCredit()
      const cargo = buildFakeCargo({ grade: 'MY GRADE' })
      const issuingBank = fakeCounterparty({ isFinancialInstitution: true })
      const beneficiaryBank = fakeMember({ isFinancialInstitution: true })
      const applicant = fakeMember()
      const beneficiary = fakeMember()
      const inputs: TemplateInputs = {
        letter,
        cargo,
        issuingBank,
        beneficiaryBank,
        applicant,
        beneficiary
      }
      expect(buildTemplate(inputs)).toEqual({
        amount: '1,000.00',
        applicant: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        availableWith: 'Applicant Name',
        beneficiary: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        beneficiaryBank: {
          address: 'street city postal code city country',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        contractDate: '2019-10-20',
        contractReference: 'CREF-123',
        currency: 'USD',
        expiryDate: '2019-10-11',
        feesPayableBy: 'SPLIT',
        covering: '600,000 PLUS OR MINUS 1.25 PCT BBL OF MY GRADE',
        issuingBank: {
          address: 'street city postal code city country',
          issuingBankPostalAddress: '99-97 a street London EC1 000',
          issuingBankReference: 'REF-123',
          name: 'Applicant Name',
          organization: 'Applicant Name ltd'
        },
        overrideStandardTemplate: 'Default legal template clauses',
        quantity: '600,000'
      })
    })

    it('returns a template with placeholders', () => {
      const letter = {} as IStandbyLetterOfCredit
      const trade = null
      const cargo = null
      const issuingBank = null
      const beneficiaryBank = null
      const applicant = null
      const beneficiary = null
      const inputs: TemplateInputs = {
        letter,
        trade,
        cargo,
        issuingBank,
        beneficiaryBank,
        applicant,
        beneficiary
      }
      expect(buildTemplate(inputs)).toEqual({
        amount: '[[ amount ]]',
        applicant: {
          address: '[[ Applicant address ]] [[ Applicant city ]] [[ Applicant country ]]',
          name: '[[ Applicant ]]',
          organization: '[[ Applicant ]]'
        },
        availableWith: '[[ Beneficiary Bank ]]',
        beneficiary: {
          address: '[[ Beneficiary address ]] [[ Beneficiary city ]] [[ Beneficiary country ]]',
          name: '[[ Beneficiary ]]',
          organization: '[[ Beneficiary ]]'
        },
        beneficiaryBank: {
          address: '[[ Beneficiary Bank address ]] [[ Beneficiary Bank city ]] [[ Beneficiary Bank country ]]',
          name: '[[ Beneficiary Bank ]]',
          organization: '[[ Beneficiary Bank ]]'
        },
        contractDate: '[[ Contract Date ]]',
        contractReference: '[[ Contract Reference ]]',
        currency: '[[ currency ]]',
        expiryDate: '[[ Expiry Date ]]',
        feesPayableBy: '[[ Fees Payable By ]]',
        issuingBank: {
          address: '[[ Issuing Bank address ]] [[ Issuing Bank city ]] [[ Issuing Bank country ]]',
          issuingBankPostalAddress: '[[ Issuing Bank postal address ]]',
          issuingBankReference: '[[ Issuing Bank reference ]]',
          name: '[[ Issuing Bank ]]',
          organization: '[[ Issuing Bank ]]'
        },
        overrideStandardTemplate: '[[ Standard Template ]]',
        quantity: '[[ quantity ]]',
        covering: '[[ quantity ]] [[ tolerance ]] PCT [[ priceUnit ]] OF [[ grade ]]'
      })
    })
  })
})
