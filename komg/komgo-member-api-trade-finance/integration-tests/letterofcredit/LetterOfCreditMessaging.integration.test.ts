import 'reflect-metadata'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { randomHex } from 'web3-utils'

import { ILetterOfCredit, buildFakeLetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'

import { MessageType } from '../../src/business-layer/letter-of-credit/messaging'
import { ILetterOfCreditDataAgent } from '../../src/data-layer/data-agents'
import { TYPES, CONFIG } from '../../src/inversify'

import { AxiosMockUtils } from '../mocks/AxiosMockUtils'
import { MessagingUtility, IntegrationEnvironment, expectObjectInDatabase } from '../utils'
import { soliditySha3 } from '../../src/business-layer/common/HashFunctions'

jest.setTimeout(60000)

describe('LetterOfCreditMessaging', () => {
  const integrationEnvironment = new IntegrationEnvironment()
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let dataAgent: ILetterOfCreditDataAgent
  let messagingUtils: MessagingUtility
  let axiosMockUtils
  let transactionHash: string
  let contractAddress: string

  beforeAll(async done => {
    await integrationEnvironment.setup()
    await integrationEnvironment.startServer()
    axiosMockUtils = new AxiosMockUtils(new MockAdapter(Axios))
    messagingUtils = new MessagingUtility()
    letterOfCredit = buildFakeLetterOfCredit()
    letterOfCredit.templateInstance.bindings = {}
    dataAgent = integrationEnvironment.iocContainer.get<ILetterOfCreditDataAgent>(TYPES.LetterOfCreditDataAgent)
    done()
  })

  beforeEach(async done => {
    transactionHash = randomHex(32)
    contractAddress = randomHex(32)
    await messagingUtils.createPublisher(integrationEnvironment.iocContainer.get<string>(CONFIG.FromPublisherId))
    done()
  })

  it('should save the LetterOfCredit in the DB with STATUS=VerificationPending when the message is received and there is not LetterOfCredit in the DB', async done => {
    letterOfCredit = {
      ...letterOfCredit,
      transactionHash,
      contractAddress
    }

    const letterOfCreditMessage = {
      ...letterOfCredit,
      messageType: MessageType.LetterOfCredit
    }
    await messagingUtils.publish(`${MessageType.LetterOfCredit}`, letterOfCreditMessage)

    expectObjectInDatabase(
      dataAgent,
      {
        transactionHash: letterOfCredit.transactionHash,
        contractAddress: letterOfCredit.contractAddress,
        status: LetterOfCreditStatus.Requested_Verification_Pending
      },
      done
    )
  })

  it('should save the LetterOfCredit in the DB with STATUS=Requested when message is received + an existing LetterOfCredit is in the DB and the message is VALID', async done => {
    letterOfCredit = {
      ...letterOfCredit,
      transactionHash,
      contractAddress
    }

    const hashedData = soliditySha3(JSON.stringify(letterOfCredit))

    letterOfCredit = {
      ...letterOfCredit,
      hashedData
    }

    await dataAgent.save(letterOfCredit)

    const letterOfCreditMessag = {
      ...letterOfCredit,
      messageType: MessageType.LetterOfCredit
    }

    await messagingUtils.publish(`${MessageType.LetterOfCredit}`, letterOfCreditMessag)

    expectObjectInDatabase(
      dataAgent,
      {
        transactionHash: letterOfCredit.transactionHash,
        contractAddress: letterOfCredit.contractAddress,
        status: LetterOfCreditStatus.Requested_Verification_Failed
      },
      done
    )
  })

  it('should save the LetterOfCredit in the DB with STATUS=VerificationFailed when message is received + an existing LetterOfCredit is in the DB and the message is INVALID', async done => {
    letterOfCredit = {
      ...letterOfCredit,
      transactionHash,
      contractAddress
    }

    await dataAgent.save(letterOfCredit)

    const letterOfCreditModified = { ...letterOfCredit, staticId: 'nothing' }

    const letterOfCreditMessageWithLetterOfCreditModified = {
      ...letterOfCreditModified,
      messageType: MessageType.LetterOfCredit
    }

    await messagingUtils.publish(`${MessageType.LetterOfCredit}`, letterOfCreditMessageWithLetterOfCreditModified)

    expectObjectInDatabase(
      dataAgent,
      {
        transactionHash: letterOfCredit.transactionHash,
        contractAddress: letterOfCredit.contractAddress,
        status: LetterOfCreditStatus.Requested_Verification_Failed
      },
      done
    )
  })

  afterEach(async done => {
    await messagingUtils.tearDown()
    axiosMockUtils.reset()
    done()
  })

  afterAll(async done => {
    await integrationEnvironment.stopServer()
    await integrationEnvironment.tearDown()
    done()
  })
})
