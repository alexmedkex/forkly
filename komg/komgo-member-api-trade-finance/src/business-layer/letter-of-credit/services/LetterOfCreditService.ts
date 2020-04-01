import {
  ILetterOfCreditBase,
  ILetterOfCredit,
  LetterOfCreditStatus,
  ReferenceType,
  LetterOfCreditType,
  IDataLetterOfCredit,
  IDataLetterOfCreditBase,
  ICompany,
  TimerStatus
} from '@komgo/types'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents/letter-of-credit/ILetterOfCreditDataAgent'
import { v4 as uuid4 } from 'uuid'
import { ILetterOfCreditTransactionManager } from '../tx-managers'
import { ICounterService } from '../../counter'
import {
  ContentNotFoundException,
  BlockchainTransactionException,
  InvalidDatabaseDataException
} from '../../../exceptions'
import { IFile } from '../../types/IFile'
import IUser from '../../IUser'
import IDocumentService from '../../documents/IDocumentService'
import { DOCUMENT_CATEGORY, DOCUMENT_TYPE, DOCUMENT_PRODUCT } from '../../documents/documentTypes'
import { getLogger } from '@komgo/logging'
import { IDocumentRequestBuilder } from '../../documents/DocumentRequestBuilder'
import { IDocumentServiceClient } from '../../documents/DocumentServiceClient'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ITradeCargoClient } from '../../trade-cargo/ITradeCargoClient'
import { ValidationError } from '../../../data-layer/data-agents/utils'
import * as _ from 'lodash'
import { ILetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

@injectable()
export class LetterOfCreditService {
  private readonly logger = getLogger('LetterOfCreditService')

  constructor(
    @inject(TYPES.LetterOfCreditDataAgent) private dataAgent: ILetterOfCreditDataAgent,
    @inject(TYPES.CounterService) private counterService: ICounterService,
    @inject(TYPES.LetterOfCreditTransactionManager) private transactionManager: ILetterOfCreditTransactionManager,
    @inject(TYPES.DocumentService) private readonly documentService: IDocumentService,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.DocumentServiceClient) private readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService,
    @inject(TYPES.TradeCargoClient) private readonly tradeCargoClient: ITradeCargoClient,
    @inject(TYPES.LetterOfCreditTimerService) private readonly letterOfCreditTimerService: ILetterOfCreditTimerService
  ) {}

  async create(baseLc: ILetterOfCreditBase<IDataLetterOfCreditBase>): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    const tradeSource = baseLc.templateInstance.data.trade.source
    const tradeSourceId = baseLc.templateInstance.data.trade.sourceId
    const lcWithTrade = await this.dataAgent.find({
      'templateInstance.data.trade.source': tradeSource,
      'templateInstance.data.trade.sourceId': tradeSourceId
    })
    const notRejected = await this.wasNotRejected(lcWithTrade)
    if (lcWithTrade && lcWithTrade.length > 0 && notRejected) {
      throw new ValidationError(`A letterOfCredit with provided trade already exists`, {})
    }
    const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = await this.prepareLetterOfCredit(baseLc)
    const txHash = await this.transactionManager.deploy(letterOfCredit)
    this.logger.info(`LetterOfCredit deployed with txHash=${txHash}`)
    letterOfCredit.transactionHash = txHash
    await this.dataAgent.save(letterOfCredit)
    return letterOfCredit
  }

  async issue(
    staticId: string,
    letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase>,
    file: IFile,
    user: IUser
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    this.logger.info(`Issuing LetterOfCredit`)
    const lc: ILetterOfCredit<IDataLetterOfCredit> = await this.dataAgent.get(staticId)
    if (!lc) {
      throw new ContentNotFoundException('Letter of credit not found')
    }
    const transformedData = await this.transformData(letterOfCredit.templateInstance.data, false, lc)

    lc.templateInstance = {
      ...letterOfCredit.templateInstance,
      data: transformedData
    }

    let documentId
    if (file) {
      this.logger.info(`Registering issuing document in kite`, {
        staticId
      })
      const document = await this.registerDocument(lc, file, user)
      const documentHash = document.hash
      lc.issuingDocumentHash = documentHash
      documentId = document.id
      this.logger.info(`Registered issuing document in kite`)
    }
    try {
      await this.transactionManager.issue(lc.contractAddress, lc)
    } catch (error) {
      this.logger.error(ErrorCode.BlockchainTransaction, ErrorNames.TransactionManagerIssueError, { error })
      if (documentId) {
        await this.deleteDocument(lc, documentId)
      }
      throw new BlockchainTransactionException(`Error when sending letterofcredit issue transaction`)
    }
    // TODO: Add a requested state check here!
    lc.status = LetterOfCreditStatus.Issued_Verification_Pending
    lc.updatedAt = new Date().toISOString()
    await this.dataAgent.update({ staticId }, lc)
    return lc
  }

  async rejectRequest(
    staticId: string,
    letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase>
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    this.logger.info(`RequestReject LetterOfCredit`)
    const lc: ILetterOfCredit<IDataLetterOfCredit> = await this.dataAgent.get(staticId)
    if (!lc) {
      throw new ContentNotFoundException('Letter of credit not found')
    }
    try {
      await this.transactionManager.requestReject(lc.contractAddress)
    } catch (error) {
      this.logger.error(ErrorCode.BlockchainTransaction, ErrorNames.ErrorRejectRequestLetterOfCredit, { error })
      throw new BlockchainTransactionException(`Error when sending letterofcredit rejectRequest transaction`)
    }

    lc.templateInstance = {
      ...letterOfCredit.templateInstance,
      data: await this.transformData(letterOfCredit.templateInstance.data, false, lc)
    }
    // TODO: Add a requested state check here!
    lc.status = LetterOfCreditStatus.RequestRejected_Pending
    lc.updatedAt = new Date().toISOString()
    await this.dataAgent.update({ staticId }, lc)
    return lc
  }

  async wasNotRejected(lcWithTrade: Array<ILetterOfCredit<IDataLetterOfCredit>>): Promise<boolean> {
    const notRejected = lcWithTrade.filter(
      lc =>
        lc.status !== LetterOfCreditStatus.RequestRejected &&
        lc.status !== LetterOfCreditStatus.RequestRejected_Pending &&
        lc.status !== LetterOfCreditStatus.IssuedRejected
    )
    return notRejected && notRejected.length > 0
  }

  async get(staticId: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    const letterOfCredit = await this.dataAgent.get(staticId)
    if (!letterOfCredit) {
      throw new ContentNotFoundException(`Letter of credit with staticId: ${staticId} not found`)
    }

    letterOfCredit.templateInstance.data.issueDueDate = await this.letterOfCreditTimerService.populateTimerData(
      letterOfCredit
    )

    return letterOfCredit
  }

  async getAll(type: string): Promise<Array<ILetterOfCredit<IDataLetterOfCredit>>> {
    const lettersOfCredit: Array<ILetterOfCredit<IDataLetterOfCredit>> = await this.dataAgent.find({ type })

    await Promise.all(
      lettersOfCredit
        .filter(lc => lc.templateInstance.data.issueDueDate && lc.templateInstance.data.issueDueDate.staticId)
        .map(async lc => {
          lc.templateInstance.data.issueDueDate = await this.letterOfCreditTimerService.populateTimerData(lc)
        })
    )

    return lettersOfCredit
  }

  async find(
    query: object,
    projection?: object,
    options?: object
  ): Promise<Array<ILetterOfCredit<IDataLetterOfCredit>>> {
    try {
      const lettersOfCredit = await this.dataAgent.find(query, projection, options)
      await Promise.all(
        lettersOfCredit
          .filter(lc => lc.templateInstance.data.issueDueDate && lc.templateInstance.data.issueDueDate.staticId)
          .map(async lc => {
            lc.templateInstance.data.issueDueDate = await this.letterOfCreditTimerService.populateTimerData(lc)
          })
      )

      return lettersOfCredit
    } catch (err) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.FindLetterOfCreditFailed,
        err.message,
        new Error().stack
      )
      throw new InvalidDatabaseDataException('SBLC find failed.')
    }
  }
  async count(query: object): Promise<number> {
    try {
      return this.dataAgent.count(query)
    } catch (err) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.FindLetterOfCreditFailed,
        err.message,
        new Error().stack
      )
      throw new InvalidDatabaseDataException('SBLC count failed.')
    }
  }

  private async transformData(
    baseData: IDataLetterOfCreditBase,
    fetchTradeCargo: boolean = false,
    lc?: ILetterOfCredit<IDataLetterOfCredit>
  ): Promise<IDataLetterOfCredit> {
    const applicantStaticId = baseData.applicant.staticId
    const issuingBankStaticId = baseData.issuingBank.staticId
    const beneficiaryStaticId = baseData.beneficiary.staticId
    const parties = [applicantStaticId, issuingBankStaticId, beneficiaryStaticId]
    // TODO in future add advising bank
    const members: ICompany[] = await this.companyRegistryService.getMembers(parties)
    const applicantMember = _.omit(
      members.find(member => member.staticId === baseData.applicant.staticId),
      'ethPubKeys',
      'komgoMessagingPubKeys',
      'vaktMessagingPubKeys',
      'nodeKeys'
    )
    const issuingBankMember = _.omit(
      members.find(member => member.staticId === baseData.issuingBank.staticId),
      'ethPubKeys',
      'komgoMessagingPubKeys',
      'vaktMessagingPubKeys',
      'nodeKeys'
    )
    const beneficiaryMember = _.omit(
      members.find(member => member.staticId === baseData.beneficiary.staticId),
      'ethPubKeys',
      'komgoMessagingPubKeys',
      'vaktMessagingPubKeys',
      'nodeKeys'
    )

    if (this.isEmpty(beneficiaryMember) || this.isEmpty(issuingBankMember) || this.isEmpty(applicantMember)) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.SBLCEmptyMember)
      throw new ContentNotFoundException('A member is missing.')
    }

    const obj = await this.fetchTradeCargo(baseData, fetchTradeCargo, lc)
    let issueDueDate = baseData.issueDueDate
    if (lc && lc.templateInstance && lc.templateInstance.data && lc.templateInstance.data.issueDueDate) {
      issueDueDate = lc.templateInstance.data.issueDueDate
    }

    const data: IDataLetterOfCredit = {
      ...baseData,
      applicant: applicantMember,
      issuingBank: issuingBankMember,
      beneficiary: beneficiaryMember,
      beneficiaryBank: undefined,
      issueDueDate,
      trade: obj.trade,
      cargo: obj.cargo
    }
    return data
  }

  private async fetchTradeCargo(
    baseData: IDataLetterOfCreditBase,
    fetchTradeCargo: boolean = false,
    lc?: ILetterOfCredit<IDataLetterOfCredit>
  ) {
    let obj = { trade: undefined, cargo: undefined }
    if (fetchTradeCargo) {
      obj = await this.tradeCargoClient.getTradeAndCargoBySourceAndSourceId(
        baseData.trade.source,
        baseData.trade.sourceId
      )
    } else {
      if (lc.templateInstance.data.trade) obj.trade = lc.templateInstance.data.trade
      if (lc.templateInstance.data.cargo) obj.cargo = lc.templateInstance.data.cargo
    }
    return obj
  }

  private async prepareLetterOfCredit(
    baseLc: ILetterOfCreditBase<IDataLetterOfCreditBase>
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    const referenceType: ReferenceType =
      baseLc.type === LetterOfCreditType.Documentary ? ReferenceType.LC : ReferenceType.SBLC
    const applicantStaticId = baseLc.templateInstance.data.applicant.staticId
    const reference = await this.counterService.calculateNewReferenceId(referenceType, applicantStaticId)
    const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = {
      ...baseLc,
      reference,
      staticId: uuid4(),
      status: LetterOfCreditStatus.Requested_Verification_Pending,
      stateHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateInstance: {
        ...baseLc.templateInstance,
        data: await this.transformData(baseLc.templateInstance.data, true)
      }
    }
    return letterOfCredit
  }

  private async registerDocument(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    document: IFile,
    user: IUser
  ): Promise<any> {
    const uploadedDocument = await this.documentService.registerLetterOfCreditIssuingDocument(
      letterOfCredit,
      {
        categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
        typeId: DOCUMENT_TYPE.LC,
        name: document.originalname
      },
      document,
      user
    )
    return { hash: uploadedDocument.hash, id: uploadedDocument.id }
  }

  private async deleteDocument(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, documentId: string) {
    this.logger.info(`Removing document for letterOfCredit`)
    const context = this.documentRequestBuilder.getLetterOfCreditDocumentContext(letterOfCredit)
    const document = await this.documentClient.getDocumentById(DOCUMENT_PRODUCT.TradeFinance, documentId)
    if (!document) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCServiceDeleteDocumentFailed,
        `Can't find document`,
        {
          error: 'DocumentNotFound',
          staticId: letterOfCredit.staticId,
          context
        }
      )
      return
    }
    this.logger.info('About to delete document', {
      staticId: letterOfCredit.staticId,
      documentId: document.id
    })
    await this.documentClient.deleteDocument(context.productId, document.id)
    this.logger.info('Document deleted', {
      staticId: letterOfCredit.staticId,
      documentId: document.id
    })
  }

  private isEmpty(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) return false
    }
    return true
  }
}
