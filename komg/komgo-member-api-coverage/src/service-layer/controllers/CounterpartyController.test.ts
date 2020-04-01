// tslint:disable-next-line:no-implicit-dependencies
const MockRequest = require('mock-express-request')
import 'reflect-metadata'
import { CounterpartyController } from './CounterpartyController'
import moment = require('moment')

import { ICounterpartyService } from '../../business-layer/counterparty/ICounterpartyService'

let counterpartyService: jest.Mocked<ICounterpartyService>
let controller: CounterpartyController

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
    controller = new CounterpartyController(counterpartyService)
  })

  describe('.find', () => {
    it('returns a counterparty', async () => {
      await controller.find('{}')
      expect(counterpartyService.getCounterparties).toHaveBeenCalledTimes(1)
    })

    it('find with empty filter', async () => {
      await controller.find(null)
      expect(counterpartyService.getCounterparties).toBeCalledWith({})
    })

    it('find with filter', async () => {
      await controller.find(JSON.stringify({ node: 1 }))
      expect(counterpartyService.getCounterparties).toBeCalledWith({ node: 1 })
    })
  })

  describe('.findAll', () => {
    it('returns a counterparty', async () => {
      await controller.findAll('{}')
      expect(counterpartyService.getConnectedCounterpartiesWithRequests).toHaveBeenCalledTimes(1)
    })

    it('find with empty filter', async () => {
      await controller.findAll(null)
      expect(counterpartyService.getConnectedCounterpartiesWithRequests).toBeCalledWith({})
    })

    it('find with filter', async () => {
      await controller.findAll(JSON.stringify({ node: 1 }))
      expect(counterpartyService.getConnectedCounterpartiesWithRequests).toBeCalledWith({ node: 1 })
    })
  })

  describe('.add', () => {
    it('add', async () => {
      await controller.add('1111')
      expect(counterpartyService.addCounterparty).toHaveBeenCalledTimes(1)
    })

    it('add', async () => {
      await controller.resend('1111')
      expect(counterpartyService.resendCounterparty).toHaveBeenCalledTimes(1)
    })

    it('add list', async () => {
      await controller.addList({ companyIds: ['1111'] })
      expect(counterpartyService.addCounterpartyList).toHaveBeenCalledTimes(1)
    })
  })

  describe('.approve', () => {
    it('approve', async () => {
      await controller.approve('1111')
      expect(counterpartyService.approveCounterparty).toHaveBeenCalledTimes(1)
    })
  })

  describe('.reject', () => {
    it('reject', async () => {
      await controller.reject('1111')
      expect(counterpartyService.rejectCounterparty).toHaveBeenCalledTimes(1)
    })
  })

  describe('.autoAdd', () => {
    it('.autoAdd', async () => {
      await controller.autoAddList({ companyIds: ['1111'] })
      expect(counterpartyService.autoAddCountepartyList).toHaveBeenCalledTimes(1)
    })
  })

  describe('.getRequests', () => {
    it('getRequest', async () => {
      await controller.getRequest('requestId')
      expect(counterpartyService.getCounterpartyRequest).toHaveBeenCalledTimes(1)
    })
  })
})
