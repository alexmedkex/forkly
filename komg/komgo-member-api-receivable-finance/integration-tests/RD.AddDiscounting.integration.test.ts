import { ErrorCode } from '@komgo/error-utilities'
import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  buildFakeReceivablesDiscountingBase,
  IReceivablesDiscountingBase,
  ReplyType,
  IReceivablesDiscounting,
  RequestType
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX } from '../src/business-layer/messaging/constants'
import { AddDiscountingRequestType } from '../src/business-layer/messaging/types/AddDiscountingRequestType'
import { IReceivableFinanceMessage, IRDAddDiscountingPayload } from '../src/business-layer/types'
import { toObject } from '../src/data-layer/data-agents/utils'
import { IReply } from '../src/data-layer/models/replies/IReply'
import { ReplyModel } from '../src/data-layer/models/replies/ReplyModel'
import { VALUES } from '../src/inversify/values'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import {
  createResponseMessage,
  assertRDsMatch,
  createRFP,
  createAcceptedRD,
  assertRDsMatchIgnoringCreatedAt,
  MOCK_DATE,
  assertReplyCreatedInDB
} from './utils/test-utils'

describe('RD.AddDiscounting integration test', () => {
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

    iEnv = new IntegrationEnvironment(trader.companyStaticId)
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

    rdBase = buildFakeReceivablesDiscountingBase(true, {
      riskCoverDate: MOCK_DATE,
      numberOfDaysRiskCover: 100,
      requestType: RequestType.RiskCoverDiscounting
    })
    delete rdBase.discountingDate
    delete rdBase.numberOfDaysDiscounting

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

    it('should send the Add discounting request to the bank', async done => {
      await createOutboundEventManagementExchange()
      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        discountingDate: MOCK_DATE,
        numberOfDaysDiscounting: 100
      }

      const updateResponse = await trader.updateRD(rdId, rdUpdate)
      expect(updateResponse.status).toBe(200)

      const addDiscountingResponse = await trader.addDiscounting(rdId)
      expect(addDiscountingResponse.status).toBe(204)

      await assertReplyCreatedInDB(rdId, ReplyType.AddDiscountingRequest)

      const addDiscountingRD = (await trader.getRDInfo(rdId)).rd
      assertRDsMatchIgnoringCreatedAt({ ...rdUpdate, staticId: rdId }, addDiscountingRD)

      await assertValidOuboundMessage(addDiscountingRD, await getReplyFromDB(rdId), done)
    })
  })

  describe('failures', () => {
    it('fails if RD requestType is not RiskCoverDiscounting', async () => {
      const rd = { ...rdBase, requestType: RequestType.RiskCover }
      const { rdId } = await createAcceptedRD(trader, bank, rd, mockUtils)
      try {
        await trader.addDiscounting(rdId)
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
        expect(error.response.data.fields).toMatchObject({
          requestType: ["'requestType' should be equal to constant (RISK_COVER_DISCOUNTING)"],
          discountingDate: ["should have required property 'discountingDate'"],
          numberOfDaysDiscounting: ["should have required property 'numberOfDaysDiscounting'"]
        })
      }
    })

    it('fails if RD does not exist', async () => {
      try {
        await trader.addDiscounting(uuid4())
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
        await trader.addDiscounting(id)
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('fails if mandatory add discounting fields are missing', async () => {
      const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)

      try {
        await trader.addDiscounting(rdId)
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
        expect(error.response.data.fields).toMatchObject({
          discountingDate: ["should have required property 'discountingDate'"],
          numberOfDaysDiscounting: ["should have required property 'numberOfDaysDiscounting'"]
        })
      }
    })

    it('fails if an add discounting request has already been sent', async () => {
      const { rdId } = await createAcceptedRD(trader, bank, rdBase, mockUtils)
      await createOutboundEventManagementExchange()
      const rdUpdate: IReceivablesDiscountingBase = {
        ...rdBase,
        discountingDate: MOCK_DATE,
        numberOfDaysDiscounting: 100
      }
      await trader.updateRD(rdId, rdUpdate)
      await trader.addDiscounting(rdId)

      const addDiscountingRD = (await trader.getRDInfo(rdId)).rd
      await assertValidOuboundMessage(addDiscountingRD, await getReplyFromDB(rdId))

      try {
        await trader.addDiscounting(rdId)
        fail('Expected failure')
      } catch (error) {
        expect(error.response.status).toBe(409)
        expect(error.response.data.errorCode).toBe(ErrorCode.DatabaseInvalidData)
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

  async function getReplyFromDB(rdId: string) {
    return toObject(await ReplyModel.findOne({ rdId, type: ReplyType.AddDiscountingRequest }))
  }

  async function assertValidOuboundMessage(
    expectedRD: IReceivablesDiscounting,
    expectedReply: IReply,
    done?: jest.DoneCallback
  ) {
    // tslint:disable-next-line
    await consumerMS.messagingConsumer.listen(
      iEnv.iocContainer.get(VALUES.OutboundPublisherId),
      `${ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX}.${AddDiscountingRequestType.Add}`,
      async received => {
        received.ack()
        const message = received.content as IReceivableFinanceMessage<IRDAddDiscountingPayload>

        assertRDsMatch(expectedRD, message.data.entry)
        const reply = message.data.reply

        // dates in sent message are strings, dates on DB IReply are Date objects
        expect({ ...reply, createdAt: new Date(reply.createdAt), updatedAt: new Date(reply.updatedAt) }).toEqual(
          expectedReply
        )

        if (done) {
          done()
        }
      }
    )
  }
})
