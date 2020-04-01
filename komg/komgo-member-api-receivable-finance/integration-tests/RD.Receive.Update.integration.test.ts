import { IReceivablesDiscounting, buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'
import waitForExpect from 'wait-for-expect'

import { buildFakeReceivableFinanceMessage } from '../src/business-layer/messaging/faker'
import { UpdateType } from '../src/business-layer/types'
import { ReceivablesDiscountingDataAgent } from '../src/data-layer/data-agents'
import { datePlusHours } from '../src/test-utils'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertRDsMatch, receiveAcceptedRD, receiveRFP } from './utils/test-utils'

describe('RD.Receive.Update integration tests', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let rdDataAgent: ReceivablesDiscountingDataAgent

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId) // Only banks receive RFP requests
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()

    rdDataAgent = new ReceivablesDiscountingDataAgent()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
    await bank.beforeEach(iEnv.iocContainer)
    mockUtils.mockSuccessfulTaskOrNotification()
  })

  afterEach(async () => {
    mockUtils.reset()

    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  describe('ack', () => {
    it('should save the received updated Receivable discounting data, maintain the received createdAt time and create a new updatedAt time', async () => {
      const rdId = await receiveAcceptedRD(trader, bank, mockUtils)
      const rd = await rdDataAgent.findByStaticId(rdId)
      const updateRd: IReceivablesDiscounting = {
        ...rd,
        invoiceAmount: rd.invoiceAmount + 1001,
        // set a createdAt date later than the original saved one, to mimic updating after it has been created
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
      }
      const rfMessage = buildFakeReceivableFinanceMessage(updateRd, UpdateType.ReceivablesDiscounting)

      await publishRDUpdate(rfMessage)
      await assertRDInDBWithCorrectTimestamps(rfMessage.data.entry)
    })

    it('should save multiple updated Receivable discounting data', async () => {
      const rdId = await receiveAcceptedRD(trader, bank, mockUtils)
      const rd = await rdDataAgent.findByStaticId(rdId)
      const updateRd1: IReceivablesDiscounting = {
        ...rd,
        invoiceAmount: rd.invoiceAmount + 1001,
        // set a createdAt date later than the original saved one, to mimic updating after it has been created
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
      }
      const rfMessage = buildFakeReceivableFinanceMessage(updateRd1, UpdateType.ReceivablesDiscounting)

      await publishRDUpdate(rfMessage)
      await assertRDInDBWithCorrectTimestamps(rfMessage.data.entry)

      const updateRd2: IReceivablesDiscounting = {
        ...updateRd1,
        invoiceAmount: updateRd1.invoiceAmount + 2000,
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
      }
      const rfMessage2 = buildFakeReceivableFinanceMessage(updateRd2, UpdateType.ReceivablesDiscounting)

      await publishRDUpdate(rfMessage2)
      await assertRDInDBWithCorrectTimestamps(rfMessage2.data.entry)
      await messagingTestUtility.assertNoRejectedMessageFromEventManagement()
    })

    it('should succeed but not update the RD update if it is older than the current RD stored', async () => {
      const rdId = await receiveAcceptedRD(trader, bank, mockUtils)

      const rd = await new ReceivablesDiscountingDataAgent().findByStaticId(rdId)
      const oldDate = new Date()
      oldDate.setHours(oldDate.getHours() - 2)
      const updateRd: IReceivablesDiscounting = {
        ...rd,
        invoiceAmount: rd.invoiceAmount + 1001,
        createdAt: oldDate.toJSON()
      }

      const options = { messageId: 'fixedMessageId' }
      const rfMessage = buildFakeReceivableFinanceMessage(updateRd, UpdateType.ReceivablesDiscounting)
      await publishRDUpdate(rfMessage, options)
      await messagingTestUtility.assertNoRejectedMessageFromEventManagement()
    })
  })

  describe('reject', () => {
    it('should reject an RD update message if the RD request has not been received', async () => {
      const options = { messageId: 'fixedMessageId' }
      const updateRd: IReceivablesDiscounting = buildFakeReceivablesDiscountingExtended(true)
      const rfMessage = buildFakeReceivableFinanceMessage(updateRd, UpdateType.ReceivablesDiscounting)
      await publishRDUpdate(rfMessage, options)
      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })

    it('should reject the RD update if the RD has not been accepted', async () => {
      // Bank receives a RFP Request from trader
      const rdId = await receiveRFP(trader, mockUtils)

      // Banks submits quote to trader
      mockUtils.mockSuccessfulRFPReply()
      const quoteId = await bank.createNewQuote()
      await bank.createNewQuoteSubmission(rdId, quoteId)

      const rd = await rdDataAgent.findByStaticId(rdId)
      const updateRd: IReceivablesDiscounting = {
        ...rd,
        invoiceAmount: rd.invoiceAmount + 1001,
        createdAt: new Date().toJSON()
      }

      const options = { messageId: 'fixedMessageId' }
      const rfMessage = buildFakeReceivableFinanceMessage(updateRd, UpdateType.ReceivablesDiscounting)

      await publishRDUpdate(rfMessage, options)
      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })

    it('should reject the RD update if uneditable fields have been updated', async () => {
      const rdId = await receiveAcceptedRD(trader, bank, mockUtils)

      const rd = await rdDataAgent.findByStaticId(rdId)
      const updateRd: IReceivablesDiscounting = {
        ...rd,
        numberOfDaysDiscounting: rd.numberOfDaysDiscounting + 101,
        advancedRate: 14,
        createdAt: datePlusHours(rd.createdAt, 2)
      }

      const options = { messageId: 'fixedMessageId' }
      const rfMessage = buildFakeReceivableFinanceMessage(updateRd, UpdateType.ReceivablesDiscounting)

      await publishRDUpdate(rfMessage, options)
      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })
  })

  const publishRDUpdate = async (message: any, options?: any) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    await trader.publishRDUpdate(message, options)
  }

  async function assertRDInDBWithCorrectTimestamps(publishedRD: IReceivablesDiscounting) {
    // @ts-ignore
    await waitForExpect(async () => {
      const savedRD = (await trader.getRDInfo(publishedRD.staticId)).rd
      assertRDsMatch(savedRD, publishedRD)
      expect(Date.parse(savedRD.createdAt)).toEqual(Date.parse(publishedRD.createdAt))
      expect(Date.parse(savedRD.updatedAt)).toEqual(Date.parse(publishedRD.updatedAt))
    })
  }
})
