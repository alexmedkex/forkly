import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import { ILC } from '../data-layer/models/ILC'
import { TYPES } from '../inversify/types'
import { v4 } from 'uuid'
import { ILCAmendmentUseCase } from './ILCAmendmentUseCase'
import { ILCAmendmentBase, LCAmendmentStatus, ILCAmendment } from '@komgo/types'
import { ILCAmendmentTransactionManager } from './blockchain/ILCAmendmentTransactionManager'
import { ILCAmendmentDataAgent, ILCCacheDataAgent } from '../data-layer/data-agents'
import { HashMetaDomain } from './common/HashFunctions'
import { IDocumentRegisterResponse } from './documents/IDocumentRegisterResponse'
import Uploader from '../service-layer/utils/Uploader'
import IDocumentService from './documents/IDocumentService'
import ILCDocument from './types/ILCDocument'
import IUser from './IUser'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../exceptions/utils'
import { ContentNotFoundException, InvalidOperationException } from '../exceptions'

@injectable()
export class LCAmendmentUseCase implements ILCAmendmentUseCase {
  private logger = getLogger('LCUseCase')
  constructor(
    @inject(TYPES.LCAmendmentDataAgent)
    private readonly lcAmendmentDataAgent: ILCAmendmentDataAgent,
    @inject(TYPES.LCAmendmentTransactionManager)
    private readonly lcAmendmentTransactionManager: ILCAmendmentTransactionManager,
    @inject(TYPES.LCCacheDataAgent)
    private readonly lcDataAgent: ILCCacheDataAgent,
    @inject('company-static-id')
    private readonly companyStaticId: string,
    @inject(TYPES.Uploader) private uploader: Uploader,
    @inject(TYPES.DocumentService) private readonly documentService: IDocumentService
  ) {}

  public async create(amendment: ILCAmendmentBase): Promise<string[]> {
    const { lcReference, lcStaticId } = amendment
    this.logger.info('creating amendment for LC', { lcReference, lcStaticId })

    let letterOfCredit: ILC
    let lcAmendmentStaticId: string

    letterOfCredit = await this.lcDataAgent.getLC({ _id: lcStaticId })

    if (!letterOfCredit) {
      const message = `Parent LC ${lcStaticId} doesn't exist.`
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.ParentLCNotFound, message, {
        lcStaticId,
        lcReference
      })
      throw new ContentNotFoundException(message)
    }

    const { applicantId, beneficiaryId, issuingBankId, beneficiaryBankId } = letterOfCredit

    const parties: string[] = [applicantId, beneficiaryId, issuingBankId].concat(
      beneficiaryBankId ? [beneficiaryBankId] : []
    )

