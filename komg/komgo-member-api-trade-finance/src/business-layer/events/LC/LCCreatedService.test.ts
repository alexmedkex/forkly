import 'reflect-metadata'

const mockTxHash = '0x123'
const pako = require('pako')

jest.mock('web3-utils', () => {
  return {
    toChecksumAddress: jest.fn(() => mockTxHash)
  }
})

const mockGetRole = jest.fn()

jest.mock('../../util/getCompanyLCRole', () => {
  return {
    getCompanyLCRole: mockGetRole
  }
})

const cacheMock: ILCCacheDataAgent = {
  getLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  saveLC: jest.fn(),
  getLCs: jest.fn(),
  updateLcByReference: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

const rawEventMock = {
  address: '0x0',
  transactionHash: '0x12345'
}

const requestedProcessorMock = {
  processStateTransition: jest.fn()
}

const decodedEventMockBad = {
  data: '{aa{bb}'
}

import { LCCreatedService } from './LCCreatedService'
import { LC_STATE } from './LCStates'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILCEventService } from './ILCEventService'

let lc

describe('LCCreatedService', () => {
  let lcCreatedService: ILCEventService
  let logger

  lc = {
    _id: 1,
    reference: 'REF-123',
    contractAddress: '0x1',
    status: 'requested',
    transactionHash: '0x1234'
  }

  beforeEach(() => {
    lcCreatedService = new LCCreatedService(requestedProcessorMock, cacheMock)
    logger = (lcCreatedService as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  describe('doEvent', () => {
    it('should call saveLC with correct data', async () => {
      const lcCompressed = pako.deflate(JSON.stringify(lc), { to: 'string' })

      const decodedEventMock = {
        data: lcCompressed
      }

      await lcCreatedService.doEvent(lcCompressed, decodedEventMock, rawEventMock)

      expect(cacheMock.updateLcByReference).toHaveBeenCalledWith('REF-123', {
        _id: 1,
        contractAddress: '0x123',
        status: LC_STATE.REQUESTED,
        transactionHash: '0x12345',
        commercialContractDocumentHash: undefined,
        draftLCDocumentHash: undefined,
        reference: 'REF-123',
        nonce: 1
      })
    })

    it('test doEvent() bad data', async () => {
      await lcCreatedService.doEvent(null, decodedEventMockBad, rawEventMock)
      expect(cacheMock.updateLcByReference).toHaveBeenCalledTimes(0)
    })
  })
})
