// tslint:disable-next-line:no-implicit-dependencies
const MockRequest = require('mock-express-request')
import 'reflect-metadata'
import { CompanyController } from './CompanyController'
import moment = require('moment')

let counterpartyService: ICounterpartyService
let controller: CompanyController

import { ICounterpartyService } from '../../business-layer/counterparty/ICounterpartyService'

describe('CounterpartyController', () => {
  beforeEach(() => {
    counterpartyService = {
      getCounterpartyRequest: jest.fn(),
      addRequest: jest.fn(),
      addCounterparty: jest.fn(),
      addCounterpartyList: jest.fn(),
      approveCounterparty: jest.fn(),
      requestApproved: jest.fn(),
      rejectCounterparty: jest.fn(),
      requestRejected: jest.fn(),
      getCounterparties: jest.fn(),
      getConnectedCounterpartiesWithRequests: jest.fn(),
      getCompanies: jest.fn(),
      autoAddCountepartyList: jest.fn(),
      resendCounterparty: jest.fn()
    }
    controller = new CompanyController(counterpartyService)
  })

  describe('.get', () => {
    it('returns a company', async () => {
      await controller.find('1111')
      expect(counterpartyService.getCompanies).toHaveBeenCalledTimes(1)
    })

    it('get bad request on getCompany', async () => {
      await expect(controller.find('{')).rejects.toMatchObject({
        status: 400
      })
    })
  })
})
