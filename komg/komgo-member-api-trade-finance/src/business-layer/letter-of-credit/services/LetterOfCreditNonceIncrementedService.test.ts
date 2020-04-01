import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { buildFakeLetterOfCredit } from '@komgo/types'

import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents'
import { LetterOfCreditDataAgent } from '../../../data-layer/data-agents'
import { IEvent } from '../../common/IEvent'

import { LetterOfCreditNonceIncrementedService } from './LetterOfCreditNonceIncrementedService'
import { ILetterOfCreditEventService } from './ILetterOfCreditEventService'

const TX_HASH = '0x123456'

const CONTRACT_ADDRESS = '0xAC716460A84B85d774bEa75666ddf0088b024741'

describe('LetterOfCreditNonceIncrementedService', () => {
  let mockDataAgent: jest.Mocked<ILetterOfCreditDataAgent>
  let nonceIncrementedService: ILetterOfCreditEventService

  beforeEach(() => {
    mockDataAgent = createMockInstance(LetterOfCreditDataAgent)
    nonceIncrementedService = new LetterOfCreditNonceIncrementedService(mockDataAgent)
  })

  it('should update nonce', async () => {
    const expectedNonce = 1
    const letterOfCredit = buildFakeLetterOfCredit({
      transactionHash: TX_HASH,
      contractAddress: CONTRACT_ADDRESS
    })

    const rawEvent: IEvent = {
      transactionHash: TX_HASH,
      address: CONTRACT_ADDRESS,
      blockNumber: 1,
      data: '0x123',
      topics: ['0x69']
    }

    const decodedEventMock = {
      nonce: expectedNonce
    }

    mockDataAgent.getByContractAddress.mockImplementation(() => Promise.resolve(letterOfCredit))

    await nonceIncrementedService.doEvent(decodedEventMock, rawEvent)

    expect(mockDataAgent.update).toHaveBeenCalledTimes(1)
    expect(mockDataAgent.update).toHaveBeenCalledWith(
      { staticId: letterOfCredit.staticId },
      {
        ...letterOfCredit,
        nonce: expectedNonce
      }
    )
  })
})
