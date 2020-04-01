import { buildFakeDocumentReceivedMessage, buildFakeDocumentReceived } from '@komgo/messaging-types'
import Axios, { AxiosRequestConfig } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import waitForExpect from 'wait-for-expect'

import { SubProductId } from '../src/constants'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { receiveRFP } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('Receive.Document.integration.test', () => {
  let iEnv: IntegrationEnvironment
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let mockUtils: RFPMockUtils

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
    mockUtils.mockSuccessfulTaskOrNotification()
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

  describe('Failure', () => {
    it('should reject a message without a sender static ID', async () => {
      const rdId = await receiveRFP(trader, mockUtils)
      const msg = buildFakeDocumentReceivedMessage({
        senderStaticId: null,
        documents: [
          buildFakeDocumentReceived({
            context: { rdId, subProductId: 'rd' },
            typeName: 'Test type name',
            senderStaticId: 'sender-staticId'
          })
        ]
      })

      const messageId = 'test-message-id'
      await publishDocumentMessage(msg, true, { messageId })

      await messagingTestUtility.assertRejectedMessageFromDocuments(messageId)
    })
    it('should reject a message without a context', async () => {
      const rdId = await receiveRFP(trader, mockUtils)
      const msg = buildFakeDocumentReceivedMessage({
        context: null,
        documents: [
          buildFakeDocumentReceived({
            context: { rdId, subProductId: 'rd' },
            typeName: 'Test type name',
            senderStaticId: 'sender-staticId'
          })
        ]
      })

      const messageId = 'test-message-id'
      await publishDocumentMessage(msg, true, { messageId })

      await messagingTestUtility.assertRejectedMessageFromDocuments(messageId)
    })
    it('should reject a message without a product ID in its context', async () => {
      const rdId = await receiveRFP(trader, mockUtils)
      const msg = buildFakeDocumentReceivedMessage({
        context: { productId: null },
        documents: [
          buildFakeDocumentReceived({
            context: { rdId, subProductId: 'rd' },
            typeName: 'Test type name',
            senderStaticId: 'sender-staticId'
          })
        ]
      })

      const messageId = 'test-message-id'
      await publishDocumentMessage(msg, true, { messageId })

      await messagingTestUtility.assertRejectedMessageFromDocuments(messageId)
    })
    it('should reject a message without documents', async () => {
      const msg = buildFakeDocumentReceivedMessage({
        context: { productId: null },
        documents: []
      })

      const messageId = 'test-message-id'
      await publishDocumentMessage(msg, true, { messageId })

      await messagingTestUtility.assertRejectedMessageFromDocuments(messageId)
    })
  })

  it('should successfully send document received notification for an RD document as a bank', async () => {
    const rdId = await receiveRFP(trader, mockUtils)
    const msg = buildFakeDocumentReceivedMessage({
      senderStaticId: 'sender-staticId',
      documents: [
        buildFakeDocumentReceived({
          context: { rdId, subProductId: 'rd' },
          typeName: 'Test type name'
        })
      ]
    })

    let cfg: AxiosRequestConfig
    mockUtils.captureSuccessfulTaskOrNotifiation((config: AxiosRequestConfig) => (cfg = config))
    await publishDocumentMessage(msg, true)

    await waitForExpect(() =>
      expect(JSON.parse(cfg.data)).toMatchObject({
        productId: 'tradeFinance',
        type: 'RD.Document.info',
        level: 'info',
        requiredPermission: { productId: 'tradeFinance', actionId: 'manageRDRequest' },
        context: {
          subProductId: SubProductId.ReceivableDiscounting,
          documentType: 'Test type name',
          senderStaticId: 'sender-staticId',
          rdId
        }
      })
    )
  })

  it('should successfully send document received notification for a trade document as a bank', async () => {
    const rdInfo = await receiveRFPInfo()
    const msg = buildFakeDocumentReceivedMessage({
      senderStaticId: 'sender-staticId',
      documents: [
        buildFakeDocumentReceived({
          context: { vaktId: rdInfo.tradeSnapshot.sourceId, subProductId: 'trade' },
          typeName: 'Test type name'
        })
      ]
    })

    let cfg: AxiosRequestConfig
    mockUtils.captureSuccessfulTaskOrNotifiation((config: AxiosRequestConfig) => (cfg = config))
    await publishDocumentMessage(msg, true) // is financial institution

    await waitForExpect(() =>
      expect(JSON.parse(cfg.data)).toMatchObject({
        productId: 'tradeFinance',
        type: 'RD.Document.info',
        level: 'info',
        requiredPermission: { productId: 'tradeFinance', actionId: 'manageRDRequest' },
        context: {
          subProductId: SubProductId.Trade,
          documentType: 'Test type name',
          senderStaticId: 'sender-staticId',
          rdId: rdInfo.rd.staticId
        }
      })
    )
  })

  it('should successfully send document received notification for a trader', async () => {
    const rdInfo = await receiveRFPInfo()
    const msg = buildFakeDocumentReceivedMessage({
      senderStaticId: 'sender-staticId',
      documents: [
        buildFakeDocumentReceived({
          context: { vaktId: rdInfo.tradeSnapshot.sourceId, subProductId: 'trade' },
          typeName: 'Test type name'
        })
      ]
    })

    let cfg: AxiosRequestConfig
    mockUtils.captureSuccessfulTaskOrNotifiation((config: AxiosRequestConfig) => (cfg = config))
    await publishDocumentMessage(msg, false) // not financial institution

    await waitForExpect(() =>
      expect(JSON.parse(cfg.data)).toMatchObject({
        requiredPermission: { productId: 'tradeFinance', actionId: 'manageRD' }
      })
    )
  })

  const receiveRFPInfo = async () => {
    const rdId = await receiveRFP(trader, mockUtils)
    return bank.getRDInfo(rdId)
  }

  const publishDocumentMessage = async (message: any, isFinancialInstitution: boolean, options?: any) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulGetCompanyEntry({ isFinancialInstitution })
    await trader.publishDocumentReceived(message, options)
  }
})
