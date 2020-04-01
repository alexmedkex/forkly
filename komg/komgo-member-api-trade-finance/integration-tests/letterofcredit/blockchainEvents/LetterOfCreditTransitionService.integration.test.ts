import 'reflect-metadata'
import { randomHex } from 'web3-utils'

import { ILetterOfCredit, buildFakeLetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'

import { ILetterOfCreditDataAgent } from '../../../src/data-layer/data-agents'
import { soliditySha3 } from '../../../src/business-layer/common/HashFunctions'
import { TYPES, CONFIG } from '../../../src/inversify'

import { IntegrationEnvironment, MessagingUtility, expectObjectInDatabase, buildEventObject } from '../../utils'
import { ILetterOfCreditPartyActionProcessor } from '../../../src/business-layer/letter-of-credit'

jest.setTimeout(60000)

const when = describe

describe('LetterOfCreditTransitionService integration tests', () => {
  const REQUEST_REJECTED_STATE = soliditySha3('request rejected')
  const ISSUED_STATE = soliditySha3('issued')
  const TOPIC = '0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28' // web3.utils.soliditySha3("LetterOfCredit")
  const integrationEnvironment = new IntegrationEnvironment()

  let letterOfCreditDataAgent: ILetterOfCreditDataAgent
  let letterOfCreditPartyActionProcessor: ILetterOfCreditPartyActionProcessor
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let messagingUtils: MessagingUtility
  let transactionHash: string
  let contractAddress: string
  let eventObject: {}

  beforeAll(async () => {
    await integrationEnvironment.setup()
    await integrationEnvironment.startServer()
    messagingUtils = new MessagingUtility()
    letterOfCreditDataAgent = integrationEnvironment.iocContainer.get<ILetterOfCreditDataAgent>(
      TYPES.LetterOfCreditDataAgent
    )
    letterOfCreditPartyActionProcessor = integrationEnvironment.iocContainer.get<ILetterOfCreditPartyActionProcessor>(
      TYPES.LetterOfCreditPartyActionProcessor
    )
  })

  beforeEach(async () => {
    letterOfCredit = buildFakeLetterOfCredit()

    letterOfCredit.templateInstance.bindings = {} // this is a temp hack in order to circumvent the "key $schema must not start with '$'"" error

    await messagingUtils.createPublisher(integrationEnvironment.iocContainer.get<string>(CONFIG.FromPublisherId))
  })

  describe('request rejected', () => {
    beforeEach(() => {
      transactionHash = randomHex(32)
      contractAddress = randomHex(32)
      letterOfCredit = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.Requested,
        transactionHash,
        contractAddress
      }
      eventObject = buildEventObject(
        ['string', 'bytes32', 'uint256'],
        ['Transition', REQUEST_REJECTED_STATE, 4],
        TOPIC,
        transactionHash,
        contractAddress
      )
    })

    when('event is received but RabbitMQ message has not arrived', () => {
      beforeEach(async done => {
        await letterOfCreditDataAgent.save(letterOfCredit)
        done()
      })

      it('should save the letter of credit status with status = LetterOfCreditStatus.RequestRejected_Pending', async done => {
        await messagingUtils.publish(`BLK.${TOPIC}`, eventObject)

        expectObjectInDatabase(
          letterOfCreditDataAgent,
          {
            contractAddress: contractAddress,
            status: LetterOfCreditStatus.RequestRejected_Pending
          },
          done
        )
      })
    })

    when('event is received and RabbitMQ message has arrived / event is received and party is ISSUING BANK', () => {
      beforeEach(async done => {
        letterOfCredit = {
          ...letterOfCredit,
          status: LetterOfCreditStatus.RequestRejected_Pending
        }
        await letterOfCreditDataAgent.save(letterOfCredit)
        done()
      })

      it('should save the letter of credit status with status = LetterOfCreditStatus.RequestRejected', async done => {
        await messagingUtils.publish(`BLK.${TOPIC}`, eventObject)

        expectObjectInDatabase(
          letterOfCreditDataAgent,
          {
            contractAddress: contractAddress,
            status: LetterOfCreditStatus.RequestRejected
          },
          done
        )
      })
    })
  })

  describe('issued', () => {
    beforeEach(() => {
      transactionHash = randomHex(32)
      contractAddress = randomHex(32)
      letterOfCredit = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.Issued_Verification_Pending,
        transactionHash,
        contractAddress
      }

      let lcToHash = {
        ...letterOfCredit
      }
      delete lcToHash.status
      delete lcToHash.updatedAt

      const letterOfCreditWithStateHash = soliditySha3(JSON.stringify(lcToHash))

      eventObject = buildEventObject(
        ['string', 'bytes32', 'bytes32', 'uint256'],
        ['TransitionWithData', ISSUED_STATE, letterOfCreditWithStateHash, 4],
        TOPIC,
        transactionHash,
        contractAddress
      )
    })

    when('event is received and RabbitMQ message has arrived / event is received and party is ISSUING BANK', () => {
      beforeEach(async done => {
        await letterOfCreditDataAgent.save(letterOfCredit)
        done()
      })

      it('should save the letter of credit status with status = LetterOfCreditStatus.Issued', async done => {
        await messagingUtils.publish(`BLK.${TOPIC}`, eventObject)

        expectObjectInDatabase(
          letterOfCreditDataAgent,
          {
            contractAddress: contractAddress,
            status: LetterOfCreditStatus.Issued
          },
          done
        )
      })
    })

    when('event is received but RabbitMQ message has not arrived', () => {
      beforeEach(async done => {
        letterOfCredit = {
          ...letterOfCredit,
          status: LetterOfCreditStatus.Requested
        }
        await letterOfCreditDataAgent.save(letterOfCredit)
        done()
      })

      it('should save the letter of credit status with status = LetterOfCreditStatus.RequestRejected_VerificationPending', async done => {
        await messagingUtils.publish(`BLK.${TOPIC}`, eventObject)

        expectObjectInDatabase(
          letterOfCreditDataAgent,
          {
            contractAddress: contractAddress,
            status: LetterOfCreditStatus.Issued_Verification_Pending
          },
          done
        )
      })
    })
  })

  afterEach(async done => {
    await messagingUtils.tearDown()
    done()
  })

  afterAll(async done => {
    await integrationEnvironment.stopServer()
    await integrationEnvironment.tearDown()
    done()
  })
})
