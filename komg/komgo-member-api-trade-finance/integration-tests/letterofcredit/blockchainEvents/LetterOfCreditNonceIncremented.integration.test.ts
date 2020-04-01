import 'reflect-metadata'
import { randomHex } from 'web3-utils'

import { ILetterOfCredit, buildFakeLetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'

import { ILetterOfCreditDataAgent } from '../../../src/data-layer/data-agents'
import { soliditySha3 } from '../../../src/business-layer/common/HashFunctions'
import { TYPES, CONFIG } from '../../../src/inversify'

import { buildEventObject, IntegrationEnvironment, MessagingUtility, expectObjectInDatabase } from '../../utils'

jest.setTimeout(60000)

describe('LetterOfCreditNonceIncrementedService integration tests', () => {
  const integrationEnvironment = new IntegrationEnvironment()
  let letterOfCreditDataAgent: ILetterOfCreditDataAgent
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let messagingUtils: MessagingUtility
  let lcDataHashed: string
  let transactionHash: string
  let contractAddress: string
  let expectedNonce: number
  let eventObject: {}

  beforeAll(async done => {
    await integrationEnvironment.setup()
    await integrationEnvironment.startServer()
    messagingUtils = new MessagingUtility()
    letterOfCreditDataAgent = integrationEnvironment.iocContainer.get<ILetterOfCreditDataAgent>(
      TYPES.LetterOfCreditDataAgent
    )
    done()
  })

  beforeEach(async done => {
    transactionHash = randomHex(32)
    contractAddress = randomHex(32)
    letterOfCredit = buildFakeLetterOfCredit({
      status: LetterOfCreditStatus.Requested,
      transactionHash,
      contractAddress
    })

    letterOfCredit.templateInstance.bindings = {} // this is a temp hack in order to circumvent the "key $schema must not start with '$'"" error

    lcDataHashed = soliditySha3(JSON.stringify(letterOfCredit))
    letterOfCredit.hashedData = lcDataHashed

    await messagingUtils.createPublisher(integrationEnvironment.iocContainer.get<string>(CONFIG.FromPublisherId))

    await letterOfCreditDataAgent.save(letterOfCredit)
    done()
  })

  it('should update nonce', async done => {
    expectedNonce = 2

    eventObject = buildEventObject(
      ['string', 'uint8'],
      ['NonceIncremented', expectedNonce],
      '0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28',
      transactionHash,
      contractAddress
    )

    const letterOfCredit = await letterOfCreditDataAgent.getByContractAddress(contractAddress)

    expect(letterOfCredit).toBeDefined()

    await messagingUtils.publish(`BLK.0xd57c504b029ba527f6ee4557bc760f9ec862f300e2cc29e1435f53422c0aed28`, eventObject)

    expectObjectInDatabase(
      letterOfCreditDataAgent,
      {
        transactionHash: transactionHash,
        contractAddress: contractAddress,
        nonce: expectedNonce,
        status: LetterOfCreditStatus.Requested
      },
      done
    )
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
