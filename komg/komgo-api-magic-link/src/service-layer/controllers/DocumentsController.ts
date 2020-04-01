import { ErrorCode } from '@komgo/error-utilities'
import { HttpException, ErrorUtils } from '@komgo/microservice-config'
import { IDocumentDeactivationRequest } from '@komgo/types'
import { Controller, Route, Tags, Body, Patch, Response, Security, Get, Path, Query } from 'tsoa'

import { IDeactivatedDocumentDataAgent } from '../../data-layer/data-agent/DeactivatedDocumentDataAgent'
import { IJtiDataAgent } from '../../data-layer/data-agent/JtiDataAgent'
import { IJWSAgent, IDecodedJWS } from '../../data-layer/utils/JWSAgent'
import sleep from '../../data-layer/utils/sleep'
import { ICompanyRegistryService } from '../../infrastructure/api-registry/CompanyRegistryService'
import { DocumentRegistry } from '../../infrastructure/blockchain/DocumentRegistry'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IKomgoStampDocument } from '../responses/document/IKomgoStampDocument'

/**
 * Documents Class
 * @export
 * @class DocumentsController
 * @extends {Controller}
 */
@Tags('Documents')
@Route('documents')
@provideSingleton(DocumentsController)
export class DocumentsController extends Controller {
  constructor(
    @inject(TYPES.JWTAgent) private readonly jwtAgent: IJWSAgent,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistry: ICompanyRegistryService,
    @inject(TYPES.JtiDataAgent) private readonly jtiDataAgent: IJtiDataAgent,
    @inject(TYPES.DocumentRegistry) private readonly docRegistry: DocumentRegistry,
    @inject(TYPES.DeactivatedDocumentDataAgent)
    private readonly deactivatedDocumentDataAgent: IDeactivatedDocumentDataAgent
  ) {
    super()
  }

  /**
   * @summary deactivate/reactivate document
   * @param {IDocumentDeactivationRequest} data
   */
  @Security('public')
  @Patch('')
  @Response<HttpException>('403', 'Duplicate JTI claim')
  @Response<HttpException>('404', 'Document is not registered in blockchain')
  public async deactivate(@Body() data: IDocumentDeactivationRequest): Promise<void> {
    const { jti, deactivated, hash }: IDecodedJWS = await this.jwtAgent.decodeAndVerify(data.jws)

    const registredDoc = await this.docRegistry.findDocument(hash)
    if (!registredDoc) {
      throw ErrorUtils.notFoundException(
        ErrorCode.BlockchainEventValidation,
        `Document with hash ${hash} is not registered in blockchain`
      )
    }

    // add token ID to the DB or throw an error if this token was already used
    await this.jtiDataAgent.createJti(jti)

    deactivated
      ? await this.deactivatedDocumentDataAgent.deactivateDocument(hash)
      : await this.deactivatedDocumentDataAgent.reactivateDocument(hash)
  }

  /**
   * @summary verify document
   * @param {boolean} blockchainCheck if set to false only `deactivated` property will be returned
   */
  @Security('public')
  @Get('{hash}')
  public async verifyDocument(
    @Path() hash: string,
    @Query('blockchainCheck') blockchainCheck?: boolean
  ): Promise<IKomgoStampDocument> {
    const deactivated = await this.deactivatedDocumentDataAgent.isDeactivated(hash)
    if (blockchainCheck === false) {
      return { deactivated }
    }

    // users feel better if document verification takes at least a second or two
    const timeOut = Math.floor(Math.random() * 2500)
    await sleep(timeOut)

    const registredDoc = await this.docRegistry.findDocument(hash)
    return {
      registered: !!registredDoc,
      deactivated,
      documentInfo: registredDoc && {
        registeredAt: registredDoc.timestamp,
        registeredBy: await this.companyRegistry.getCompanyName(registredDoc.companyStaticId)
      }
    }
  }
}
