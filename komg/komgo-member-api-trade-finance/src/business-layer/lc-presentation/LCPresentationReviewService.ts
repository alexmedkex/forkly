import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILC } from '../../data-layer/models/ILC'
import { TYPES } from '../../inversify/types'
import { ILCPresentationDataAgent } from '../../data-layer/data-agents'
import { LCPresentationStatus } from '@komgo/types'
import { IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { ILCPresentationTransactionManager } from '../blockchain/LCPresentationTransactionManager'
import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { ILCPresentationReviewService } from './ILCPresentationReviewService'
import { DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { DOCUMENT_STATUS, IReceivedDocumentsResponse } from '../documents/IReceivedDocuments'
import { ILCPresentationTaskFactory } from '../tasks/LCPresentationTaskFactory'
import { TaskStatus, TaskManager } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../tasks/LCPresentationTaskType'
import {
  resolveDisrepantStatus,
  resolveCompliantStatus,
  resolveAdviseStatus,
  resolveDiscrepanciesAcceptStatus,
  resolveDiscrepanciesRejectStatus
} from './reviewStateUtil'
import { ISharedDocumentsResponse } from '../documents/ISharedDocumentsResponse'
import { IPresentationSharedDocuments } from './IPresentationSharedDocuments'
import { CONFIG } from '../../inversify/config'
import { InvalidOperationException, InvalidMessageException } from '../../exceptions'
import { getCurrentPresentationRole, LCPresentationRole } from '../events/LCPresentation/LCPresentationRole'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

@injectable()
export class LCPresentationReviewService implements ILCPresentationReviewService {
  private readonly logger = getLogger('LCPresentationFeedbackService')

  constructor(
    @inject(TYPES.LCPresentationDataAgent) private readonly presentationDataAgent: ILCPresentationDataAgent,
    @inject(TYPES.DocumentServiceClient) private readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTransactionManager)
    private readonly transactionManager: ILCPresentationTransactionManager,
    @inject(TYPES.LCPresentationTaskFactory) private readonly presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) private readonly taskManager: TaskManager,
    @inject(CONFIG.CompanyStaticId) private readonly companyStaticId: string
  ) {}

  async markCompliant(presentation: ILCPresentation, lc: ILC): Promise<any> {
    const nextStatus = await resolveCompliantStatus(presentation, this.companyStaticId)

    if (this.getError(nextStatus)) {
      throw new InvalidOperationException(nextStatus.error)
    }

    const receivedDocuments = await this.getReceivedDocuments(presentation)
    const documents = receivedDocuments.reduce((result, received) => result.concat(received.documents), [])
    if (!documents.every(document => document.status !== DOCUMENT_STATUS.Rejected)) {
      throw new InvalidOperationException('Presentation cannot be Compliant, presentation contains rejected documents')
    }

    return this.executePresentationAction(
      lc,
      presentation,
      nextStatus,
      (presentationData: ILCPresentation, contractAddress: string) => {
        if (nextStatus === LCPresentationStatus.DocumentsCompliantByNominatedBank) {
          return this.transactionManager.nominatedBankSetDocumentsCompliant(contractAddress, presentationData)
        }

        if (nextStatus === LCPresentationStatus.DocumentsCompliantByIssuingBank) {
          return this.transactionManager.issuingBankSetDocumentsCompliant(contractAddress, presentationData)
        }
        this.logger.error(
          ErrorCode.ValidationInvalidOperation,
          ErrorNames.LCPresentationMarkPresentationFailed,
          'Failed to mark presentation compliant',
          { presentationId: presentation.staticId },
          new Error().stack
        )
        throw new InvalidOperationException(`Invalid presentation next Status resolved: ${nextStatus}`)
      }
    )
  }

  async markDiscrepant(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any> {
    const nextStatus = resolveDisrepantStatus(presentation, this.companyStaticId)

    if (this.getError(nextStatus)) {
      throw new InvalidOperationException(nextStatus.error)
    }

    const receivedDocuments = await this.getReceivedDocuments(presentation)
    const documents = receivedDocuments.reduce((result, received) => result.concat(received.documents), [])
    if (documents.some(document => !document.status)) {
      throw new InvalidOperationException('Presentation cannot be mark as Discrepant, all documents must be reviewed')
    }

    return this.executePresentationAction(
      lc,
      presentation,
      nextStatus,
      (presentationData: ILCPresentation, contractAddress: string) => {
        if (nextStatus === LCPresentationStatus.DocumentsDiscrepantByNominatedBank) {
          return this.transactionManager.nominatedBankSetDocumentsDiscrepant(contractAddress, presentationData, comment)
        }

        if (nextStatus === LCPresentationStatus.DocumentsDiscrepantByIssuingBank) {
          return this.transactionManager.issuingBankSetDocumentsDiscrepant(contractAddress, presentationData, comment)
        }

        throw new InvalidOperationException(`Invalid presentation next Status resolved: ${nextStatus}`)
      }
    )
  }

  async adviseDiscrepancies(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any> {
    const nextStatus = resolveAdviseStatus(presentation, this.companyStaticId)

    if (this.getError(nextStatus)) {
      throw new InvalidOperationException(nextStatus.error)
    }

    return this.executePresentationAction(
      lc,
      presentation,
      nextStatus,
      (presentationData: ILCPresentation, contractAddress: string) => {
        if (nextStatus === LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank) {
          return this.transactionManager.nominatedBankAdviseDiscrepancies(contractAddress, presentationData, comment)
        }

        if (nextStatus === LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank) {
          return this.transactionManager.issungBankAdviseDiscrepancies(contractAddress, presentationData, comment)
        }

        throw new InvalidOperationException(`Invalid presentation next Status resolved: ${nextStatus}`)
      }
    )
  }

  async acceptDiscrepancies(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any> {
    const nextStatus = resolveDiscrepanciesAcceptStatus(presentation, this.companyStaticId)

    if (this.getError(nextStatus)) {
      throw new InvalidOperationException(nextStatus.error)
    }

    return this.executePresentationAction(
      lc,
      presentation,
      nextStatus,
      (presentationData: ILCPresentation, contractAddress: string) => {
        if (nextStatus === LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank) {
          return this.transactionManager.issuingBankSetDiscrepanciesAccepted(contractAddress, presentationData, comment)
        }

        if (nextStatus === LCPresentationStatus.DocumentsAcceptedByApplicant) {
          return this.transactionManager.applicantSetDiscrepanciesAccepted(contractAddress, presentationData, comment)
        }

        throw new InvalidOperationException(`Invalid presentation next Status resolved: ${nextStatus}`)
      }
    )
  }

  async rejectDiscrepancies(presentation: ILCPresentation, lc: ILC, comment: string): Promise<any> {
    const nextStatus = resolveDiscrepanciesRejectStatus(presentation, this.companyStaticId)

    if (this.getError(nextStatus)) {
      throw new InvalidOperationException(nextStatus.error)
    }

    return this.executePresentationAction(
      lc,
      presentation,
      nextStatus,
      (presentationData: ILCPresentation, contractAddress: string) => {
        if (nextStatus === LCPresentationStatus.DiscrepanciesRejectedByIssuingBank) {
          return this.transactionManager.issuingBankSetDiscrepanciesRejected(contractAddress, presentationData, comment)
        }

        if (nextStatus === LCPresentationStatus.DiscrepanciesRejectedByApplicant) {
          return this.transactionManager.applicantSetDiscrepanciesRejected(contractAddress, presentationData, comment)
        }

        throw new InvalidOperationException(`Invalid presentation next Status resolved: ${nextStatus}`)
      }
    )
  }

  getReceivedDocuments(presentation: ILCPresentation): Promise<IReceivedDocumentsResponse[]> {
    const presentationContext = this.documentRequestBuilder.getPresentationDocumentSearchContext(presentation)
    return this.documentClient.getReceivedDocuments(DOCUMENT_PRODUCT.TradeFinance, presentationContext)
  }

  async getDocumentsFeedback(presentation: ILCPresentation): Promise<IPresentationSharedDocuments> {
    if (presentation.beneficiaryId !== this.companyStaticId) {
      throw new InvalidOperationException(`Documents feedback is available just for beneficiary`)
    }

    if (
      presentation.status === LCPresentationStatus.Draft ||
      presentation.status === LCPresentationStatus.DocumentsPresented
    ) {
      throw new InvalidOperationException(
        `Document feedback not available for presentation in "DocumentPresented" or "Draft" status`
      )
    }
    const companyId = this.getFeedbackCompany(presentation)
    const sharedDocuments = await this.getSharedDocuments(presentation, companyId)
    return {
      companyId,
      documents: sharedDocuments.reduce((result, shared) => result.concat(shared.documents), []),
      feedbackReceived: sharedDocuments.every(shared => shared.feedbackReceived)
    }
  }

  async sendDocumentFeedback(presentation: ILCPresentation): Promise<void> {
    this.logger.info('Sending document feedback for presentation', {
      presentationId: presentation.staticId,
      reference: presentation.reference
    })
    try {
      const presentationContext = this.documentRequestBuilder.getPresentationDocumentSearchContext(presentation)
      const receivedDocuments = await this.documentClient.getReceivedDocuments(
        DOCUMENT_PRODUCT.TradeFinance,
        presentationContext
      )

      if (!receivedDocuments || receivedDocuments.length === 0) {
        this.logPresentationError(
          ErrorCode.DatabaseMissingData,
          ErrorNames.LCPresentationReviewServiceDocumentNotFound,
          'Received document not found',
          presentation,
          {}
        )

        throw new InvalidMessageException(
          `Received document to send feedback for not found, Presentation id: ${presentation.staticId}`
        )
      }

      await Promise.all(
        receivedDocuments.map(receivedDoc => {
          return this.documentClient.sendDocumentFeedback(DOCUMENT_PRODUCT.TradeFinance, receivedDoc.id)
        })
      )
    } catch (error) {
      this.logPresentationError(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.LCPresentationReviewServiceSendDocumentFailed,
        'Sending document feedback failed',
        presentation,
        error
      )

      throw error
    }
  }

  private async executePresentationAction(
    lc: ILC,
    presentation: ILCPresentation,
    state: LCPresentationStatus,
    action: (presentation: ILCPresentation, contractAddress: string) => Promise<string>
  ) {
    try {
      this.logger.info(`Pending status for presentation: ${presentation.staticId}`, {
        presentationId: presentation.staticId,
        reference: presentation.reference
      })
      presentation.destinationState = state
      await this.presentationDataAgent.savePresentation(presentation)
      await this.updateTask(lc, presentation, TaskStatus.Pending, true)
    } catch (error) {
      this.logger.info('Failed setting pending status. Continuing....', {
        presentationId: presentation.staticId,
        reference: presentation.reference
      })
    }

    this.logger.info(`Executing presentation action for presentation ${presentation.staticId}`, {
      presentationId: presentation.staticId,
      reference: presentation.reference
    })

    const contractAddress = presentation.contracts[presentation.contracts.length - 1].contractAddress

    try {
      return action(presentation, contractAddress)
    } catch (error) {
      presentation.destinationState = null

      this.logger.info('Pending status for presentation, reverting...', {
        presentation
      })
      await this.presentationDataAgent.savePresentation(presentation)
      await this.updateTask(lc, presentation, TaskStatus.ToDo, true)

      throw error
    }
  }
  private async getSharedDocuments(
    presentation: ILCPresentation,
    companyId: string
  ): Promise<ISharedDocumentsResponse[]> {
    const presentationContext = this.documentRequestBuilder.getPresentationDocumentSearchContext(presentation)
    const sharedDocuments = await this.documentClient.getSendDocumentFeedback(
      DOCUMENT_PRODUCT.TradeFinance,
      presentationContext
    )
    return sharedDocuments.filter(doc => doc.companyId === companyId)
  }

  private async updateTask(lc: ILC, presentation: ILCPresentation, taskStatus: TaskStatus, outcome: boolean) {
    try {
      const context = this.presentationTaskFactory.getTaskContext(
        LCPresentationTaskType.ReviewPresentation,
        presentation,
        lc
      )

      await this.taskManager.updateTaskStatus({
        status: taskStatus,
        taskType: LCPresentationTaskType.ReviewPresentation,
        context,
        outcome
      })
    } catch (error) {
      this.logger.info('Failed to set Task status', {
        errorMessage: error.message,
        taskStatus
      })
    }
  }

  private getError(data: LCPresentationStatus | { error: string }): data is { error: string } {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    return (<{ error: string }>data).error !== undefined
  }

  private logPresentationError(
    errorCode: ErrorCode,
    errorName: string,
    message: string,
    presentation: ILCPresentation,
    error
  ) {
    let context: any = {
      presentationId: presentation.staticId,
      reference: presentation.reference
    }

    if (error) {
      context = {
        ...context,
        erorrObject: error,
        erroMessage: error.message
      }
    }

    this.logger.error(errorCode, errorName, message, context, new Error().stack)
  }

  private getFeedbackCompany(presentation: ILCPresentation) {
    if (
      presentation.status === LCPresentationStatus.DocumentsCompliantByNominatedBank ||
      presentation.status === LCPresentationStatus.DocumentsDiscrepantByNominatedBank
    ) {
      return presentation.nominatedBankId || presentation.issuingBankId
    }
    return presentation.issuingBankId
  }
}
