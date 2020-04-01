import { IQuote, IReceivablesDiscountingBase, buildFakeReceivablesDiscountingBase, IQuoteBase } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { buildFakeReceivableFinanceMessage } from '../src/business-layer/messaging/faker'
import { UpdateType } from '../src/business-layer/types'
import { datePlusHours } from '../src/test-utils'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createAcceptedRD, assertReceivedQuoteCreatedInDB, createSubmittedQuote, receiveRFP } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('FinalAgreedTerms.Receive.Update.integration.test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let rdBase: IReceivablesDiscountingBase
  let axiosMock: MockAdapter

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    axiosMock = new MockAdapter(Axios)
    mockUtils = new RFPMockUtils(axiosMock)

    iEnv = new IntegrationEnvironment(trader.companyStaticId)
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)
    rdBase = buildFakeReceivablesDiscountingBase(true)

    await iEnv.start()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    mockUtils.mockSuccessfulTaskOrNotification()

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

  describe('success', () => {
    it('should successfully save an update to the final agreed terms', async () => {
      const { updated } = await mockQuoteAcceptedThenUpdated(10)

      await assertReceivedQuoteCreatedInDB(updated)
    })

    it('should successfully save an update to the final agreed terms even if building the notification fails', async () => {
      mockUtils.mockErrorTaskOrNotificationAll()

      const { updated } = await mockQuoteAcceptedThenUpdated(10)

      await assertReceivedQuoteCreatedInDB(updated)
    })

    it('should not update a quote if the updated one is older than the current one', async () => {
      const { updated } = await mockQuoteAcceptedThenUpdated(10)
      await assertReceivedQuoteCreatedInDB(updated) // wait for first update to be received

      const secondUpdate = { ...updated, createdAt: datePlusHours(updated.createdAt, -9) } // 9 hours before first
      await mockReceiveUpdate(secondUpdate, uuid4(), bank.companyStaticId)

      const quoteReturned = await bank.getQuote(updated.staticId)
      expect(quoteReturned.createdAt).toEqual(updated.createdAt)
    })
  })

  describe('failure', () => {
    it('should reject a message with an invalid quote update', async () => {
      const { messageId } = await mockQuoteAcceptedThenUpdated(10, { advanceRate: -1 }, uuid4())

      await messagingTestUtility.assertRejectedMessageFromEventManagement(messageId)
    })

    it('should reject a message if the quote has not been accepted', async () => {
      const { messageId } = await mockQuoteSubmittedThenUpdated(10, {}, uuid4())

      await messagingTestUtility.assertRejectedMessageFromEventManagement(messageId)
    })

    it('should reject a message if the update is not from the bank for which the quote was accepted', async () => {
      const { messageId } = await mockQuoteAcceptedThenUpdated(10, undefined, undefined, 'incorrect-static-id')

      await messagingTestUtility.assertRejectedMessageFromEventManagement(messageId)
    })
  })

  interface IMockedReceivedUpdate {
    accepted: IQuote
    updated: IQuote
    messageId: string
  }

  const mockReceiveUpdate = async (updated: IQuote, messageId: string, senderStaticId?: string) => {
    const message = buildFakeReceivableFinanceMessage(updated, UpdateType.FinalAgreedTermsData)
    if (senderStaticId) {
      message.data.senderStaticId = senderStaticId
    }
    await bank.publishFinalAgreedTermsUpdate(message, { messageId })
    return messageId
  }

  const mockQuoteSubmittedThenUpdated = async (
    hours: number,
    edits: Partial<IQuoteBase> = {},
    messageId: string = 'test-message-id',
    sender: string = bank.companyStaticId
  ): Promise<{ messageId: string }> => {
    const rdId = await receiveRFP(trader, mockUtils)
    const { quoteId } = await createSubmittedQuote(rdId, bank, mockUtils)
    const quote = await bank.getQuote(quoteId)
    const updated = {
      ...quote,
      ...edits,
      createdAt: datePlusHours(quote.createdAt, hours)
    }
    await mockReceiveUpdate(updated, messageId, sender)
    return { messageId }
  }

  const mockQuoteAcceptedThenUpdated = async (
    hours: number,
    edits: Partial<IQuoteBase> = {},
    messageId: string = 'test-message-id',
    sender: string = bank.companyStaticId
  ): Promise<IMockedReceivedUpdate> => {
    const { quote: accepted } = await createAcceptedRD(trader, bank, rdBase, mockUtils)
    const updated = {
      ...accepted,
      ...edits,
      createdAt: datePlusHours(accepted.createdAt, hours)
    }
    await mockReceiveUpdate(updated, messageId, sender)
    return { accepted, updated, messageId }
  }
})