    if (parties.includes(undefined)) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.EmptyMandatoryParties,
        'One or more mandatory parties were empty.',
        {
          LCAddress: letterOfCredit.contractAddress,
          applicantId,
          beneficiaryId,
          issuingBankId,
          beneficiaryBankId
        },
        new Error().stack
      )
      throw new ContentNotFoundException('One or more mandatory parties were empty.')
    }
    const now = new Date().toISOString()
    const lcAmendment: ILCAmendment = {
      ...amendment,
      status: LCAmendmentStatus.Pending,
      staticId: v4(),
      createdAt: now,
      updatedAt: now
    }

    lcAmendmentStaticId = await this.lcAmendmentDataAgent.create(lcAmendment)
    this.logger.info(`amendment saved`, {
      lcAmendmentStaticId,
      lcStaticId
    })

    try {
      const txHash = await this.lcAmendmentTransactionManager.deployInitial(letterOfCredit, lcAmendment, parties)
      return [txHash, lcAmendmentStaticId]
    } catch (err) {
      lcAmendment.status = LCAmendmentStatus.Failed
      await this.lcAmendmentDataAgent.update({ staticId: lcAmendmentStaticId }, { ...lcAmendment })
      throw err
    }
  }

  public async approve(amendmentStaticId: string, request?: any, user?: IUser) {
    const amendmentData: { lc: ILC; amendment: ILCAmendment; parties: string[] } = await this.findDataFromAmendment(
      amendmentStaticId
    )
    let document: IDocumentRegisterResponse

    if (request && user) {
      const formData = await this.uploader.resolveMultipartData<ILCDocument>(request, 'extraData')
      document = await this.documentService.registerLCAmendmentDocument(
        amendmentData.lc,
        amendmentData.amendment,
        formData.data,
        formData.file,
        user,
        {}
      )
    }

    // TODO add more checks for KOMGO-801, KOMGO-802
    if (this.iAmIssuingBank(amendmentData.lc)) {
      this.logger.info(`I am issuing bank, approving LCAmendment...`)

      await this.lcAmendmentTransactionManager.approveByIssuingBank(
        amendmentData.amendment.contractAddress,
        amendmentData.parties,
        document.hash,
        document.name
      )
      this.logger.info(`LCAmendment approved, updating local cache with the document data`)
      if (!amendmentData.amendment.documents) {
        amendmentData.amendment.documents = []
      }
      amendmentData.amendment.documents.push({
        documentHash: document.hash,
        documentId: document.id
      })

      await this.lcAmendmentDataAgent.update({ staticId: amendmentData.amendment.staticId }, amendmentData.amendment)
      this.logger.info(`Local LCAmendment cache updated with uploaded document`)
    } else {
      const errorMessage = `Company trying to approve is not a valid party in lc.`
      this.logger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCAmendmentApproveInvalidParty,
        errorMessage,
        {
          lcReference: amendmentData.lc.reference,
          company: this.companyStaticId,
          companyHash: HashMetaDomain(this.companyStaticId)
        },
        new Error().stack
      )
      throw new InvalidOperationException(errorMessage)
    }
  }

  public async reject(amendmentStaticId: string, comments: string) {
    const amendmentData: { lc: ILC; amendment: ILCAmendment; parties: string[] } = await this.findDataFromAmendment(
      amendmentStaticId
    )
    // TODO add more checks for KOMGO-801, KOMGO-802
    if (this.iAmIssuingBank(amendmentData.lc)) {
      await this.lcAmendmentTransactionManager.rejectByIssuingBank(
        amendmentData.amendment.contractAddress,
        amendmentData.parties,
        comments
      )
    } else {
      const errorMessage = `Company trying to reject is not a valid party in lc.`
      this.logger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCAmendmentRejectInvalidParty,
        errorMessage,
        {
          lcReference: amendmentData.lc.reference,
          company: this.companyStaticId,
          companyHash: HashMetaDomain(this.companyStaticId)
        },
        new Error().stack
      )
      throw new InvalidOperationException(errorMessage)
    }
  }

  private async findDataFromAmendment(amendmentStaticId: string) {
    const amendment: ILCAmendment = await this.lcAmendmentDataAgent.get(amendmentStaticId)
    if (!amendment) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCAmendmentUseCaseAmendmentNotFound,
        `Amendment trying to accept/reject not found`,
        {
          amendmentStaticId
        }
      )
      throw new ContentNotFoundException(`Amendment with id=${amendmentStaticId} does not exist`)
    }
    this.logger.info(`About to accept/reject lcamendment=${amendment.staticId}`)
    const lcReference = amendment.lcReference
    const lc: ILC = await this.lcDataAgent.getLC({ reference: lcReference })
    if (!lc) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCAmendmentUseCaseLCNotFound,
        `LC for amendment=${amendment.staticId} not found, LC reference=${lcReference}`,
        {
          amendmentStaticId
        }
      )
      throw new ContentNotFoundException(`LC with reference=${lcReference} does not exist`)
    }
    this.logger.info(`LCAmmendment address=${amendment.contractAddress}, lcReference=${lc.reference}`)
    const parties = [lc.applicantId, lc.issuingBankId, lc.beneficiaryId]
    if (lc.beneficiaryBankId) {
      parties.push(lc.beneficiaryBankId)
    }
    return { lc, amendment, parties: parties.map(party => HashMetaDomain(party)) }
  }

  private iAmIssuingBank(lc: ILC): boolean {
    return this.companyStaticId === lc.issuingBankId
  }
}
