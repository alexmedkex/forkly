import { buildFakeDepositLoanRequest, ISaveDepositLoan } from '@komgo/types'
import 'reflect-metadata'
import { DepositLoanValidationService } from './DepositLoanValidationService'
import { ICurrencyAndPeriod } from '../../data-layer/models/IDepositLoanRequestDocument'

let validationService: DepositLoanValidationService

describe('DepositLoanValidationService', () => {
  beforeEach(() => {
    validationService = new DepositLoanValidationService()
  })

  describe('.validate', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should validate desposit create request', async () => {
      const depositLoan = buildFakeDepositLoanRequest()
      try {
        validationService.validateDepositLoan({
          ...depositLoan,
          sharedWith: [],
          appetite: true
        } as ISaveDepositLoan)
      } catch (err) {
        expect(err.message).toEqual(`Invalid ${depositLoan.type} format.`)
      }
    })

    it('should validate desposit request', async () => {
      const depositLoan = buildFakeDepositLoanRequest()

      try {
        validationService.validateDepositLoanRequest({
          ...depositLoan,
          sharedWith: [],
          appetite: true
        } as ICurrencyAndPeriod)
      } catch (err) {
        expect(err.message).toEqual(`Invalid ${depositLoan.type} format.`)
      }
    })
  })
})
