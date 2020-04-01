import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'

import { TYPES } from '../../inversify/types'
import { ISBLCDataAgent } from '../../data-layer/data-agents'

import { ISBLCTransactionManager } from '../blockchain/SBLC/ISBLCTransactionManager'
import { ISBLCService } from './ISBLCService'
import IUser from '../IUser'
import {
  IStandbyLetterOfCreditBase,
  IStandbyLetterOfCredit,
  StandbyLetterOfCreditStatus,
  ReferenceType
} from '@komgo/types'
import { v4 } from 'uuid'
import { IFile } from '../types/IFile'
import IDocumentService from '../documents/IDocumentService'
import { ContentNotFoundException, InvalidDatabaseDataException } from '../../exceptions'
import { DOCUMENT_CATEGORY, DOCUMENT_TYPE, DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { ICounterService } from '../counter'
import { IDocumentRegisterResponse } from '../documents/IDocumentRegisterResponse'
import { IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { ITradeCargoClient } from '../trade-cargo/ITradeCargoClient'

const sblcNotFoundMessage = 'SBLC not found'

@injectable()
export class SBLCService implements ISBLCService {
  private readonly logger = getLogger('SBLCService')
  private readonly sblcDataAgent: ISBLCDataAgent
  private readonly transactionManager: ISBLCTransactionManager
  constructor(
    @inject(TYPES.SBLCDataAgent) sblcDataAgent: ISBLCDataAgent,
    @inject(TYPES.SBLCTransactionManager) transactionManager: ISBLCTransactionManager,
    @inject(TYPES.DocumentService) private readonly documentService: IDocumentService,
    @inject(TYPES.CounterService) private readonly counterService: ICounterService,
    @inject(TYPES.DocumentServiceClient) private readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.TradeCargoClient) private readonly tradeCargoClient: ITradeCargoClient
  ) {
    this.sblcDataAgent = sblcDataAgent
    this.transactionManager = transactionManager
  }

  async create(sblc: IStandbyLetterOfCreditBase, user: IUser): Promise<string[]> {
    this.logger.info('creating SBLC')
    let newSBLC: IStandbyLetterOfCredit
    let sblcStaticId: string
    try {
      const staticId: string = v4()
      const reference = await this.counterService.calculateNewReferenceId(ReferenceType.SBLC, sblc.applicantId)

      const { trade, cargo } = await this.tradeCargoClient.getTradeAndCargoBySourceAndSourceId(
        sblc.tradeId.source,
        sblc.tradeId.sourceId
      )
      newSBLC = {
        ...sblc,
        status: StandbyLetterOfCreditStatus.Pending,
        staticId,
        reference,
        stateHistory: [],
        tradeSnapshot: trade,
        cargoSnapshot: cargo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      sblcStaticId = await this.sblcDataAgent.save(newSBLC)
      this.logger.info(`sblc saved`, {
        sblcStaticId
      })
    } catch (err) {
      this.logger.info(`create sblc failed`, {
        err
      })
      throw err
    }

    try {
      const txHash = await this.transactionManager.deploy(newSBLC)
      this.logger.info(`SBLC issue tx sent`, {
        txHash,
        sblcStaticId
      })
      return [txHash, sblcStaticId]
    } catch (err) {
      newSBLC.status = StandbyLetterOfCreditStatus.Failed
      await this.sblcDataAgent.update({ staticId: sblcStaticId }, { ...newSBLC })
      throw err
    }
  }

  async get(sblcStaticId: string): Promise<IStandbyLetterOfCredit> {
    try {
      return this.sblcDataAgent.get(sblcStaticId)
    } catch (err) {
      this.logger.info(sblcNotFoundMessage, {
        sblcStaticId
      })
      throw err
    }
  }

  async issue(
    sblcStaticId: string,
    issuingBankReference: string,
    issuingBankPostalAddress: string,
    user: IUser,
    file: IFile
  ) {
    this.logger.info(`Retrieving SBLC from cache`, {
      sblcStaticId
    })
    const sblc: IStandbyLetterOfCredit = await this.sblcDataAgent.get(sblcStaticId)
    if (!sblc) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.SBLCNotFound, 'SBLC not found', {
        sblcStaticId
      })
      throw new ContentNotFoundException(`SBLC not found.`)
    }
    this.logger.info(`SBLC retrieved from DB`, {
      sblcAddress: sblc.contractAddress,
      sblcStaticId: sblc.staticId
    })
    let documentHash = ''
    let documentId
    if (file) {
      const document = await this.registerDocument(sblc, file, user)
      documentHash = document.hash
      documentId = document.id
      this.logger.info(`SBLC document registered in KITE`, {
        documentHash
      })
    } else {
      this.logger.info('No file was uploaded when issuing SBLC', {
        sblcStaticId: sblc.staticId
      })
    }
    try {
      await this.transactionManager.issue(
        sblc.contractAddress,
        documentHash,
        issuingBankReference,
        issuingBankPostalAddress
      )
    } catch (error) {
      this.logger.info('Error issuing SBLC, rolling back document upload', {
        sblcStaticId: sblc.staticId
      })
      await this.deleteDocument(sblc, documentId)
    }
  }

  async rejectRequest(sblcStaticId: string, issuingBankReference: string) {
    this.logger.info(`Retrieving SBLC from cache`, {
      sblcStaticId
    })
    const sblc: IStandbyLetterOfCredit = await this.sblcDataAgent.get(sblcStaticId)
    if (!sblc) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.SBLCServiceGetSBLCFailed, sblcNotFoundMessage, {
        sblcStaticId
      })
      throw new Error(`SBLC not found: ${sblcStaticId}`)
    }
    this.logger.info(`SBLC retrieved from DB`, {
      sblcAddress: sblc.contractAddress,
      sblcStaticId: sblc.staticId
    })
    await this.transactionManager.requestReject(sblc.contractAddress, issuingBankReference)
  }

  async find(query: object, projection?: object, options?: object): Promise<IStandbyLetterOfCredit[]> {
    try {
      return this.sblcDataAgent.find(query, projection, options)
    } catch (err) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorNames.FindSBLCFailed, err.message, new Error().stack)
      throw new InvalidDatabaseDataException('SBLC find failed.')
    }
  }
  async count(query: object): Promise<number> {
    try {
      return this.sblcDataAgent.count(query)
    } catch (err) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorNames.FindSBLCFailed, err.message, new Error().stack)
      throw new InvalidDatabaseDataException('SBLC count failed.')
    }
  }

  async getDocuments(sblc: IStandbyLetterOfCredit, parcelId?: string): Promise<IDocumentRegisterResponse[]> {
    const context = this.documentRequestBuilder.getSBLCDocumentContext(sblc, parcelId)
    const documents: IDocumentRegisterResponse[] =
      (await this.documentClient.getDocuments(context.productId, context)) || []
    return documents
  }

  async getDocumentById(documentId: string) {
    return this.documentClient.getDocumentById(DOCUMENT_PRODUCT.TradeFinance, documentId)
  }

  async getDocumentContent(documentId: string) {
    return this.documentClient.getDocumentContent(DOCUMENT_PRODUCT.TradeFinance, documentId)
  }

  private async registerDocument(sblc: IStandbyLetterOfCredit, document: IFile, user: IUser): Promise<any> {
    const uploadedDocument = await this.documentService.registerSBLCIssuingDocument(
      sblc,
      {
        categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
        typeId: DOCUMENT_TYPE.SBLC,
        name: document.originalname
      },
      document,
      user
    )
    return { hash: uploadedDocument.hash, id: uploadedDocument.id }
  }

  private async deleteDocument(sblc: IStandbyLetterOfCredit, documentId: string) {
    this.logger.info(`Removing document`)
    const context = this.documentRequestBuilder.getSBLCDocumentContext(sblc)
    const document = await this.getDocumentById(documentId)
    if (!document) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCServiceDeleteDocumentFailed,
        `Can't find document`,
        {
          error: 'DocumentNotFound',
          sblcStaticId: sblc.staticId,
          context
        }
      )
      return
    }
    this.logger.info('About to delete document', {
      sblcStaticId: sblc.staticId,
      documentId: document.id
    })
    await this.documentClient.deleteDocument(context.productId, document.id)
    this.logger.info('Document deleted', {
      sblcStaticId: sblc.staticId,
      documentId: document.id
    })
  }
}
