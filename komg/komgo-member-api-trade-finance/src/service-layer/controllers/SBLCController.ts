import { Body, Controller, Get, Header, Path, Post, Query, Request, Route, Security, SuccessResponse, Tags } from 'tsoa'
import * as express from 'express'

import {
  IStandbyLetterOfCredit,
  SBLC_EXTENDED_SCHEMA,
  SBLC_BASE_SCHEMA,
  IStandbyLetterOfCreditBase,
  ISBLCRejectRequest
} from '@komgo/types'
import { validateMongoFilter } from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import IUser from '../../business-layer/IUser'
import getUser from '../../business-layer/util/getUser'
import decode from '../../middleware/utils/decode'
import { ISBLCService } from '../../business-layer/sblc/ISBLCService'
import { ValidationError, toValidationErrors } from '../../data-layer/data-agents/utils'
import Uploader from '../utils/Uploader'
import { IIssueSBLCRequest } from '../requests/IIssueSBLCRequest'
import { IFile } from '../../business-layer/types/IFile'
import { generateHttpException } from '../utils/ErrorHandling'
import { ContentNotFoundException } from '../../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { IPaginate } from '../responses/IPaginate'
import { ITradeInstrumentValidationService } from '../../business-layer/trade-cargo/ITradeInstrumentValidationService'
import { ErrorUtils } from '@komgo/microservice-config'
import { queryStringParser } from './queryParser'
import { SBLCRequest } from '../requests/SBLCRequest'
import { Metric, SBLCControllerEndpoints } from '../../utils/Metrics'

const HEADER_CONTENT_TYPE = 'content-type'
const HEADER_CONTENT_DISPOSITION = 'content-disposition'

const Ajv = require('ajv')

@Tags('DEPRECATED, use LetterOfCredit')
@Route('standby-letters-of-credit')
@provideSingleton(SBLCController)
export class SBLCController extends Controller {
  private readonly logger = getLogger('SBLCController')
  private readonly ajv = new Ajv({ allErrors: true }).addSchema(SBLC_BASE_SCHEMA).addSchema(SBLC_EXTENDED_SCHEMA)
  private readonly sblcService: ISBLCService

  constructor(
    @inject(TYPES.SBLCService) sblcService: ISBLCService,
    @inject(TYPES.Uploader) private uploader: Uploader,
    @inject(TYPES.TradeInstrumentValidationService)
    private readonly tradeInstrumentValidation: ITradeInstrumentValidationService
  ) {
    super()
    this.sblcService = sblcService
  }

