import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { buildFakeLetterOfCredit, ILetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'

import { ILetterOfCreditDataAgent, LetterOfCreditDataAgent } from '../../../data-layer/data-agents'
import { soliditySha3 } from '../../common/HashFunctions'

import { ILetterOfCreditPartyActionProcessor } from '../processors/ILetterOfCreditPartyActionProcessor'
import { LetterOfCreditPartyActionProcessor } from '../processors/LetterOfCreditPartyActionProcessor'

import { LetterOfCreditTransitionService } from './LetterOfCreditTransitionService'
import { removeNullsAndUndefined } from '../../util'

const Web3EthAbi = require('web3-eth-abi')

const TX_HASH = '0x123456'

const CONTRACT_ADDRESS = '0xAC716460A84B85d774bEa75666ddf0088b024741'

const when = describe

describe('LetterOfCreditTransitionService tests', () => {
  const REQUEST_REJECTED_STATE = soliditySha3('request rejected')
  const ISSUED_STATE = soliditySha3('issued')

  let mockDataAgent: jest.Mocked<ILetterOfCreditDataAgent>
  let letterOfCreditTransitionService: LetterOfCreditTransitionService
  let mockPartyActionsProcessor: jest.Mocked<ILetterOfCreditPartyActionProcessor>
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>

  beforeEach(() => {
    letterOfCredit = buildFakeLetterOfCredit({
      transactionHash: TX_HASH,
      contractAddress: CONTRACT_ADDRESS
    })
    mockDataAgent = createMockInstance(LetterOfCreditDataAgent)
    mockPartyActionsProcessor = createMockInstance(LetterOfCreditPartyActionProcessor)
    letterOfCreditTransitionService = new LetterOfCreditTransitionService(mockDataAgent, mockPartyActionsProcessor)
  })

  describe('doEvent', () => {
    let letterOfCreditOnRequestRejected: ILetterOfCredit<IDataLetterOfCredit>

    describe('request rejected', () => {
      when('rabbitMQ message was received', () => {
        beforeEach(() => {
          letterOfCreditOnRequestRejected = {
            ...letterOfCredit,
            status: LetterOfCreditStatus.RequestRejected_Pending
          }
          mockDataAgent.getByContractAddress.mockImplementation(() => Promise.resolve(letterOfCreditOnRequestRejected))
        })

        it('should save the letter of credit status with status = LetterOfCreditStatus.RequestRejected', async () => {
          const requestRejectedEvent = buildEventObject(
            ['string', 'bytes32', 'uint256'],
            ['Transition', REQUEST_REJECTED_STATE, 4],
            '0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28', // web3.utils.soliditySha3("LetterOfCredit")
            TX_HASH,
            CONTRACT_ADDRESS
          )

          const decodedRequestRejectedEvent = {
            stateId: REQUEST_REJECTED_STATE
          }

          await letterOfCreditTransitionService.doEvent(decodedRequestRejectedEvent, requestRejectedEvent)

          expect(mockDataAgent.update).toHaveBeenCalled()
          expect(mockDataAgent.update).toHaveBeenCalledTimes(1)
          expect(mockDataAgent.update).toHaveBeenCalledWith(
            { staticId: letterOfCreditOnRequestRejected.staticId },
            {
              ...letterOfCreditOnRequestRejected,
              status: LetterOfCreditStatus.RequestRejected
            }
          )

          expect(mockPartyActionsProcessor.executePartyActions).toHaveBeenCalled()
          expect(mockPartyActionsProcessor.executePartyActions).toHaveBeenCalledTimes(1)
          expect(mockPartyActionsProcessor.executePartyActions).toHaveBeenCalledWith({
            ...letterOfCreditOnRequestRejected,
            status: LetterOfCreditStatus.RequestRejected
          })
        })
      })

      when('rabbitMQ message has not been received', () => {
        beforeEach(() => {
          letterOfCreditOnRequestRejected = {
            ...letterOfCredit,
            status: LetterOfCreditStatus.Requested
          }
          mockDataAgent.getByContractAddress.mockImplementation(() => Promise.resolve(letterOfCreditOnRequestRejected))
        })

        it('should save the letter of credit status with status = LetterOfCreditStatus.RequestRejected_Pending', async () => {
          const requestRejectedEvent = buildEventObject(
            ['string', 'bytes32', 'uint256'],
            ['Transition', REQUEST_REJECTED_STATE, 4],
            '0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28', // web3.utils.soliditySha3("LetterOfCredit")
            TX_HASH,
            CONTRACT_ADDRESS
          )

          const decodedRequestRejectedEvent = {
            stateId: REQUEST_REJECTED_STATE
          }

          await letterOfCreditTransitionService.doEvent(decodedRequestRejectedEvent, requestRejectedEvent)

          expect(mockDataAgent.update).toHaveBeenCalled()
          expect(mockDataAgent.update).toHaveBeenCalledTimes(1)
          expect(mockDataAgent.update).toHaveBeenCalledWith(
            { staticId: letterOfCreditOnRequestRejected.staticId },
            {
              ...letterOfCredit,
              status: LetterOfCreditStatus.RequestRejected_Pending
            }
          )
        })
      })
    })

    describe('issued', () => {
      let issuedEvent: {}
      let decodedIssuedEvent: {}
      let letterOfCreditOnIssued: ILetterOfCredit<IDataLetterOfCredit>

      when('rabbitMQ message has NOT been received', () => {
        beforeEach(() => {
          letterOfCreditOnIssued = {
            ...letterOfCredit,
            status: LetterOfCreditStatus.Requested
          }

          const letterOfCreditWithStateHash = soliditySha3(
            JSON.stringify(removeNullsAndUndefined(letterOfCreditOnIssued))
          )

          issuedEvent = buildEventObject(
            ['string', 'bytes32', 'bytes32', 'uint256'],
            ['TransitionWithData', ISSUED_STATE, letterOfCreditWithStateHash, 4],
            '0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28', // web3.utils.soliditySha3("LetterOfCredit")
            TX_HASH,
            CONTRACT_ADDRESS
          )

          decodedIssuedEvent = {
            stateId: ISSUED_STATE,
            _dataHash: letterOfCreditWithStateHash
          }
        })

        it('should save the letter of credit as Issued_Verification_Pending', async () => {
          mockDataAgent.getByContractAddress.mockImplementation(() => Promise.resolve(letterOfCredit))

          await letterOfCreditTransitionService.doEvent(decodedIssuedEvent, issuedEvent)

          expect(mockDataAgent.update).toHaveBeenCalled()
          expect(mockDataAgent.update).toHaveBeenCalledTimes(1)
          expect(mockDataAgent.update).toHaveBeenCalledWith(
            { staticId: letterOfCreditOnIssued.staticId },
            {
              ...letterOfCreditOnIssued,
              status: LetterOfCreditStatus.Issued_Verification_Pending
            }
          )
        })
      })

      when('rabbitMQ message has been received', () => {
        beforeEach(() => {
          letterOfCreditOnIssued = {
            ...letterOfCredit,
            status: LetterOfCreditStatus.Issued_Verification_Pending
          }

          const lcToHash = { ...letterOfCreditOnIssued }
          delete lcToHash.status
          delete lcToHash.hashedData
          delete lcToHash.updatedAt
          const letterOfCreditWithStateHash = soliditySha3(JSON.stringify(removeNullsAndUndefined(lcToHash)))

          issuedEvent = buildEventObject(
            ['string', 'bytes32', 'bytes32', 'uint256'],
            ['TransitionWithData', ISSUED_STATE, letterOfCreditWithStateHash, 4],
            '0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28', // web3.utils.soliditySha3("LetterOfCredit")
            TX_HASH,
            CONTRACT_ADDRESS
          )

          decodedIssuedEvent = {
            stateId: ISSUED_STATE,
            _dataHash: letterOfCreditWithStateHash
          }
        })

        it('should save the letter of credit as Issued', async () => {
          mockDataAgent.getByContractAddress.mockImplementation(() => Promise.resolve(letterOfCreditOnIssued))

          console.log('letterOfCreditOnIssued', letterOfCreditOnIssued)
          await letterOfCreditTransitionService.doEvent(decodedIssuedEvent, issuedEvent)

          expect(mockDataAgent.update).toHaveBeenCalled()
          expect(mockDataAgent.update).toHaveBeenCalledTimes(1)
          expect(mockDataAgent.update).toHaveBeenCalledWith(
            { staticId: letterOfCreditOnIssued.staticId },
            {
              ...letterOfCreditOnIssued,
              status: LetterOfCreditStatus.Issued
            }
          )

          expect(mockPartyActionsProcessor.executePartyActions).toHaveBeenCalled()
          expect(mockPartyActionsProcessor.executePartyActions).toHaveBeenCalledTimes(1)
          expect(mockPartyActionsProcessor.executePartyActions).toHaveBeenCalledWith({
            ...letterOfCreditOnIssued,
            status: LetterOfCreditStatus.Issued
          })
        })

        it('should save the letter of credit as Issued_Verification_Failed', async () => {
          letterOfCreditOnIssued = {
            ...letterOfCreditOnIssued,
            staticId: 'something'
          }
          mockDataAgent.getByContractAddress.mockImplementation(() => Promise.resolve(letterOfCreditOnIssued))

          await letterOfCreditTransitionService.doEvent(decodedIssuedEvent, issuedEvent)

          expect(mockDataAgent.update).toHaveBeenCalled()
          expect(mockDataAgent.update).toHaveBeenCalledTimes(1)
          expect(mockDataAgent.update).toHaveBeenCalledWith(
            { staticId: letterOfCreditOnIssued.staticId },
            {
              ...letterOfCreditOnIssued,
              status: LetterOfCreditStatus.Issued_Verification_Failed
            }
          )
        })
      })
    })
  })

  const buildEventObject = (
    paramNames: string[],
    params: any[],
    topic: string,
    transactionHash: string,
    contractAddress: string
  ) => {
    const encodedEventParams = Web3EthAbi.encodeParameters(paramNames, params)
    return {
      data: encodedEventParams,
      topics: [topic],
      blockNumber: 941,
      transactionHash,
      contractAddress
    }
  }
})
