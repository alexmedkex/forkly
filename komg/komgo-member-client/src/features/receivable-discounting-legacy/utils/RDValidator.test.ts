import {
  buildFakeReceivablesDiscountingBase,
  buildFakeReceivablesDiscountingExtended,
  Currency,
  IReceivablesDiscountingBase,
  buildFakeQuoteBase,
  RequestType,
  DiscountingType,
  IQuoteBase
} from '@komgo/types'
import { FormikErrors } from 'formik'
import { RD_DEFAULT_VERSION, rdDiscountingSchema, rdQuoteSchema } from './constants'
import { decorateRDForInitialValues, createReceivableDiscountingEditValidator } from './edit-utils'
import { ALL_VALIDATION_FIELDS, RDValidator } from './RDValidator'
import Ajv from 'ajv'

describe('RDValidator', () => {
  let mockValidator: jest.Mocked<Partial<Ajv.Ajv>>
  const ajvErrors = [
    {
      keyword: 'required',
      dataPath: '',
      schemaPath: '#/required',
      params: { missingProperty: 'myProperty' },
      message: "should have required property 'myProperty'"
    }
  ]
  const formattedErrors = {
    myProperty: "'myProperty' should not be empty"
  }

  beforeEach(() => {
    mockValidator = {
      validate: jest.fn(),
      errors: []
    }
  })

  it('should use custom validator if passed', () => {
    mockValidator.validate.mockReturnValueOnce(true)

    const rdValidator = new RDValidator(mockValidator as any)

    rdValidator.validateReceivableDiscounting({})
    expect(mockValidator.validate).toHaveBeenCalled()
  })

  it('should define a validator if none is passed', () => {
    mockValidator.validate.mockReturnValueOnce(true)

    const rdValidator = new RDValidator()

    rdValidator.validateReceivableDiscounting({})
    expect(mockValidator.validate).not.toHaveBeenCalled()
  })

  describe('validateReceivableDiscounting', () => {
    let rdValidator: RDValidator
    let mockRD: IReceivablesDiscountingBase

    beforeEach(() => {
      rdValidator = new RDValidator(mockValidator as any)
      mockRD = buildFakeReceivablesDiscountingBase()
    })

    it('should validate with correct schema and values', () => {
      mockValidator.validate.mockReturnValueOnce(true)

      const errors = rdValidator.validateReceivableDiscounting(mockRD)

      expect(mockValidator.validate).toHaveBeenCalledWith(rdDiscountingSchema, mockRD)
      expect(errors).toMatchObject({})
    })

    it('should return formatted errors if validation fails', () => {
      mockValidator.validate.mockImplementation(() => {
        mockValidator.errors = ajvErrors
        return false
      })

      const errors = rdValidator.validateReceivableDiscounting(mockRD)

      expect(errors).toMatchObject(formattedErrors)
    })
  })

  describe('validateQuoteSubmission', () => {
    let rdValidator: RDValidator
    let mockQuote: IQuoteBase
    let rd: any

    beforeEach(() => {
      rdValidator = new RDValidator(mockValidator as any)
      rd = {
        requestType: RequestType.Discount,
        discountingType: DiscountingType.WithoutRecourse
      }
      mockQuote = buildFakeQuoteBase({}, rd.requestType, rd.discountingType)
    })

    it('should validate with correct schema and values if RD has no numberOfDaysDiscounting', () => {
      mockValidator.validate.mockReturnValueOnce(true)

      const values = { ...mockQuote, rdId: 'rdId' }
      const errors = rdValidator.validateQuoteSubmission(values, rd)

      expect(mockValidator.validate).toHaveBeenCalledWith(rdQuoteSchema, {
        ...values,
        requestType: rd.requestType,
        discountingType: rd.discountingType,
        daysOfDiscountingProvided: false
      })
      expect(errors).toMatchObject({})
    })

    it('should validate with correct schema and values if RD has numberOfDaysDiscounting', () => {
      mockValidator.validate.mockReturnValueOnce(true)
      rd.numberOfDaysDiscounting = 30

      const values = { ...mockQuote, rdId: 'rdId' }
      const errors = rdValidator.validateQuoteSubmission(values, rd)

      expect(mockValidator.validate).toHaveBeenCalledWith(rdQuoteSchema, {
        ...values,
        requestType: rd.requestType,
        discountingType: rd.discountingType,
        daysOfDiscountingProvided: true
      })
      expect(errors).toMatchObject({})
    })

    it('should return formatted errors if validation fails', () => {
      mockValidator.validate.mockImplementation(() => {
        mockValidator.errors = ajvErrors
        return false
      })

      const errors = rdValidator.validateQuoteSubmission({ ...mockQuote, rdId: 'rdId' }, rd)

      expect(errors).toMatchObject(formattedErrors)
    })
  })
})

