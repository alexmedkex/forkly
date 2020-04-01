import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { ILCPresentationService } from './ILCPresentationService'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILC } from '../../data-layer/models/ILC'
import { TYPES } from '../../inversify/types'
import { ILCPresentationDataAgent } from '../../data-layer/data-agents'
import { LCPresentationStatus } from '@komgo/types'
import { DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { ILCPresentationDocument } from '../../data-layer/models/ILCPresentationDocument'
import { ILCPresentationTransactionManager } from '../blockchain/LCPresentationTransactionManager'
import { getPresentationParties } from './getPresentationParties'
import { LC_STATE } from '../events/LC/LCStates'
import { IDocumentRegisterResponse } from '../documents/IDocumentRegisterResponse'
import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { v4 as uuid4 } from 'uuid'
import { InvalidOperationException, InvalidDatabaseDataException } from '../../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

@injectable()
export class LCPresentationService implements ILCPresentationService {
  private readonly logger = getLogger('LCPresentationService')

  constructor(
    @inject(TYPES.LCPresentationDataAgent) private readonly presentationDataAgent: ILCPresentationDataAgent,
    @inject(TYPES.DocumentServiceClient) private readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTransactionManager)
    private readonly transactionManager: ILCPresentationTransactionManager
  ) {}

  async createNewPresentation(lc: ILC): Promise<ILCPresentation> {
    const presentation: ILCPresentation = {
      staticId: uuid4(),
      reference: new Date().getTime().toString(), // NOTE - temp, until reference generation is defined
      LCReference: lc.reference,
      ...getPresentationParties(lc),

      status: LCPresentationStatus.Draft,
      stateHistory: [
        {
          toState: LCPresentationStatus.Draft,
          performer: lc.beneficiaryId, // currently, only beneficiary creates presentation
          date: new Date()
        }
      ]
    }

    this.logger.info('saving presentation', {
      lc
    })

    const result = await this.presentationDataAgent.savePresentation(presentation)

    return result
  }

  async updatePresentation(presentation: ILCPresentation): Promise<ILCPresentation> {
    this.logger.info('updating presentation', {
      presentation
    })
    return this.presentationDataAgent.savePresentation(presentation)
  }

  async getLCPresentationById(id: string): Promise<ILCPresentation> {
    this.logger.info('getting presentation by id', {
      id
    })

    return this.presentationDataAgent.getById(id)
  }

  async getLCPresentation(attibutes): Promise<ILCPresentation> {
    this.logger.info('getting presentation', {
      attibutes
    })

    return this.presentationDataAgent.getByAttributes(attibutes)
  }

  async getLCPresentationByReference(reference: string): Promise<ILCPresentation> {
    this.logger.info('getting LC presentation by reference', {
      reference
    })

    return this.presentationDataAgent.getByReference(reference)
  }

  async getPresentationsByLcReference(reference: string): Promise<ILCPresentation[]> {
    this.logger.info('getting LC presentation by LC reference', {
      reference
    })

    return this.presentationDataAgent.getByLcReference(reference)
  }

  async getLCPresentationDocuments(lc: ILC, presentation: ILCPresentation): Promise<IDocumentRegisterResponse[]> {
    const documentsByReference: IDocumentRegisterResponse[] =
      (await this.documentClient.getDocuments(
        DOCUMENT_PRODUCT.TradeFinance,
        this.documentRequestBuilder.getPresentationDocumentSearchContext(presentation)
      )) || []

    let documentsByVaktId: IDocumentRegisterResponse[] = []
    if (
      presentation.documents &&
      lc.tradeAndCargoSnapshot &&
      lc.tradeAndCargoSnapshot.trade &&
      lc.tradeAndCargoSnapshot.trade.vaktId
    ) {
      documentsByVaktId =
        (await this.documentClient.getDocuments(
          DOCUMENT_PRODUCT.TradeFinance,
          this.documentRequestBuilder.getTradeDocumentContext(lc.tradeAndCargoSnapshot.trade.vaktId)
        )) || []
    } else {
      this.logger.info(`LC for ID ${lc._id} doesn't contain vaktId`, {
        lc,
        presentation
      })
    }

    const hashs = presentation.documents
      ? new Set(presentation.documents.map(({ documentHash }) => documentHash))
      : new Set([])

    documentsByVaktId = documentsByVaktId.filter(document => hashs.has(document.hash))

    return documentsByReference.concat(documentsByVaktId)
  }

  async deletePresentationById(id: string): Promise<void> {
    const presentation = await this.presentationDataAgent.getById(id)
    if (!this.isLcPresentationDraft(presentation)) {
      this.logger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCPresentationDeleteByIdFailed,
        `Delete LC presentation failed. Not in 'Draft' status.`,
        {
          presentationId: presentation.staticId,
          action: 'delete',
          entityType: 'LCPresentation',
          reference: presentation.reference
        },
        new Error().stack
      )
      throw new InvalidOperationException(`Delete LC presentation failed. Not in 'Draft' status.`)
    }
    await this.deleteDocuments(presentation)
    await this.presentationDataAgent.deleteLCPresentation(id)
    return
  }

  async deletePresentationDocument(presentationId: string, documentId: string): Promise<void> {
    const presentation = await this.presentationDataAgent.getById(presentationId)
    if (!this.isLcPresentationDraft(presentation)) {
      // Document can not be deleted because presentation is not in Draft state. Only Draft presentation can be changed
      this.logger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCPresentationDeleteDocumentFailed,
        `Failed to delete LC presentation. Not in 'Draft' status.`,
        {
          presentationId,
          action: 'delete',
          entityType: 'LCPresentationDocument',
          reference: presentation.reference,
          documentId
        },
        new Error().stack
      )
      throw new InvalidOperationException(`Failed to delete LC presentation. Not in 'Draft' status.`)
    }

    let document: ILCPresentationDocument = null
    if (presentation && presentation.documents) {
      document = presentation.documents.find(doc => doc.documentId === documentId)
    }

    if (!presentation || !presentation.documents || !document) {
      // Document is not inside presentation. Throw exception
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCPresentationDocumentNotFound,
        `No documentId found for ID ${documentId}`,
        documentId
      )
      throw new Error(`No documentId found for ID ${documentId}`)
    }

    // Remove document from documents list inside presentation
    presentation.documents = presentation.documents.filter(doc => doc.documentId !== documentId)

    this.logger.info('deleting LC presentation', {
      documentId
    })
    const documentDeleteResp = await this.documentClient.deleteDocument(DOCUMENT_PRODUCT.TradeFinance, documentId)

    // Set logging in case that document doesn't exist and vaktId is not set
    if (!documentDeleteResp) {
      // Log that document does not exist on KITE. Error don't need to be throw just log warn
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCPresentationDeleteDocumentWarning,
        `Failed to delete document for ID ${documentId}. No document found on document service.`,
        documentId
      )
    }

    await this.presentationDataAgent.savePresentation(presentation)
    return
  }

  async submitPresentation(presentation: ILCPresentation, comment: string, lc: ILC): Promise<string> {
    if (lc.status !== LC_STATE.ACKNOWLEDGED) {
      throw new InvalidOperationException('LC should be in the "Acknowledged" state')
    }

    if (presentation.status !== LCPresentationStatus.Draft) {
      throw new InvalidOperationException('Presenation should be in "Draft" status')
    }

    presentation.submittedAt = new Date()
    presentation.beneficiaryComments = comment
    const txHash = await this.transactionManager.deployDocPresented(presentation, lc)
    presentation.destinationState = LCPresentationStatus.DocumentsPresented
    presentation = await this.updatePresentation(presentation)

    return txHash
  }

  private isLcPresentationDraft(presentation: ILCPresentation): boolean {
    return presentation && presentation.status === LCPresentationStatus.Draft
  }

  private async deleteDocuments(presentation: ILCPresentation) {
    if (presentation.documents) {
      for (const document of presentation.documents) {
        const deletedDocument = await this.documentClient.deleteDocument(
          DOCUMENT_PRODUCT.TradeFinance,
          document.documentId
        )
        if (!deletedDocument) {
          this.logger.error(
            ErrorCode.DatabaseInvalidData,
            ErrorNames.LCPresentationDeleteDocumentByIdFailed,
            'Failed to delete document.',
            {
              productId: DOCUMENT_PRODUCT.TradeFinance,
              typeId: document.documentId
            },
            new Error().stack
          )
          throw new InvalidDatabaseDataException('Failed to delete document.')
        }
      }
    }
  }
}
