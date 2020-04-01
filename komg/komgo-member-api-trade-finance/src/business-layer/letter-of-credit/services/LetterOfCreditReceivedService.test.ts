import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'
import { randomHex } from 'web3-utils'

import { buildFakeLetterOfCredit, ILetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'

import { ILetterOfCreditDataAgent, LetterOfCreditDataAgent } from '../../../data-layer/data-agents'

import { soliditySha3 } from '../../common/HashFunctions'
import { removeNullsAndUndefined } from '../../util'

import { ILetterOfCreditPartyActionProcessor } from '../processors/ILetterOfCreditPartyActionProcessor'
import { LetterOfCreditPartyActionProcessor } from '../processors/LetterOfCreditPartyActionProcessor'

import { ILetterOfCreditReceivedService } from './ILetterOfCreditReceivedService'
import { LetterOfCreditReceivedService } from './LetterOfCreditReceivedService'

describe('LetterOfCreditReceivedService', () => {
  let letterOfCreditReceivedService: ILetterOfCreditReceivedService
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let mockLetterOfCreditDataAgent: jest.Mocked<ILetterOfCreditDataAgent>
  let mockPartyActionProcessor: ILetterOfCreditPartyActionProcessor
  let transactionHash: string
  beforeEach(() => {
    letterOfCredit = buildFakeLetterOfCredit()
    mockPartyActionProcessor = createMockInstance(LetterOfCreditPartyActionProcessor)
    letterOfCredit.templateInstance.bindings = {}
    mockLetterOfCreditDataAgent = createMockInstance(LetterOfCreditDataAgent)
    letterOfCreditReceivedService = new LetterOfCreditReceivedService(
      mockLetterOfCreditDataAgent,
      mockPartyActionProcessor
    )
  })

  describe('processEvent', () => {
    it('has letter of credit in DB + hash is VALID, then it updates to Requested', async () => {
      const lcCopy = {
        ...letterOfCredit
      }

      const lcCopyForHashing = { ...lcCopy }
      delete lcCopyForHashing.transactionHash
      delete lcCopyForHashing.status

      const hashedData = soliditySha3(JSON.stringify(removeNullsAndUndefined(lcCopyForHashing)))

      const expectedLetterOfCredit = { ...lcCopy, hashedData }

      mockLetterOfCreditDataAgent.getByTransactionHash.mockImplementation(() => expectedLetterOfCredit)

      await letterOfCreditReceivedService.processEvent(lcCopy)

      expect(mockLetterOfCreditDataAgent.update).toHaveBeenCalledWith(
        {
          transactionHash: lcCopy.transactionHash
        },
        {
          ...lcCopy,
          status: LetterOfCreditStatus.Requested
        }
      )
      expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalled()
      expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledTimes(1)
      expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledWith(expectedLetterOfCredit)
    })

    it('has letter of credit in DB but without contract addres, then it throws an error', async () => {
      const expectedLetterOfCreditWithoutContractAddress = { ...letterOfCredit, contractAddress: undefined }

      mockLetterOfCreditDataAgent.getByTransactionHash.mockImplementation(
        () => expectedLetterOfCreditWithoutContractAddress
      )

      try {
        await letterOfCreditReceivedService.processEvent(letterOfCredit)
      } catch (error) {
        expect(error).toEqual(new Error('Existing letter of credit does not have contract address'))
      }
    })

    it('should throw an error if the data agent call fails', async () => {
      const expectedError = new Error('Invalid data call')
      mockLetterOfCreditDataAgent.getByTransactionHash.mockImplementation(() => {
        throw expectedError
      })

      try {
        await letterOfCreditReceivedService.processEvent(letterOfCredit)
      } catch (error) {
        expect(error).toEqual(expectedError)
      }
    })

    it('has letter of credit in DB + hash is INVALID, then it updates to VerificationFailed', async () => {
      const lcWithInvalidHash = {
        ...letterOfCredit,
        type: 'invalid'
      }

      mockLetterOfCreditDataAgent.getByTransactionHash.mockImplementation(() => lcWithInvalidHash)

      await letterOfCreditReceivedService.processEvent(letterOfCredit)

      expect(mockLetterOfCreditDataAgent.update).toHaveBeenCalledWith(
        {
          transactionHash: letterOfCredit.transactionHash
        },
        {
          status: LetterOfCreditStatus.Requested_Verification_Failed
        }
      )
      expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledTimes(0)
    })

    it('does not have a letter of credit in DB, then it saves as VerificationPending', async () => {
      mockLetterOfCreditDataAgent.getByTransactionHash.mockImplementation(() => undefined)

      await letterOfCreditReceivedService.processEvent(letterOfCredit)

      const expectedLetterOfCredit = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.Requested_Verification_Pending
      }

      expect(mockLetterOfCreditDataAgent.save).toHaveBeenCalledWith(expectedLetterOfCredit)
      expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledTimes(0)
    })
  })
})
