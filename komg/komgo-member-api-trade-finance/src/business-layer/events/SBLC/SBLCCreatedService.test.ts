import 'reflect-metadata'

import {
  sblcMockDataAgent,
  taskManagerMock,
  notificationManagerMock,
  companyRegistryServiceMock,
  documentManagerMock
} from './testMocks'
import { SBLCCreatedService } from './SBLCCreatedService'
import { IEvent } from '../../common/IEvent'
import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import { ISBLCEventService } from './ISBLCEventService'

const pako = require('pako')

const COMPANY_STATIC_ID = 'companyId123'
const TX_HASH = '0x123456'
const CONTRACT_ADDRESS = '0xAC716460A84B85d774bEa75666ddf0088b024741'

const rawEvent: IEvent = {
  transactionHash: TX_HASH,
  address: CONTRACT_ADDRESS,
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const membersMock = [
  {
    x500Name: {
      CN: 'CompanyName'
    }
  }
]

describe('SBLCCreatedService', () => {
  let sblcCreatedService: ISBLCEventService
  let logger

  beforeEach(() => {
    sblcCreatedService = new SBLCCreatedService(
      sblcMockDataAgent,
      COMPANY_STATIC_ID,
      taskManagerMock,
      notificationManagerMock,
      companyRegistryServiceMock,
      documentManagerMock,
      'urltest'
    )
    logger = (sblcCreatedService as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  describe('doEvent', () => {
    it('should call update with correct data', async () => {
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }

      await sblcCreatedService.doEvent(sblcCompressed, decodedEventMock, rawEvent)

      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
      expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
    })

    it('a task should be created for issuingBank', async () => {
      companyRegistryServiceMock.getMembersByNode = jest.fn().mockImplementationOnce(() => membersMock)
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      sblc.applicantId = 'applicantId'
      sblc.issuingBankId = COMPANY_STATIC_ID
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }

      await sblcCreatedService.doEvent(sblcCompressed, decodedEventMock, rawEvent)

      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
      expect(taskManagerMock.createTask).toHaveBeenCalledTimes(1)
      expect(notificationManagerMock.createNotification).toHaveBeenCalledTimes(0)
    })

    it('a notif should be created for beneficiary', async () => {
      companyRegistryServiceMock.getMembersByNode = jest.fn().mockImplementationOnce(() => membersMock)
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      sblc.applicantId = 'applicantId'
      sblc.beneficiaryId = COMPANY_STATIC_ID
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }

      await sblcCreatedService.doEvent(sblcCompressed, decodedEventMock, rawEvent)

      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
      expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
      expect(notificationManagerMock.createNotification).toHaveBeenCalledTimes(1)
    })
  })
})
