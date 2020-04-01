import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import * as express from 'express'
import { inject } from 'inversify'
import { Path, Controller, Post, Tags, Route, Request, Header, Security, Get, Query, Delete, Body, Patch } from 'tsoa'
import { v4 as uuid4 } from 'uuid'

import MagicLinkService from '../../infrastructure/api-magic-link/MagicLinkService'
import { CONFIG_KEYS } from '../../inversify/config_keys'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { SendDocumentsRequest } from '../request/document'
import { IIsDocumentVerificationActivated } from '../request/trade-finance/IIsDocumentVerificationActivated'
import { IDocumentResponse } from '../responses/document'
import { IFullDocumentResponse } from '../responses/document/IFullDocumentResponse'
import { IIsDocumentVerificationActivatedResponse } from '../responses/trade-finance/IIsDocumentVerificationActivatedResponse'

import { RegisterController } from './RegisterController'
import { SendDocumentsController } from './SendDocumentsController'

@Tags('TradeFinance')
@Route('trade-finance')
@provideSingleton(TradeFinanceController)
export class TradeFinanceController extends Controller {
  private readonly productId = 'tradeFinance'
  constructor(
    @inject(RegisterController) private readonly registerController: RegisterController,
    @inject(SendDocumentsController) private readonly sendDocumentsController: SendDocumentsController,
    @inject(TYPES.MagicLinkService) private readonly magicLinkService: MagicLinkService,
    @inject(CONFIG_KEYS.CompanyStaticId) private readonly companyStaticId: string
  ) {
    super()
  }

  /**
   * Proxy request to RegisterController
   * @param request
   * @param categoryId
   * @param typeId
   * @param jwt
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'crudAndShare'])
  @Post('categories/{categoryId}/types/{typeId}/upload')
  public async upload(
    @Request() request: express.Request,
    @Path('categoryId') categoryId: string,
    @Path('typeId') typeId: string,
    @Header('Authorization') jwt?: string
  ): Promise<IFullDocumentResponse> {
    return this.registerController.upload(request, this.productId, categoryId, typeId, jwt, true)
  }

  /**
   * Proxy request to RegisterController
   * @param documentId
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'read'])
  @Get('documents/{documentId}')
  public async GetById(@Path('documentId') documentId: string): Promise<IFullDocumentResponse> {
    return this.registerController.GetById(this.productId, documentId)
  }

  /**
   * Proxy request to RegisterController
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'read'])
  @Get('documents')
  public async Get(): Promise<IFullDocumentResponse[]> {
    return this.registerController.Find(this.productId)
  }

  /**
   * Proxy request to RegisterController
   * @param request
   * @param documentId
   * @param printVersion
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'read'])
  @Get('documents/{documentId}/content')
  public async DownloadFile(
    @Request() request: express.Request,
    @Path('documentId') documentId: string,
    @Query('printVersion') printVersion?: boolean
  ): Promise<void> {
    return this.registerController.DownloadFile(request, this.productId, documentId, printVersion)
  }

  /**
   * Proxy request to RegisterController
   * @param documentId
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'crudAndShare'])
  @Delete('documents/{documentId}')
  public async DeleteDocument(@Path('documentId') documentId: string): Promise<IFullDocumentResponse> {
    return this.registerController.DeleteDocument(this.productId, documentId)
  }

  /**
   * Proxy request to SendDocumentsController
   * @param sendDocumentRequest
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'crudAndShare'])
  @Post('send-documents')
  public async SendDocuments(@Body() sendDocumentRequest: SendDocumentsRequest): Promise<IDocumentResponse[]> {
    return this.sendDocumentsController.SendDocuments(this.productId, {
      ...sendDocumentRequest,
      context: {
        ...sendDocumentRequest.context,
        reviewNotRequired: true,
        documentShareNotification: true
      }
    })
  }

  /**
   * @summary Proxy request to api-magic-link in komgo node in order to update document verification state
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'crudAndShare'])
  @Patch('documents/{documentId}/is-activated')
  public async PatchIsActivated(
    @Path('documentId') documentId: string,
    @Body() data: IIsDocumentVerificationActivated
  ): Promise<IIsDocumentVerificationActivatedResponse> {
    await this.updateActivationState(documentId, !data.isActivated)
    return {
      documentId,
      isActivated: data.isActivated
    }
  }

  /**
   * @summary Proxy request to api-magic-link in komgo node in order to get document verification state
   */
  @Security('withPermission', ['tradeFinance', 'manageDocument', 'read'])
  @Get('documents/{documentId}/is-activated')
  public async GetIsActivated(
    @Path('documentId') documentId: string
  ): Promise<IIsDocumentVerificationActivatedResponse> {
    const contentHash = await this.getDocumentContentHash(documentId)

    return {
      documentId,
      isActivated: !(await this.magicLinkService.isDeactivated(contentHash))
    }
  }

  private async updateActivationState(documentId: string, deactivated: boolean) {
    const contentHash = await this.getDocumentContentHash(documentId)
    return this.magicLinkService.deactivateDocument({
      staticId: this.companyStaticId,
      jti: uuid4(),
      hash: contentHash,
      deactivated
    })
  }

  private async getDocumentContentHash(documentId: string): Promise<string> {
    const { komgoStamp, contentHash } = await this.registerController.GetById(this.productId, documentId)
    if (!komgoStamp) {
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        'Olny documents with komgo stamp can be activated or deactivated',
        null
      )
    }

    return contentHash
  }
}
