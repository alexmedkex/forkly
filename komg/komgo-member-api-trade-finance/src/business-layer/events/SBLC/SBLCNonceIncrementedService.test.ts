import 'reflect-metadata'

import { ISBLCDataAgent } from '../../../data-layer/data-agents'

import { SBLCNonceIncrementedService } from './SBLCNonceIncrementedService'
import { IEvent } from '../../common/IEvent'
import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import { ISBLCEventService } from './ISBLCEventService'

const pako = require('pako')

const TX_HASH = '0x123456'
const CONTRACT_ADDRESS = '0xAC716460A84B85d774bEa75666ddf0088b024741'

const sblcMockDataAgent: ISBLCDataAgent = {
  getByContractAddress: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  getNonce: jest.fn()
}

const rawEvent: IEvent = {
  transactionHash: TX_HASH,
  address: CONTRACT_ADDRESS,
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

describe('SBLCNonceIncrementedService', () => {
  let sblcNonceIncrementedService: ISBLCEventService
  let logger

  beforeEach(() => {
    sblcNonceIncrementedService = new SBLCNonceIncrementedService(sblcMockDataAgent)
    logger = (sblcNonceIncrementedService as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  describe('doEvent', () => {
    it('should call update with correct data', async () => {
      const expectedNonce = 1
      const sblc = buildFakeStandByLetterOfCredit({
        transactionHash: TX_HASH,
        contractAddress: CONTRACT_ADDRESS
      })

      const decodedEventMock = {
        nonce: expectedNonce
      }

      await sblcNonceIncrementedService.doEvent(sblc, decodedEventMock, rawEvent)

      expect(sblcMockDataAgent.update).toHaveBeenCalledTimes(1)
      expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
    })
  })
})
