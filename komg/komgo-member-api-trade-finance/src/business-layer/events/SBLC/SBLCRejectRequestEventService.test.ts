import 'reflect-metadata'
import { ISBLCEventService } from './ISBLCEventService'
import {
  sblcMockDataAgent,
  taskManagerMock,
  notificationManagerMock,
  companyRegistryServiceMock,
  documentManagerMock
} from './testMocks'
import { SBLCRejectRequestEventService } from './SBLCRejectRequestEventService'
import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import { IEvent } from '../../common/IEvent'

import { TaskStatus } from '@komgo/notification-publisher'
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

const tasks = [
  {
    status: TaskStatus.ToDo
  }
]

describe('SBLCRejectRequestEventService', () => {
  let sblcRejectRequestEventService: ISBLCEventService
  let logger

  beforeEach(() => {
    sblcRejectRequestEventService = new SBLCRejectRequestEventService(
      sblcMockDataAgent,
      COMPANY_STATIC_ID,
      taskManagerMock,
      notificationManagerMock,
      companyRegistryServiceMock,
      documentManagerMock,
      'urltest'
    )
    logger = (sblcRejectRequestEventService as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
    companyRegistryServiceMock.getMembersByNode = jest.fn().mockImplementationOnce(() => membersMock)
  })

  describe('doEvent', () => {
    it('should call update', async () => {
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }
      await sblcRejectRequestEventService.doEvent(sblc, decodedEventMock, rawEvent)
      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
    })

    it('should create a notification for applicant', async () => {
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      sblc.applicantId = COMPANY_STATIC_ID
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }
      await sblcRejectRequestEventService.doEvent(sblc, decodedEventMock, rawEvent)
      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(notificationManagerMock.createNotification).toHaveBeenCalledTimes(1)
      expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
      expect(taskManagerMock.updateTaskStatus).toHaveBeenCalledTimes(0)
    })

    it('should solve task for issuing bank', async () => {
      taskManagerMock.getTasks = jest.fn().mockImplementationOnce(() => tasks)
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      sblc.issuingBankId = COMPANY_STATIC_ID
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }
      await sblcRejectRequestEventService.doEvent(sblc, decodedEventMock, rawEvent)
      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(notificationManagerMock.createNotification).toHaveBeenCalledTimes(0)
      expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
      expect(taskManagerMock.updateTaskStatus).toHaveBeenCalledTimes(1)
    })

    it('should create a notification for beneficiary', async () => {
      taskManagerMock.getTasks = jest.fn().mockImplementationOnce(() => tasks)
      const sblc = buildFakeStandByLetterOfCredit({ transactionHash: TX_HASH, contractAddress: CONTRACT_ADDRESS })
      sblc.beneficiaryId = COMPANY_STATIC_ID
      const sblcCompressed = pako.deflate(JSON.stringify(sblc), { to: 'string' })

      const decodedEventMock = {
        data: sblcCompressed
      }
      await sblcRejectRequestEventService.doEvent(sblc, decodedEventMock, rawEvent)
      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(notificationManagerMock.createNotification).toHaveBeenCalledTimes(1)
      expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
      expect(taskManagerMock.updateTaskStatus).toHaveBeenCalledTimes(0)
    })
  })
})
