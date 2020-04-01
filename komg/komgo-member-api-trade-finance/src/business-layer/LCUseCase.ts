import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { ICreateLCRequest } from '../../src/service-layer/requests/ILetterOfCredit'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { ILC } from '../data-layer/models/ILC'
import { TYPES } from '../inversify/types'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { IDocumentRequestBuilder } from './documents/DocumentRequestBuilder'
import { IDocumentServiceClient } from './documents/DocumentServiceClient'
import { DOCUMENT_PRODUCT, DOCUMENT_TYPE, LC_APPLICATION_DOC_TYPE } from './documents/documentTypes'
import { ILCUseCase } from './ILCUseCase'
import IUser from './IUser'
import { ITradeCargoClient } from './trade-cargo/ITradeCargoClient'
import { IFile } from './types/IFile'
import { ILCDocumentManager } from './events/LC/LCTransitionEvents/LCDocumentManager'
import { LC_STATE } from './events/LC/LCStates'
import { ICounterService } from './counter'
import { ReferenceType, ITrade } from '@komgo/types'

const PDF_MIME_TYPE = 'application/pdf'
const PDF_EXTENSION = 'pdf'
const DEFAULT_ENCODING = 'base64'
const PDF_BASE64_PREFIX = `data:application/pdf;base64,`

@injectable()
export class LCUseCase implements ILCUseCase {
  private logger = getLogger('LCUseCase')
  constructor(
    @inject(TYPES.LCTransactionManager) private readonly lcTxManager: ILCTransactionManager,
    @inject(TYPES.TradeCargoClient) private readonly tradeCargoClient: ITradeCargoClient,
    @inject(TYPES.CounterService) private readonly counterService: ICounterService,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.DocumentServiceClient) private readonly documentServiceClient: IDocumentServiceClient,
    @inject(TYPES.LCDocumentManager) private readonly lcDocumentManager: ILCDocumentManager,
    @inject(TYPES.LCCacheDataAgent) private readonly cacheDataAgent: ILCCacheDataAgent
  ) {}

  public async createLC(request: ICreateLCRequest, user: IUser): Promise<any[]> {
    const referenceObject = await this.counterService.calculateNewReferenceObject(ReferenceType.LC, request.applicantId)
    const reference = `LC-${referenceObject.trigram}-${referenceObject.year}-${referenceObject.value}`
    this.logger.info('Creating LC', { LCReference: reference })

    this.logger.info(`Getting trade and cargo with tradeId`, { tradeId: request.tradeId })
    const trade: ITrade = await this.tradeCargoClient.getTrade(request.tradeId)
    const cargo = await this.tradeCargoClient.getCargoByTrade(request.tradeId)

    this.logger.info('Retrieving commercial contract document')
    const commercialContractDocumentHash = await this.getCommercialContractDocumentHash(trade.sourceId)

    let draftLCDocumentHash = ''
    if (request.generatedPDF) {
      this.logger.info('Registering LC application document in KITE')
      draftLCDocumentHash = await this.registerLCApplicationDocument(request, reference, user)
    } else {
      this.logger.info('Skipping registration of LC application document in KITE. No document to register')
    }

    const { generatedPDF, issueDueDateDuration, issueDueDateUnit, ...requestWithoutLC } = request
    let issueDueDate = {}
    if (issueDueDateDuration && issueDueDateUnit) {
      issueDueDate = {
        issueDueDate: {
          unit: issueDueDateUnit,
          duration: issueDueDateDuration
        }
      }
    }

    const letterOfCredit: ILC = {
      ...requestWithoutLC,
      ...issueDueDate,
      tradeAndCargoSnapshot: {
        source: trade.source,
        sourceId: trade.sourceId,
        trade,
        cargo
      },
      draftLCDocumentHash,
      commercialContractDocumentHash,
      reference,
      referenceObject,
      nonce: 0,
      status: LC_STATE.PENDING
    }
    this.logger.info(`LC snapshot`, {
      LCReference: reference,
      tradeId: trade._id,
      cargoId: cargo ? cargo._id : null
    })

    const id = await this.cacheDataAgent.saveLC(letterOfCredit)
    letterOfCredit._id = id
    this.logger.info(`Cache saved for LC. Id: ${letterOfCredit._id}`, {
      LC: letterOfCredit._id
    })

    try {
      const txHash = await this.lcTxManager.deployLC(letterOfCredit)
      return [txHash, reference]
    } catch (err) {
      this.logger.info('LC register failed', {
        LCReference: reference
      })
      await this.lcDocumentManager.deleteDocument(letterOfCredit, DOCUMENT_TYPE.LC_Application)
      await this.cacheDataAgent.updateField(letterOfCredit._id, 'status', LC_STATE.FAILED)
      // rethrow original error
      throw err
    }
  }

  private getFileFromEncoded(encodedFile: string, name: string): IFile {
    return {
      originalname: name,
      buffer: Buffer.from(encodedFile.replace(PDF_BASE64_PREFIX, ''), DEFAULT_ENCODING),
      mimetype: PDF_MIME_TYPE,
      ext: PDF_EXTENSION
    }
  }

  private async registerLCApplicationDocument(
    request: ICreateLCRequest,
    reference: string,
    user: IUser
  ): Promise<string> {
    const lcFile: IFile = this.getFileFromEncoded(request.generatedPDF, `${reference}.${PDF_EXTENSION}`)
    const lcRequest: ILC = { ...request, reference }
    return this.registerDocument(lcRequest, lcFile, user)
  }

  private async registerDocument(lcRequest: ILC, lcFile: IFile, user: IUser): Promise<string> {
    const documentRequest = this.documentRequestBuilder.getLCDocumentRequest(
      lcRequest,
      {
        categoryId: LC_APPLICATION_DOC_TYPE.categoryId,
        typeId: LC_APPLICATION_DOC_TYPE.typeId,
        name: lcFile.originalname
      },
      lcFile,
      user
    )
    const document = await this.documentServiceClient.registerDocument(documentRequest)
    return document.hash
  }

  private async getCommercialContractDocumentHash(vaktId: string): Promise<string> {
    const tradeContext = this.documentRequestBuilder.getTradeDocumentContext(vaktId)
    const commercialContractDocument = await this.documentServiceClient.getDocument(
      DOCUMENT_PRODUCT.TradeFinance,
      DOCUMENT_TYPE.COMMERCIAL_CONTRACT,
      tradeContext
    )
    const defaultHash = ''
    return commercialContractDocument ? commercialContractDocument.hash : defaultHash
  }
}
