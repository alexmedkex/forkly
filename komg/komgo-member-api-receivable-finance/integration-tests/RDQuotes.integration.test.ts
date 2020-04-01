import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { IRFPMessage, IRFPResponsePayload, IRFPPayload } from '@komgo/messaging-types'
import {
  buildFakeQuoteBase,
  ReplyType,
  IQuote,
  RequestType,
  DiscountingType,
  IReceivablesDiscounting,
  buildFakeReceivablesDiscountingExtended,
  ITradeSnapshot,
  buildFakeTradeSnapshot
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { UPDATE_TYPE_ROUTING_KEY_PREFIX } from '../src/business-layer/messaging/constants'
import { buildFakeRFPMessage, buildFakeRequestPayload } from '../src/business-layer/messaging/faker'
import {
  IProductResponse,
  UpdateType,
  IReceivableFinanceMessage,
  IQuoteUpdatePayload
} from '../src/business-layer/types'
import { PRODUCT_ID, SubProductId } from '../src/constants'
import { mockTrade } from '../src/data-layer/data-agents/utils/faker'
import { VALUES } from '../src/inversify/values'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import { GlobalActions } from './utils/GlobalActions'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import {
  assertQuoteCreatedInDB,
  assertRFPCreatedInDB,
  createResponseMessage,
  assertRFPReplyCreatedInDBFromMessage
} from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RDQuotes integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId) // Only banks receive RFP requests
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
    await bank.beforeEach(iEnv.iocContainer)
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    mockUtils.reset()

    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  describe('create', () => {
    describe('validation', () => {
      it('should fail with error 400 if data format is invalid', async () => {
        try {
          await trader.createNewQuote({} as any)
          fail('Expected failure')
        } catch (error) {
          const { status, data } = error.response
          expect(status).toEqual(400)
          expect(data.fields.quote).toBeDefined()
        }
      })
    })

    describe('success', () => {
      it('should create a Quote successfully', async () => {
        const quoteId = await trader.createNewQuote()
        await assertQuoteCreatedInDB(quoteId)
      })
    })
  })

  describe('submit', () => {
    it('should fail with error 422 if quote fails validation for risk cover with discount option when numberOfDaysDiscounting is not provided', async () => {
      const rd: IReceivablesDiscounting = buildFakeReceivablesDiscountingExtended(true)
      rd.requestType = RequestType.RiskCoverDiscounting
      rd.discountingType = undefined
      rd.numberOfDaysRiskCover = 30
      rd.riskCoverDate = new Date().toISOString()
      rd.numberOfDaysDiscounting = 85
      rd.discountingDate = new Date().toISOString()

      const rdId = await receiveRFPCustomRD(rd)
      const quoteId = await bank.createNewQuote(
        buildFakeQuoteBase({ numberOfDaysDiscounting: undefined }, rd.requestType, rd.discountingType)
      )

      try {
        mockUtils.mockSuccessfulRFPReply()
        await bank.createNewQuoteSubmission(rdId, quoteId)
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.numberOfDaysDiscounting).toEqual([`should have required property 'numberOfDaysDiscounting'`])
      }
    })
  })

  describe('get', () => {
    describe('validation', () => {
      it('should fail with error 404 if quote does not exist', async () => {
        try {
          await trader.getQuote('doesNotExist')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })
    })

    describe('success', () => {
      it('should return existent quote', async () => {
        const mockQuote = buildFakeQuoteBase()
        const quoteId = await trader.createNewQuote(mockQuote)

        const quote = await trader.getQuote(quoteId)

        expect(quote.staticId).toBe(quoteId)
        expect(quote).toEqual(expect.objectContaining(mockQuote))
      })
    })
  })

  describe('update', () => {
    describe('validation', () => {
      it('should fail with error 404 if quote does not exist', async () => {
        try {
          await bank.updateQuote('inexistentQuoteId')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })
    })

    describe('success', () => {
      it('should update a Quote successfully', async () => {
        const quoteId = await receiveAcceptQuote()
        const quote = await bank.getQuote(quoteId)

        const newQuote = { ...quote, advanceRate: 55 }

        const updatedQuote = await bank.updateQuote(quoteId, newQuote)
        expect(updatedQuote.advanceRate).toEqual(55)
      })
    })
  })

  describe('share', () => {
    describe('validation', () => {
      it('should fail with error 404 if quote does not exist', async () => {
        try {
          await bank.shareQuote('inexistentQuoteId')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })

      it('should fail with error 422 if RFP Reply is not found', async () => {
        const quoteId = await bank.createNewQuote()

        try {
          await bank.shareQuote(quoteId)
          fail('Expected failure')
        } catch (error) {
          const { status, data } = error.response
          expect(status).toEqual(422)
          expect(data.fields.quoteId).toBeDefined()
        }
      })
    })

    describe('success', () => {
      let consumerMS: ConsumerMicroservice

      beforeEach(async () => {
        consumerMS = new ConsumerMicroservice(
          iEnv.iocContainer.get(VALUES.OutboundPublisherId),
          GlobalActions.amqpConfig
        )
        await consumerMS.beforeEach()
      })

      afterEach(async () => {
        await consumerMS.afterEach()
      })

      it('should share a Quote successfully', async done => {
        await createOutboundEventManagementExchange()

        const quoteId = await receiveAcceptQuote()
        const quote = await bank.getQuote(quoteId)

        const newQuote = { ...quote, advanceRate: 55 }
        const updatedQuote = await bank.updateQuote(quoteId, newQuote)

        const response = await bank.shareQuote(quoteId)

        expect(response.status).toEqual(204)
        await assertValidOutboundMessage(updatedQuote, done)
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

      async function assertValidOutboundMessage(expectedQuote: IQuote, done: jest.DoneCallback) {
        // tslint:disable-next-line
        await consumerMS.messagingConsumer.listen(
          iEnv.iocContainer.get(VALUES.OutboundPublisherId),
          `${UPDATE_TYPE_ROUTING_KEY_PREFIX}.${UpdateType.FinalAgreedTermsData}`,
          async received => {
            received.ack()
            const message = received.content as IReceivableFinanceMessage<IQuoteUpdatePayload>

            expect(message.data.entry).toMatchObject(expectedQuote)
            expect(message.context).toEqual({
              productId: PRODUCT_ID,
              subProductId: SubProductId.ReceivableDiscounting,
              rdId: expect.any(String),
              updateType: UpdateType.FinalAgreedTermsData
            })

            done()
          }
        )
      }
    })
  })

  describe('getHistory', () => {
    describe('validation', () => {
      it('should fail with error 404 if quote does not exist', async () => {
        try {
          await trader.getQuoteHistory('inexistentQuoteId')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })
    })

    describe('success', () => {
      it('should get the quote history successfully', async () => {
        const quoteId = await receiveAcceptQuote()
        const quote = await bank.getQuote(quoteId)

        const newQuote = { ...quote, advanceRate: 55 }
        const updatedQuote = await bank.updateQuote(quoteId, newQuote)

        const history = await bank.getQuoteHistory(quoteId)
        expect(history).toEqual({
          id: quote.staticId,
          historyEntry: {
            advanceRate: [
              { updatedAt: updatedQuote.updatedAt, value: updatedQuote.advanceRate },
              { updatedAt: quote.updatedAt, value: quote.advanceRate }
            ]
          }
        })
      })
    })
  })

  const publishRFPAndVerify = async (): Promise<string> => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    const rdId = await trader.publishRFPRequest()
    await assertRFPCreatedInDB(rdId)
    return rdId
  }

  const getAcceptMessage = (rdId: string) => {
    return createResponseMessage(rdId, bank.companyStaticId, trader.companyStaticId, ReplyType.Accepted)
  }

  const publishRFPAccept = async (message: IRFPMessage<IRFPPayload>, options?: any) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()
    await trader.publishRFPAccept(message, options)
  }

  const receiveAcceptAndVerify = async (message: IRFPMessage<IRFPResponsePayload<IProductResponse>>, options?: any) => {
    await publishRFPAccept(message, options)
    await assertRFPReplyCreatedInDBFromMessage(message)
    await messagingTestUtility.assertNoRejectedMessageFromRFP()
  }

  async function receiveAcceptQuote(
    quote = buildFakeQuoteBase({}, RequestType.Discount, DiscountingType.WithoutRecourse)
  ) {
    // Bank receives a RFP Request from trader
    const rdId = await publishRFPAndVerify()

    // Banks submits quote to trader
    mockUtils.mockSuccessfulRFPReply()
    const quoteId = await bank.createNewQuote(quote)
    await bank.createNewQuoteSubmission(rdId, quoteId)

    // Bank receives accept quote from trader
    const message = getAcceptMessage(rdId)
    await receiveAcceptAndVerify(message)

    return message.data.response.quote.staticId
  }

  async function receiveRFPCustomRD(rd: IReceivablesDiscounting) {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    const tradeSnapshot: ITradeSnapshot = buildFakeTradeSnapshot()
    tradeSnapshot.source = rd.tradeReference.source
    tradeSnapshot.sourceId = rd.tradeReference.sourceId
    tradeSnapshot.trade = {
      ...mockTrade,
      source: rd.tradeReference.source,
      sourceId: rd.tradeReference.sourceId,
      createdAt: new Date().toISOString()
    }

    const message = buildFakeRFPMessage(buildFakeRequestPayload(rd, tradeSnapshot, true))

    const rdId = await trader.publishRFPRequest(message)
    await assertRFPCreatedInDB(rdId)
    return rdId
  }
})
