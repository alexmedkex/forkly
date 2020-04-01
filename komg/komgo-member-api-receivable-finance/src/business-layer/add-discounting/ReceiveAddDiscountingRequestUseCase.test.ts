import { buildFakeReceivablesDiscountingExtended, IReceivablesDiscounting } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'

import { ReplyDataAgent, ReceivablesDiscountingDataAgent } from '../../data-layer/data-agents'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'
import { InvalidPayloadProcessingError, EntityNotFoundError, ValidationFieldError } from '../errors'
import { buildFakeAddDiscountingMessage } from '../messaging/faker'
import { TaskClient, CompanyRegistryClient } from '../microservice-clients'
import { IReceivableFinanceMessage, IAddDiscountingPayload } from '../types'
import { AcceptedRDValidator, AddDiscountingValidator } from '../validation'

import { ReceiveAddDiscountingRequestUseCase } from './ReceiveAddDiscountingRequestUseCase'

const mockRD = buildFakeReceivablesDiscountingExtended()
const mockReply = buildFakeReply()

describe('ReceiveAddDiscountingRequestUseCase', () => {
  let useCase: ReceiveAddDiscountingRequestUseCase
  let msg: IReceivableFinanceMessage<IAddDiscountingPayload<IReceivablesDiscounting>>
  let mockAcceptedRDValidator: jest.Mocked<AcceptedRDValidator>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>
  let mockAddDiscountingValidator: jest.Mocked<AddDiscountingValidator>
  let mockReceivablesDiscountingDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockTaskClient: jest.Mocked<TaskClient>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>

  beforeEach(() => {
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)
    mockAcceptedRDValidator = createMockInstance(AcceptedRDValidator)
    mockAddDiscountingValidator = createMockInstance(AddDiscountingValidator)
    mockReceivablesDiscountingDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)
    mockTaskClient = createMockInstance(TaskClient)
    useCase = new ReceiveAddDiscountingRequestUseCase(
      mockAcceptedRDValidator,
      mockReplyDataAgent,
      mockAddDiscountingValidator,
      mockReceivablesDiscountingDataAgent,
      mockTaskClient,
      mockCompanyRegistryClient
    )
    msg = buildFakeAddDiscountingMessage(mockRD.staticId, mockRD)
  })

  describe('Success', () => {
    it('successfully creates an RD and reply and a task for the bank', async () => {
      const exampleTask = {} as any
      mockCompanyRegistryClient.getCompanyNameFromStaticId.mockResolvedValueOnce('BP')
      mockTaskClient.createTaskRequest.mockReturnValueOnce(exampleTask)

      await useCase.execute(msg)

      expect(mockReceivablesDiscountingDataAgent.updateCreate).toHaveBeenCalledWith(msg.data.entry)
      expect(mockReplyDataAgent.create).toHaveBeenCalledWith(msg.data.reply)
      expect(mockTaskClient.sendTask).toHaveBeenCalledWith(
        exampleTask,
        `BP has requested to add discounting for trade ID ${msg.data.entry.tradeReference.sourceId}`
      )
    })
  })

  describe('Failures', () => {
    it('should fail with InvalidPayloadProcessingError if the RD does not exist', async () => {
      mockAcceptedRDValidator.validateRDAccepted.mockRejectedValueOnce(new EntityNotFoundError('entity not found'))

      const promise = useCase.execute(msg)

      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"entity not found"`)
    })

    it('should fail with InvalidPayloadProcessingError if a quote has not been accepted for the RD', async () => {
      mockAcceptedRDValidator.validateRDAccepted.mockRejectedValueOnce(
        new ValidationFieldError('no quote was accepted for RD', {})
      )

      const promise = useCase.execute(msg)

      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"no quote was accepted for RD"`)
    })

    it('should fail with an unknown error if validation fails with unknown error', async () => {
      mockAcceptedRDValidator.validateRDAccepted.mockRejectedValueOnce(new Error('unexpected'))

      const promise = useCase.execute(msg)

      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"unexpected"`)
    })

    it('should fail with an InvalidPayloadProcessingError if there already exists an add discounting reply', async () => {
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(mockReply)

      const promise = useCase.execute(msg)

      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Received add discouting request has already been received for the chosen RD"`
      )
    })

    it('should fail with an InvalidPayloadProcessingError if the entry is invalid', async () => {
      mockAddDiscountingValidator.validate.mockImplementationOnce(() => {
        throw new ValidationFieldError('failed schema validation', {})
      })

      const promise = useCase.execute(msg)

      await expect(promise).rejects.toThrowError(InvalidPayloadProcessingError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"failed schema validation"`)
    })

    it('should fail with an unknown error if validation fails with unknown error', async () => {
      mockAddDiscountingValidator.validate.mockImplementationOnce(() => {
        throw new Error('Unexpected error during schema validation')
      })

      const promise = useCase.execute(msg)

      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Unexpected error during schema validation"`)
    })
  })
})
