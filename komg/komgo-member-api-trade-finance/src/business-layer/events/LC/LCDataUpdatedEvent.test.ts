import 'reflect-metadata'
import { LCDataUpdatedEvent } from './LCDataUpdatedEvent'
import { LC_CONTRACT_DATA_FIELDS } from './LCContractDataFields'

const web3Utils = require('web3-utils')

const cacheMock = {
  saveLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  getLC: jest.fn(),
  getLCReferenceId: jest.fn(),
  getLCs: jest.fn()
}

const rawEventMock = {
  address: '0x0',
  transactionHash: '0x12345'
}

const decodedEventMock = {
  data: '{}',
  fieldName: '0x123'
}

let lcDataUpdatedEvent
let logger

const lc = {
  _id: 1,
  contractAddress: '0x1',
  status: 'requested',
  transactionHash: '0x1234'
}

describe('LCDataUpdatedEvent', () => {
  beforeEach(() => {
    lcDataUpdatedEvent = new LCDataUpdatedEvent(cacheMock)
    logger = (lcDataUpdatedEvent as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })
  describe('doEvent', () => {
    it('should log info', async () => {
      await lcDataUpdatedEvent.doEvent(lc, decodedEventMock, rawEventMock)
      expect(logger.info).toHaveBeenCalledTimes(3)
    })

    it('should exec all registered handlers', async () => {
      const registeredHandlers = [
        LC_CONTRACT_DATA_FIELDS.DATA_BENEFICIARY_COMMENTS,
        LC_CONTRACT_DATA_FIELDS.DATA_ADVISING_BANK_COMMENTS,
        LC_CONTRACT_DATA_FIELDS.DATA_ISSUING_BANK_COMMENTS,
        LC_CONTRACT_DATA_FIELDS.SWIFT_LC_DOCUMENT_REFERENCE
      ]

      for (const dataKey of registeredHandlers) {
        cacheMock.updateField.mockClear()

        await lcDataUpdatedEvent.doEvent(lc, { fieldName: web3Utils.stringToHex(dataKey) }, rawEventMock)

        expect(cacheMock.updateField).toHaveBeenCalled()
      }
    })
  })
})
