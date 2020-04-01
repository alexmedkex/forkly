import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { ILC } from '../data-layer/models/ILC'
import { TYPES } from '../inversify/types'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { DOCUMENT_CATEGORY, DOCUMENT_TYPE } from './documents/documentTypes'
import { LC_STATE } from './events/LC/LCStates'
import IUser from './IUser'
import { LCActionBaseUseCase } from './LCActionBaseUseCase'
import { IFile } from './types/IFile'
import getLCMetaData from './util/getLCMetaData'
import IDocumentService from './documents/IDocumentService'
import { ILCDocumentManager } from './events/LC/LCTransitionEvents/LCDocumentManager'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { CONFIG } from '../inversify/config'

@injectable()
export class LCIssueUseCase extends LCActionBaseUseCase {
  state = LC_STATE.REQUESTED
  companyRole = COMPANY_LC_ROLE.IssuingBank
  private readonly destinationState = LC_STATE.ISSUED
  private logger = getLogger('LCIssueUseCase')

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCTransactionManager) private readonly transactionManager: ILCTransactionManager,
    @inject(TYPES.DocumentService) private readonly documentService: IDocumentService,
    @inject(TYPES.LCDocumentManager) private readonly lcDocumentManager: ILCDocumentManager,
    @inject(TYPES.LCTaskProcessor) taskProcessor: ILCTaskProcessor,
    @inject(TYPES.LCCacheDataAgent) lcCacheDataAgent: ILCCacheDataAgent
  ) {
    super(companyId, taskProcessor, lcCacheDataAgent)
  }

  async issueLC(lc: ILC, swiftLCDocument: IFile, swiftLCDocumentReference: string, user: IUser) {
    this.logger.info(`Issue LC requested, lcId: ${lc._id}`, getLCMetaData(lc))

    const useCaseData = { swiftLCDocument, swiftLCDocumentReference, user }
    return this.executeUseCase(lc, this.destinationState, useCaseData)
  }

  /**
   * @inheritdoc
   * @override
   *
   * @param lc
   * @param useCaseData
   */
  protected async sendTransaction(lc: ILC, useCaseData: { [s: string]: any }) {
    const mt700DocumentHash = await this.registerSwiftDocument(
      lc,
      useCaseData.swiftLCDocument,
      useCaseData.swiftLCDocumentReference,
      useCaseData.user
    )
    const txHash = await this.sendIssueTransaction(lc, mt700DocumentHash, useCaseData.swiftLCDocumentReference)
    this.logger.info(`Issue LC submitted`, { ...getLCMetaData(lc), transactionHash: txHash })
    return txHash
  }

  private async registerSwiftDocument(
    lc: ILC,
    swiftLCDocument: IFile,
    swiftLCDocumentReference: string,
    user: IUser
  ): Promise<string> {
    this.logger.info('Registering SWIFT Document in KITE', getLCMetaData(lc))
    const document = await this.documentService.registerLcDocument(
      lc,
      {
        categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
        typeId: DOCUMENT_TYPE.LC,
        name: swiftLCDocumentReference
      },
      swiftLCDocument,
      user
    )

    return document.hash
  }

  private async sendIssueTransaction(lc: ILC, mt700DocumentHash: string, documentReference: string) {
    this.logger.info('Sending IssueLC transaction', { ...getLCMetaData(lc), mt700DocumentHash, documentReference })

    try {
      const txHash = await this.transactionManager.issueLC(lc.contractAddress, mt700DocumentHash, documentReference)

      this.logger.info(`Sent IssueLC transaction`, {
        ...getLCMetaData(lc),
        mt700DocumentHash,
        transactionHash: txHash
      })

      return txHash
    } catch (err) {
      await this.lcDocumentManager.deleteDocument(lc, DOCUMENT_TYPE.LC)

      // rethrow original error
      throw err
    }
  }
}
