import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import { ILCAmendment, IStandbyLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { ILC } from '../../data-layer/models/ILC'
import { TYPES } from '../../inversify/types'
import IUser from '../IUser'
import { IFile } from '../types/IFile'
import ILCDocument from '../types/ILCDocument'
import getLCMetaData from '../util/getLCMetaData'
import { IDocumentRequestBuilder } from './DocumentRequestBuilder'
import { IDocumentServiceClient } from './DocumentServiceClient'
import { IDocumentRegisterResponse } from './IDocumentRegisterResponse'
import IDocumentService from './IDocumentService'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { InvalidDocumentException } from '../../exceptions'
import getSBLCMetaData from '../util/getSBLCMetaData'
import * as path from 'path'
import { getLetterOfCreditMetadata } from '../util'

const registeringMessage = 'Registering Document in KITE'
const registeredMessage = 'Registered Document in KITE'

@injectable()
export class DocumentService implements IDocumentService {
  private logger = getLogger('LCIssueUseCase')

  constructor(
    @inject(TYPES.DocumentServiceClient) private readonly docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly docRequestBuilder: IDocumentRequestBuilder
  ) {}

  async registerLcDocument(
    lc: ILC,
    lcDocument: ILCDocument,
    swiftLCDocument: IFile,
    user: IUser
  ): Promise<IDocumentRegisterResponse> {
    this.logger.info(registeringMessage, getLCMetaData(lc))
    this.validateLcDocument(lc, lcDocument)

    const documentRequest = this.docRequestBuilder.getLCDocumentRequest(lc, lcDocument, swiftLCDocument, user)

    const document = await this.docServiceClient.registerDocument(documentRequest)
    this.logger.info(registeredMessage, {
      ...getLCMetaData(lc),
      documentHash: document.hash
    })

    return document
  }
  async registerLcPresentationDocument(
    lc: ILC,
    presentation: ILCPresentation,
    lcDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: object
  ): Promise<IDocumentRegisterResponse> {
    this.logger.info(registeringMessage, getLCMetaData(lc))
    this.validateLcDocument(lc, lcDocument)

    const extension = this.getExtension(file.originalname)

    file.originalname = extension ? `${lcDocument.name}.${extension}` : lcDocument.name

    const documentRequest = this.docRequestBuilder.getLCPresentationDocumentRequest(
      presentation,
      lcDocument,
      file,
      user,
      additionalContext
    )

    const document = await this.docServiceClient.registerDocument(documentRequest)
    this.logger.info(registeredMessage, {
      ...getLCMetaData(lc),
      documentHash: document.hash
    })

    return document
  }

  async registerLCAmendmentDocument(
    lc: ILC,
    amendment: ILCAmendment,
    lcDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: any
  ) {
    this.logger.info(registeringMessage, getLCMetaData(lc))
    const documentRequest = this.docRequestBuilder.getLCAmendmentDocumentRequest(lc, amendment, lcDocument, file, user)
    const document = await this.docServiceClient.registerDocument(documentRequest)
    this.logger.info(registeredMessage, {
      ...getLCMetaData(lc),
      documentHash: document.hash
    })
    return document
  }

  async registerSBLCIssuingDocument(
    sblc: IStandbyLetterOfCredit,
    sblcDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: object
  ) {
    this.logger.info(registeringMessage, getSBLCMetaData(sblc))
    const documentRequest = this.docRequestBuilder.getSBLCDocumentRequest(sblc, sblcDocument, file, user)
    const document = await this.docServiceClient.registerDocument(documentRequest)
    this.logger.info(registeredMessage, {
      ...getSBLCMetaData(sblc),
      documentHash: document.hash
    })
    return document
  }

  async registerLetterOfCreditIssuingDocument(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    issuingDocument: ILCDocument,
    file: IFile,
    user: IUser
  ) {
    this.logger.info(registeringMessage, getLetterOfCreditMetadata(letterOfCredit))
    const documentRequest = this.docRequestBuilder.getLetterOfCreditDocumentRequest(
      letterOfCredit,
      issuingDocument,
      file,
      user
    )
    const document = await this.docServiceClient.registerDocument(documentRequest)
    this.logger.info(registeredMessage, {
      ...getLetterOfCreditMetadata(letterOfCredit),
      documentHash: document.hash
    })
    return document
  }

  private validateLcDocument(lc: ILC, lcDocument: ILCDocument): void {
    if (!this.isValidParcelId(lc, lcDocument.parcelId)) {
      this.logger.error(
        ErrorCode.ValidationHttpContent,
        ErrorNames.LCPresentationInvalidParcelId,
        `Parcel id does not exist in LC.`,
        { lcReference: lc.reference, lcId: lc._id, parcelId: lcDocument.parcelId },
        new Error().stack
      )
      throw new InvalidDocumentException(`Parcel id does not exist in LC.`)
    }
  }

  private isValidParcelId(lc: ILC, parcelId: string | undefined): boolean {
    if (!parcelId) return true
    if (!lc.tradeAndCargoSnapshot) return false

    const parcel =
      lc.tradeAndCargoSnapshot.cargo && lc.tradeAndCargoSnapshot.cargo.parcels
        ? lc.tradeAndCargoSnapshot.cargo.parcels.find(p => p.id === parcelId)
        : null

    return !!parcel
  }

  private getExtension(filename) {
    const ext = path.extname(filename || '').split('.')
    if (!ext && !ext.length) {
      this.logger.warn(ErrorCode.UnexpectedError, ErrorNames.MissingFileExtension, "Document doesn't have extension")
      return ''
    }
    return ext[ext.length - 1]
  }
}
