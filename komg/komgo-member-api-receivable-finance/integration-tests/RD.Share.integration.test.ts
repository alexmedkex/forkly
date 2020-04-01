import { ErrorCode } from '@komgo/error-utilities'
import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  buildFakeReceivablesDiscountingBase,
  IReceivablesDiscountingBase,
  ReplyType,
  IReceivablesDiscounting
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { UPDATE_TYPE_ROUTING_KEY_PREFIX } from '../src/business-layer/messaging/constants'
import { IReceivableFinanceMessage, UpdateType, IRDUpdatePayload } from '../src/business-layer/types'
import { VALUES } from '../src/inversify/values'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import {
  createResponseMessage,
  assertRDsMatch,
  updateRDMultipleTimes,
  createRFP,
  createAcceptedRD,
  assertRDsMatchIgnoringCreatedAt
} from './utils/test-utils'

describe('RD.Share integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let rdBase: IReceivablesDiscountingBase
  let consumerMS: ConsumerMicroservice

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId) // Accept quote flow is done by corporates
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
    await bank.beforeEach(iEnv.iocContainer)

    rdBase = buildFakeReceivablesDiscountingBase(true)
    rdBase.advancedRate = 10

    consumerMS = new ConsumerMicroservice(iEnv.iocContainer.get(VALUES.OutboundPublisherId))
    await consumerMS.beforeEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    mockUtils.reset()

    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()

    await consumerMS.afterEach()
  })

  describe('success', () => {
    let rdId: string
    beforeEach(async () => {
      const res = await createAcceptedRD(trader, bank, rdBase, mockUtils)
      rdId = res.rdId
    })

    it('should send the latest RD to the bank', async done => {
      await createOutboundEventManagementExchange()
      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        invoiceAmount: 12312312,
        dateOfPerformance: '2019-05-19'
      }

      const updateResponse = await trader.updateRD(rdId, rdUpdate)
      expect(updateResponse.status).toBe(200)

      const shareResponse = await trader.shareRD(rdId)
      expect(shareResponse.status).toBe(204)

      const saveUpdateRD = (await trader.getRDInfo(rdId)).rd
      assertRDsMatchIgnoringCreatedAt({ ...rdUpdate, staticId: rdId }, saveUpdateRD)

      await assertValidOuboundMessage(saveUpdateRD, done)
    })

    it('should send the latest RD to the bank after the RD has been updated multple times', async done => {
      await createOutboundEventManagementExchange()
      await updateRDMultipleTimes(trader, { ...rdBase, staticId: rdId }, 5)

      const finalUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        invoiceAmount: 1234512345,
        dateOfPerformance: '2019-05-19'
      }
      const finalResponse = await trader.updateRD(rdId, finalUpdate)
      expect(finalResponse.status).toBe(200)

      const shareResponse = await trader.shareRD(rdId)
      expect(shareResponse.status).toBe(204)

      const savedUpdatedRD = (await trader.getRDInfo(rdId)).rd
      // check the RD you get is the final updated RD
      assertRDsMatchIgnoringCreatedAt(savedUpdatedRD, { ...finalUpdate, staticId: rdId })

      await assertValidOuboundMessage(savedUpdatedRD, done)
    })
  })

  describe('failures', () => {
    it('fails if RD does not exist', async () => {
      try {
        await trader.shareRD(uuid4())
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })

    it('fails if RD has not been accepted', async () => {
      const id = await createRFP(trader, bank, rdBase, mockUtils)
      const quoteSubmissionMessage = createResponseMessage(
        id,
        bank.companyStaticId,
        bank.companyStaticId,
        ReplyType.Submitted
      )
      await bank.publishRFPResponse(quoteSubmissionMessage)
      await trader.createNewQuote()
      await mockUtils.mockSuccessfulRFPReplyAccept()

      try {
        await trader.updateRD(id, { ...rdBase, invoiceAmount: 1000000 })
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })
  })

  async function createOutboundEventManagementExchange() {
    // add listener to create exchange to simulate event-mgnt
    const listenId = await consumerMS.messagingConsumer.listen(
      iEnv.iocContainer.get(VALUES.OutboundPublisherId),
      '#',
      // tslint:disable-next-line
      async _ => {}
    )
    await consumerMS.messagingConsumer.cancel(listenId)
  }

  async function assertValidOuboundMessage(expectedRD: IReceivablesDiscounting, done?: jest.DoneCallback) {
    // tslint:disable-next-line
    await consumerMS.messagingConsumer.listen(
      iEnv.iocContainer.get(VALUES.OutboundPublisherId),
      `${UPDATE_TYPE_ROUTING_KEY_PREFIX}.${UpdateType.ReceivablesDiscounting}`,
      async received => {
        received.ack()
        const message = received.content as IReceivableFinanceMessage<IRDUpdatePayload>

        assertRDsMatch(expectedRD, message.data.entry)
        if (done) {
          done()
        }
      }
    )
  }
})
