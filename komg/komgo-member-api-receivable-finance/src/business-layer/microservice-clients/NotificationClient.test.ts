import { INotificationCreateRequest, NotificationLevel, NotificationManager } from '@komgo/notification-publisher'
import { tradeFinanceManager } from '@komgo/permissions'
import { buildFakeReceivablesDiscountingExtended, buildFakeTradeSnapshot, ReplyType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import * as ServerMock from 'mock-http-server'
import 'reflect-metadata'

import { PRODUCT_ID, SubProductId } from '../../constants'
import { TradeSnapshotDataAgent } from '../../data-layer/data-agents'
import { NotificationType, UpdateType } from '../types'

import { CompanyRegistryClient } from './CompanyRegistryClient'
import { NotificationClient } from './NotificationClient'

describe('NotificationClient', () => {
  let client: NotificationClient
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)

    client = new NotificationClient(
      new NotificationManager('http://localhost:9001'),
      mockTradeSnapshotDataAgent,
      mockCompanyRegistryClient,
      'company-static-id',
      'http://localhost:3010',
      0
    )
  })

  describe('sendNotification', () => {
    const server = new ServerMock({ host: 'localhost', port: 9001 }, null)
    const mockNotification: INotificationCreateRequest = {
      productId: 'productId',
      type: 'RFP.info',
      level: NotificationLevel.info,
      requiredPermission: {
        productId: 'RD',
        actionId: 'manageRD'
      },
      context: { producId: 'tradeFinance', subProductId: 'RD' },
      message: 'string'
    }

    beforeEach(done => {
      server.start(done)
    })

    afterEach(done => {
      server.stop(done)
    })

    it('sends notification', async done => {
      server.on({
        method: 'POST',
        path: '/v0/notifications',
        reply: {
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({})
        }
      })

      await client.sendNotification(mockNotification)

      const requests = server.requests({ method: 'POST', path: '/v0/notifications' })
      expect(requests.length).toEqual(1)
      done()
    })

    it('does not fail sending a notification on 404', async done => {
      server.on({
        method: 'POST',
        path: '/v0/notifications',
        reply: {
          status: 404
        }
      })

      await client.sendNotification(mockNotification)

      const requests = server.requests({ method: 'POST', path: '/v0/notifications' })
      expect(requests.length).toEqual(1)

      done()
    })
  })

  describe('createDocumentReceivedNotification', () => {
    it('should return a notification object successfully for an RD document', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Seller Company')
      mockCompanyRegistryInfo('Bank', true)

      const notification = await client.createDocumentReceivedNotification(
        rd,
        'sender-static-id',
        'Commercial Contract',
        { subProductId: SubProductId.ReceivableDiscounting }
      )
      expect(notification).toMatchObject({
        context: {
          rdId: rd.staticId,
          documentType: 'Commercial Contract',
          senderStaticId: 'sender-static-id',
          subProductId: SubProductId.ReceivableDiscounting
        },
        level: 'info',
        message: `Commercial Contract received from Seller Company for receivable discounting for Trade ID ${rd.tradeReference.sellerEtrmId}`,
        productId: 'tradeFinance',
        requiredPermission: {
          actionId: 'manageRDRequest',
          productId: 'tradeFinance'
        },
        type: 'RD.Document.info'
      })
    })

    it('should return a bank notification object successfully for an RD document', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Seller Company')
      mockCompanyRegistryInfo('Bank', true)

      const notification = await client.createDocumentReceivedNotification(
        rd,
        'sender-static-id',
        'Commercial Contract',
        { subProductId: SubProductId.ReceivableDiscounting }
      )
      expect(notification).toMatchObject({
        requiredPermission: {
          actionId: 'manageRDRequest',
          productId: 'tradeFinance'
        }
      })
    })

    it('should return a trader notification object successfully for an RD document', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Bank 1')
      mockCompanyRegistryInfo('Seller Company', false)

      const notification = await client.createDocumentReceivedNotification(
        rd,
        'sender-static-id',
        'Commercial Contract',
        { subProductId: SubProductId.ReceivableDiscounting }
      )
      expect(notification).toMatchObject({
        requiredPermission: {
          actionId: 'manageRD',
          productId: 'tradeFinance'
        }
      })
    })

    it('should return a notification object successfully for a Trade document', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('Seller Company')
      mockCompanyRegistryInfo('Bank', true)

      const notification = await client.createDocumentReceivedNotification(
        rd,
        'sender-static-id',
        'Commercial Contract',
        { subProductId: SubProductId.Trade }
      )
      expect(notification).toMatchObject({
        context: {
          rdId: rd.staticId,
          documentType: 'Commercial Contract',
          senderStaticId: 'sender-static-id',
          subProductId: SubProductId.Trade
        },
        emailData: {
          subject: 'Risk Cover / Receivable Discounting',
          taskLink: 'http://localhost:3010/notifications',
          taskTitle: 'Commercial Contract received for receivable discounting'
        },
        level: 'info',
        message: `Commercial Contract received from Seller Company for receivable discounting for Trade ID ${rd.tradeReference.sellerEtrmId}`,
        productId: 'tradeFinance',
        requiredPermission: {
          actionId: 'manageRDRequest',
          productId: 'tradeFinance'
        },
        type: 'RD.Document.info'
      })
    })

    it('should not fail if api registry fails', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockCompanyRegistryClient.getCompanyNameFromStaticId.mockImplementationOnce(() => {
        throw new Error()
      })

      const promise = client.createDocumentReceivedNotification(rd, 'sender-static-id', 'Commercial Contract', {
        subProductId: 'sub-product-id'
      })

      await expect(promise).resolves.toMatchObject({
        context: {
          documentType: 'Commercial Contract',
          rdId: rd.staticId,
          senderStaticId: 'sender-static-id',
          subProductId: 'sub-product-id'
        },
        emailData: {
          subject: 'Risk Cover / Receivable Discounting',
          taskLink: 'http://localhost:3010/notifications',
          taskTitle: 'Commercial Contract received for receivable discounting'
        },
        level: 'info',
        message: 'Commercial Contract received from Unknown Sender for receivable discounting for Trade ID ID123-5467',
        productId: 'tradeFinance',
        requiredPermission: {
          actionId: 'manageRDRequest',
          productId: 'tradeFinance'
        },
        type: 'RD.Document.info'
      })
    })
  })

  describe('createUpdateNotification', () => {
    it('should return a notification object successfully', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      const mockContext = {
        producId: 'myProductId'
      }
      const senderStaticId = 'senderStaticId'
      const expectedNotif = {
        productId: PRODUCT_ID,
        type: NotificationType.RDUpdate,
        level: NotificationLevel.info,
        requiredPermission: {
          productId: PRODUCT_ID,
          actionId: tradeFinanceManager.canReadRDRequests.action
        },
        context: {
          ...mockContext,
          senderStaticId,
          updateType: UpdateType.ReceivablesDiscounting,
          createdAt: rd.createdAt
        },
        message: `Receivable discounting data updated for ${rd.tradeReference.sellerEtrmId} by Seller Company on Buyer Company`,
        emailData: {
          subject: 'Risk Cover / Receivable Discounting',
          taskTitle: `Receivables discounting updated for trade ${rd.tradeReference.sellerEtrmId}`
        }
      }

      const mockTradeSnapshot = buildFakeTradeSnapshot()
      mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(mockTradeSnapshot)
      mockCompanyRegistryClient.getCompanyNameFromStaticId
        .mockResolvedValueOnce('Seller Company')
        .mockResolvedValueOnce('Buyer Company')

      const notification = await client.createUpdateNotification(
        rd,
        senderStaticId,
        UpdateType.ReceivablesDiscounting,
        tradeFinanceManager.canReadRDRequests.action,
        mockContext,
        rd.createdAt
      )
      expect(notification).toMatchObject(expectedNotif)
    })

    it('should not fail if mongoDB returns an error', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      const mockContext = {
        producId: 'myProductId'
      }
      const senderStaticId = 'senderStaticId'
      const expectedNotif = {
        productId: PRODUCT_ID,
        type: NotificationType.RDUpdate,
        level: NotificationLevel.info,
        requiredPermission: {
          productId: PRODUCT_ID,
          actionId: tradeFinanceManager.canReadRDRequests.action
        },
        context: {
          ...mockContext,
          senderStaticId,
          updateType: UpdateType.ReceivablesDiscounting,
          createdAt: rd.createdAt
        },
        message: `Receivables discounting updated for trade ${rd.tradeReference.sellerEtrmId}`
      }

      mockTradeSnapshotDataAgent.findByTradeSourceId.mockRejectedValueOnce(new Error())

      const notification = await client.createUpdateNotification(
        rd,
        senderStaticId,
        UpdateType.ReceivablesDiscounting,
        tradeFinanceManager.canReadRDRequests.action,
        mockContext,
        rd.createdAt
      )

      expect(notification).toMatchObject({
        ...expectedNotif,
        emailData: {
          subject: 'Risk Cover / Receivable Discounting',
          taskTitle: `Receivables discounting updated for trade ${rd.tradeReference.sellerEtrmId}`
        }
      })
    })
  })

  describe('createRFPNotification', () => {
    it('should return a notification object successfully', async () => {
      const mockContext = {
        myField: 'myContext'
      }
      const actionId = tradeFinanceManager.canReadRDRequests.action
      const senderStaticId = 'senderStaticId'

      const expectedNotif = {
        productId: PRODUCT_ID,
        type: NotificationType.RFPInfo,
        level: NotificationLevel.info,
        requiredPermission: {
          productId: PRODUCT_ID,
          actionId
        },
        emailData: {
          subject: 'Risk Cover / Receivable Discounting',
          taskLink: 'http://localhost:3010/notifications',
          taskTitle: 'notification email message'
        },
        context: {
          ...mockContext,
          replyType: ReplyType.Submitted,
          senderStaticId
        },
        message: 'notification message'
      }

      const notification = await client.createRFPNotification(
        mockContext,
        ReplyType.Submitted,
        'notification message',
        actionId,
        senderStaticId,
        'notification email message'
      )
      expect(notification).toEqual(expectedNotif)
    })
  })

  const mockCompanyRegistryInfo = (O: string, isFinancialInstitution: boolean) => {
    mockCompanyRegistryClient.getCompanyInfoFromStaticId.mockResolvedValueOnce({
      x500Name: {
        O
      },
      isFinancialInstitution
    })
  }
})