describe('validate update RD', () => {
  describe('decorateRDForInitialValues', () => {
    it('removes _id, tradeReference._id, staticId, createdAt and updatedAt from existing rd', () => {
      const fakeRd = buildFakeReceivablesDiscountingExtended() as any

      fakeRd._id = 'test_id'
      fakeRd.tradeReference._id = 'test_id'
      fakeRd.createdAt = 'test_created_at'
      fakeRd.updatedAt = 'test_updated_at'
      fakeRd.staticId = 'test_static_id'

      expect((decorateRDForInitialValues(fakeRd) as any)._id).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).tradeReference._id).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).updatedAt).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).createdAt).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).staticId).not.toBeDefined()
    })

    it('reformats dates', () => {
      const fakeRd = {
        ...buildFakeReceivablesDiscountingExtended(),
        dateOfPerformance: '2019-03-24T18:26:22.561Z',
        discountingDate: '2019-03-24T18:26:22.561Z'
      }

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          dateOfPerformance: '2019-03-24',
          discountingDate: '2019-03-24'
        })
      )
    })

    it('reformats dates only if they are present', () => {
      const fakeRd = {
        ...buildFakeReceivablesDiscountingExtended(),
        discountingDate: '2019-03-24T18:26:22.561Z'
      }
      delete fakeRd.dateOfPerformance

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          dateOfPerformance: undefined,
          discountingDate: '2019-03-24'
        })
      )
    })

    it('adds default version', () => {
      const fakeRd = buildFakeReceivablesDiscountingExtended()
      fakeRd.version = undefined

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          version: RD_DEFAULT_VERSION
        })
      )
    })

    it('does not override existing version', () => {
      const fakeRd = buildFakeReceivablesDiscountingExtended()
      fakeRd.version = 10

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          version: 10
        })
      )
    })
  })
})

describe('createReceivableDiscountingEditValidator', () => {
  let validate: (editedValues: IReceivablesDiscountingBase) => FormikErrors<IReceivablesDiscountingBase>
  let values: IReceivablesDiscountingBase

  beforeEach(() => {
    values = buildFakeReceivablesDiscountingBase()
    validate = createReceivableDiscountingEditValidator(values)
  })

  it('returns an error for all fields if nothing has changed', () => {
    expect(validate(values)[ALL_VALIDATION_FIELDS]).toMatchInlineSnapshot(`"You have not made any changes"`)
  })

  it('does not allow changing uneditable fields', () => {
    values.currency = Currency.USD
    values.advancedRate = 15
    values.numberOfDaysDiscounting = 25
    const edited = {
      ...values,
      advancedRate: 10,
      currency: Currency.GBP,
      numberOfDaysDiscounting: 20,
      tradeReference: {} as any
    }

    expect(validate(edited)).toEqual(
      expect.objectContaining({
        advancedRate: '"advancedRate" cannot be edited',
        currency: '"currency" cannot be edited',
        numberOfDaysDiscounting: '"numberOfDaysDiscounting" cannot be edited',
        tradeReference: '"tradeReference" cannot be edited'
      })
    )
  })
})
