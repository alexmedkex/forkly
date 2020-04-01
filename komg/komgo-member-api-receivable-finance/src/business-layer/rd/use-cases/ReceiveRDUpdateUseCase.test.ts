import { tradeFinanceManager } from '@komgo/permissions'
import { buildFakeReceivablesDiscountingExtended, ReplyType, IReceivablesDiscounting } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { datePlusHours } from '../../../test-utils'
import { formatDateToYYYYmmDD } from '../../../utils'
import { InvalidPayloadProcessingError, ValidationFieldError } from '../../errors'
import { buildFakeReceivableFinanceMessage } from '../../messaging/faker'
import { NotificationClient } from '../../microservice-clients'
import { UpdateType } from '../../types'
import { ReceivablesDiscountingValidator } from '../../validation'

import { ReceiveRDUpdateUseCase } from './ReceiveRDUpdateUseCase'

describe('ReceiveRDUpdateUseCase', () => {
  const COMPANY_STATIC_ID = 'companyStaticId123'
  let useCase: ReceiveRDUpdateUseCase
  let mockRDDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockRDValidator: jest.Mocked<ReceivablesDiscountingValidator>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockNotificationClient: jest.Mocked<NotificationClient>

  beforeEach(() => {
    mockRDDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockRDValidator = createMockInstance(ReceivablesDiscountingValidator)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockNotificationClient = createMockInstance(NotificationClient)

    useCase = new ReceiveRDUpdateUseCase(
      mockRDDataAgent,
      mockRDValidator,
      mockReplyDataAgent,
      mockNotificationClient,
      COMPANY_STATIC_ID
    )
  })

  describe('success', () => {
    it('should update the RD', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, participantId: COMPANY_STATIC_ID })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)

      const mockMessage = createMessage({ ...currentRD, invoiceAmount: 10 })
      await useCase.execute(mockMessage)

      const updateRD = mockMessage.data.entry
      expect(mockRDDataAgent.updateCreate).toBeCalledWith(updateRD)
      expect(mockNotificationClient.createUpdateNotification).toHaveBeenCalledWith(
        updateRD,
        mockMessage.data.senderStaticId,
        mockMessage.data.updateType,
        tradeFinanceManager.canReadRDRequests.action,
        mockMessage.context,
        updateRD.createdAt
      )
      expect(mockNotificationClient.sendNotification).toHaveBeenCalled()
    })

    it('should format dates when calling validator', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, participantId: COMPANY_STATIC_ID })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)

      const mockMessage = createMessage({
        ...currentRD,
        invoiceAmount: 10,
        riskCoverDate: new Date() as any,
        discountingDate: new Date() as any
      })
      await useCase.execute(mockMessage)

      const updateRD = mockMessage.data.entry
      // strip as are not sent to validator
      delete updateRD.createdAt
      delete updateRD.updatedAt
      delete updateRD.staticId
      expect(mockRDValidator.validateFields).toBeCalledWith({
        ...updateRD,
        riskCoverDate: formatDateToYYYYmmDD(updateRD.riskCoverDate),
        discountingDate: formatDateToYYYYmmDD(updateRD.discountingDate)
      })
    })

    it('should succeed but not update if the update RD is older than the current RD in the DB', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)

      const mockMessage = createMessage({ ...currentRD, invoiceAmount: 10 }, -2)
      await useCase.execute(mockMessage)

      expect(mockRDDataAgent.findByStaticId).toHaveBeenCalled()
      expect(mockRDDataAgent.updateCreate).not.toHaveBeenCalled()
    })
  })

  describe('failures', () => {
    it('should throw InvalidPayloadProcessingError if the RD does not exist in the DB', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(null)

      const mockMessage = createMessage({ ...currentRD, invoiceAmount: 10 })

      await expect(useCase.execute(mockMessage)).rejects.toThrowError(InvalidPayloadProcessingError)
    })

    it('should throw InvalidPayloadProcessingError if the RD has not been accepted', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(null)

      const mockMessage = createMessage({ ...currentRD, invoiceAmount: 10 })

      await expect(useCase.execute(mockMessage)).rejects.toThrowError(InvalidPayloadProcessingError)
    })

    it('should throw InvalidPayloadProcessingError if the RD accepted was not for this company', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, participantId: 'NotThisCompany' })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)

      const mockMessage = createMessage({ ...currentRD, invoiceAmount: 10 })

      await expect(useCase.execute(mockMessage)).rejects.toThrowError(InvalidPayloadProcessingError)
    })

    it('will throw an InvalidPayloadProcessingError if fields that are not editable have changed', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      const invalidMockRdUpdate = {
        ...currentRD,
        numberOfDaysDiscounting: 101,
        tradeReference: { source: 'hugh', sourceId: 'id123', sellerEtrmId: '123sell' },
        advancedRate: 100011
      }
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, participantId: COMPANY_STATIC_ID })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)

      await expect(useCase.execute(createMessage(invalidMockRdUpdate))).rejects.toThrowError(
        InvalidPayloadProcessingError
      )
    })

    it('will throw an InvalidPayloadProcessingError if fields are invalid (validator throws)', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDValidator.validateFields.mockImplementationOnce(() => {
        throw new ValidationFieldError('', [] as any)
      })

      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, participantId: COMPANY_STATIC_ID })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)

      await expect(useCase.execute(createMessage(currentRD))).rejects.toThrowError(InvalidPayloadProcessingError)
    })

    it('should re-throw error if the data agent throws error', async () => {
      const currentRD = buildFakeReceivablesDiscountingExtended(true)
      mockRDDataAgent.findByStaticId.mockResolvedValueOnce(currentRD)
      const acceptedReply = buildFakeReply({ type: ReplyType.Accepted, participantId: COMPANY_STATIC_ID })
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(acceptedReply)
      mockRDDataAgent.updateCreate.mockRejectedValue(new Error())

      const mockMessage = createMessage({ ...currentRD, invoiceAmount: 10 })

      await expect(useCase.execute(mockMessage)).rejects.toThrowError(Error)
    })
  })

  function createMessage(currentRD: IReceivablesDiscounting, hours = 2) {
    const updateRD = { ...currentRD, createdAt: datePlusHours(currentRD.createdAt, hours) }
    return buildFakeReceivableFinanceMessage(updateRD, UpdateType.ReceivablesDiscounting)
  }
})