  @Security('withPermission', ['tradeFinance', 'manageSBLCRequest'])
  @Post()
  @SuccessResponse(201, 'Created')
  public async create(
    @Body() sblc: IStandbyLetterOfCreditBase,
    @Header('Authorization') jwt: string
  ): Promise<{ transactionHash: string; id: string }> {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.Create
    })
    const user: IUser = getUser(decode(jwt))

    const valid = this.ajv.validate((SBLC_BASE_SCHEMA as any).$id, sblc)
    if (!valid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.warn(ErrorCode.ValidationHttpSchema, ErrorNames.CreateSBLCValidationError, 'invalid SBLC', errors)
      throw generateHttpException(new ValidationError('Invalid SBLC', errors))
    }
    const validApplication = await this.tradeInstrumentValidation.validateBySourceId(
      sblc.tradeId.source,
      sblc.tradeId.sourceId
    )
    if (!validApplication) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.SBLCControllerInvalidInstrument,
        'invalid SBLC active instruments exists',
        {
          tradeId: sblc.tradeId
        },
        new Error().stack
      )
      throw ErrorUtils.conflictException(ErrorCode.ValidationHttpContent, `Invalid SBLC application`, {
        tradeId: ['active financial instruments for trade exists']
      })
    }

    this.logger.info('creating SBLC')

    try {
      const [transactionHash, id] = await this.sblcService.create(sblc, user)
      this.logger.metric({
        [Metric.APICallFinished]: SBLCControllerEndpoints.Create
      })
      return { transactionHash, id }
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageSBLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'read'])
  @Get('{id}')
  public async get(@Path() id: string): Promise<IStandbyLetterOfCredit> {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.Get
    })
    let result: IStandbyLetterOfCredit
    this.logger.info('getting SBLC', {
      id
    })
    try {
      result = await this.sblcService.get(id)
    } catch (e) {
      throw generateHttpException(e)
    }

    if (!result) {
      const message = `SBLC ${id} does not exist`
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorNames.SBLCControllerSBLCNotFound, message)
      throw generateHttpException(new ContentNotFoundException('SBLC not found'))
    }

    this.logger.metric({
      [Metric.APICallFinished]: SBLCControllerEndpoints.Get
    })
    return result
  }

  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'crud'])
  @Post('{sblcStaticId}/issue')
  public async issueSBLC(
    @Path() sblcStaticId: string,
    @Header('Authorization') jwt: string,
    @Request() request: express.Request
  ) {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.IssueSBLC
    })
    this.logger.info('issueSBLC staticId', {
      sblcStaticId
    })
    const user: IUser = getUser(decode(jwt))
    const formData = await this.uploader.resolveMultipartData<IIssueSBLCRequest>(request, 'extraData')
    const issuingBankReference: string = formData.data.issuingBankReference
    const issuingBankPostalAddress: string = formData.data.issuingBankPostalAddress
    try {
      const file: IFile = formData.file
      await this.sblcService.issue(sblcStaticId, issuingBankReference, issuingBankPostalAddress, user, file)
      this.logger.metric({
        [Metric.APICallFinished]: SBLCControllerEndpoints.IssueSBLC
      })
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'crud'])
  @Post('{sblcStaticId}/rejectrequest')
  public async rejectIssueSBLC(@Path() sblcStaticId: string, @Body() sblcRejectIssueRequest: ISBLCRejectRequest) {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.RejectIssueSBLC
    })
    this.logger.info('rejectIssueSBLC', {
      sblcStaticId
    })
    const issuingBankReference: string = sblcRejectIssueRequest.issuingBankReference || ''
    try {
      await this.sblcService.rejectRequest(sblcStaticId, issuingBankReference)
      this.logger.metric({
        [Metric.APICallFinished]: SBLCControllerEndpoints.RejectIssueSBLC
      })
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageSBLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'read'])
  @Get('{id}/documents')
  public async getDocuments(@Path() id: string) {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.GetDocuments
    })
    this.logger.info(`get documents for SBLC`, { staticId: id })
    const sblc = await this.sblcService.get(id)
    if (!sblc) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `SBLC with id: ${id} not found`)
    }

    try {
      const documents = await this.sblcService.getDocuments(sblc)
      this.logger.metric({
        [Metric.APICallFinished]: SBLCControllerEndpoints.GetDocuments
      })
      return documents
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageSBLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'read'])
  @Get('documents/{documentId}')
  public async getLCDocument(@Path('documentId') documentId: string) {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: SBLCControllerEndpoints.GetLCDocument
      })
      const document = await this.sblcService.getDocumentById(documentId)

      if (!document) {
        throw ErrorUtils.notFoundException(
          ErrorCode.DatabaseMissingData,
          `Could not find document with id: ${documentId}`
        )
      }
      this.logger.metric({
        [Metric.APICallFinished]: SBLCControllerEndpoints.GetLCDocument
      })
      return document
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageSBLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'read'])
  @Get('documents/{documentId}/content')
  public async getLCDocumentContent(@Request() request: express.Request, @Path('documentId') documentId: string) {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.GetLCDocumentContent
    })
    let result
    try {
      result = await this.sblcService.getDocumentContent(documentId)
    } catch (error) {
      this.logger.info({
        errorMessge: error.message,
        documentId
      })
      throw generateHttpException(error)
    }

    const response = request.res as express.Response

    if ((result && result.status === 404) || !result) {
      this.setStatus(404)
      throw ErrorUtils.notFoundException(
        ErrorCode.DatabaseMissingData,
        `Could not find document with id: ${documentId}`
      )
    }

    response.set(HEADER_CONTENT_DISPOSITION, result.headers[HEADER_CONTENT_DISPOSITION])
    response.set(HEADER_CONTENT_TYPE, result.headers[HEADER_CONTENT_TYPE])
    response.write(result.data)
    this.logger.metric({
      [Metric.APICallFinished]: SBLCControllerEndpoints.GetLCDocumentContent
    })
  }

  @Get()
  @Security('withPermission', ['tradeFinance', 'manageSBLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewSBLC', 'read'])
  public async find(
    @Query('filter') filter = {},
    @Request() request: express.Request
  ): Promise<IPaginate<IStandbyLetterOfCredit[]>> {
    this.logger.metric({
      [Metric.APICallReceived]: SBLCControllerEndpoints.Find
    })
    const { query, projection, options } = queryStringParser(request)
    options.skip = options.skip || 0
    options.limit = options.limit || 200
    const { limit, skip } = options
    this.logger.info('SblcService find:', { query, projection, options })
    try {
      await validateMongoFilter(JSON.stringify(query), SBLCRequest, { tradeId: { sourceId: ['$in'] } })
      const items: IStandbyLetterOfCredit[] = await this.sblcService.find(query, projection, options)
      const total: number = await this.sblcService.count(query)
      this.logger.metric({
        [Metric.APICallFinished]: SBLCControllerEndpoints.Find
      })
      return {
        limit,
        skip,
        items,
        total
      }
    } catch (error) {
      throw generateHttpException(error)
    }
  }
}
