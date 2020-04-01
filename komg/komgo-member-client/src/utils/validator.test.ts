import { toFormikErrors } from '../utils/validator'

describe('validator', () => {
  describe('toFormikErrors', () => {
    describe('converts type', () => {
      it('required', () => {
        const errors = [
          {
            keyword: 'required',
            dataPath: '',
            schemaPath: '#/required',
            params: {
              missingProperty: 'direct'
            },
            message: "'direct' should not be empty"
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          direct: "'direct' should not be empty"
        })
      })

      it('enum', () => {
        const errors = [
          {
            keyword: 'enum',
            dataPath: '.feesPayableBy',
            schemaPath: '#/properties/feesPayableBy/enum',
            params: {
              allowedValues: ['APPLICANT', 'BENEFICIARY', 'SPLIT']
            },
            message: 'should be equal to one of the allowed values'
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          feesPayableBy:
            "'feesPayableBy' should be equal to one of the allowed values (APPLICANT or BENEFICIARY or SPLIT)"
        })
      })

      it('format', () => {
        const errors = [
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
        expect(toFormikErrors(errors)).toEqual({
          expiryDate: "'expiryDate' should match format YYYY-MM-DD"
        })
      })
      it('if', () => {
        const errors = [
          {
            keyword: 'if',
            dataPath: '',
            schemaPath: '#/if',
            params: { failingKeyword: 'then' },
            message: `should match "then" schema`
          }
        ]
        expect(toFormikErrors(errors)).toEqual({})
      })
      it('pattern', () => {
        const errors = [
          {
            keyword: 'pattern',
            dataPath: '.expiryPlace',
            schemaPath: '#/properties/expiryPlace/pattern',
            params: { pattern: '^(.+)$' },
            message: `should match pattern "^(.+)$"`
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          expiryPlace: `'expiryPlace' should match pattern "^(.+)$"`
        })
      })
      it('type', () => {
        const errors = [
          {
            keyword: 'type',
            dataPath: '.documentPresentationDeadlineDays',
            schemaPath: '#/properties/documentPresentationDeadlineDays/type',
            params: { type: 'integer' },
            message: 'should be integer'
          }
        ]

        expect(toFormikErrors(errors)).toEqual({
          documentPresentationDeadlineDays: `'documentPresentationDeadlineDays' should be integer`
        })
      })
      it('minimum', () => {
        const errors = [
          {
            keyword: 'minimum',
            dataPath: '.documentPresentationDeadlineDays',
            schemaPath: '#/properties/documentPresentationDeadlineDays/minimum',
            params: {
              comparison: '>=',
              exclusive: false,
              limit: 0
            },
            message: 'should be >= 0'
          }
        ]

        expect(toFormikErrors(errors)).toEqual({
          documentPresentationDeadlineDays: `'documentPresentationDeadlineDays' should be greater than or equal to 0`
        })
      })
      it('exclusiveMinimum', () => {
        const errors = [
          {
            keyword: 'exclusiveMinimum',
            dataPath: '.invoiceAmount',
            schemaPath: '#/properties/invoiceAmount/exclusiveMinimum',
            params: {
              comparison: '>',
              exclusive: true,
              limit: 0
            },
            message: 'should be > 0'
          }
        ]

        expect(toFormikErrors(errors)).toEqual({
          invoiceAmount: `'invoiceAmount' should be strictly greater than 0`
        })
      })

      it('maxLength', () => {
        const errors = [
          {
            keyword: 'maxLength',
            dataPath: '.applicantContactPerson',
            schemaPath: '#/properties/applicantContactPerson/maxLength',
            params: { limit: 60 },
            message: 'should NOT be longer than 60 characters'
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          applicantContactPerson: "'applicantContactPerson' should NOT be longer than 60 characters"
        })
      })
      it('minLength', () => {
        const errors = [
          {
            keyword: 'minLength',
            dataPath: '.LOI',
            schemaPath: '#/properties/LOI/minLength',
            params: { limit: 1 },
            message: 'should NOT be shorter than 1 characters'
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          LOI: "'LOI' should NOT be shorter than 1 characters"
        })
      })
      it('minItems', () => {
        const errors = [
          {
            keyword: 'minItems',
            dataPath: '.diffs',
            schemaPath: '#/properties/diffs/minItems',
            params: { limit: 1 },
            message: 'should NOT have fewer than 1 items'
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          diffs: "'diffs' should NOT have fewer than 1 items"
        })
      })
      it('nested objects', () => {
        const errors = [
          {
            dataPath: '.financialInstrumentInfo',
            keyword: 'required',
            message: "should have required property 'financialInstrumentIssuerName'",
            params: { missingProperty: 'financialInstrumentIssuerName' },
            schemaPath: '#/properties/financialInstrumentInfo/required'
          }
        ]
        expect(toFormikErrors(errors)).toEqual({
          'financialInstrumentInfo.financialInstrumentIssuerName':
            "'financialInstrumentInfo.financialInstrumentIssuerName' should not be empty"
        })
      })
    })
  })
})
