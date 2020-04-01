import { URL } from 'url'
import { getLogger } from '@komgo/logging'
import * as express from 'express'
import { parse } from 'qs'
import { decompressFromBase64 } from 'lz-string'
import { Body, Controller, Get, Header, Path, Post, Query, Request, Route, Security, SuccessResponse } from 'tsoa'

import { IDocumentRequestBuilder } from '../../business-layer/documents/DocumentRequestBuilder'
import { IDocumentServiceClient } from '../../business-layer/documents/DocumentServiceClient'
import { DOCUMENT_PRODUCT } from '../../business-layer/documents/documentTypes'
import { IDocumentRegisterResponse } from '../../business-layer/documents/IDocumentRegisterResponse'
import IDocumentService from '../../business-layer/documents/IDocumentService'
import { ILCUseCase } from '../../business-layer/ILCUseCase'
import IUser from '../../business-layer/IUser'
import { LCAcknowledgeUseCase } from '../../business-layer/LCAcknowledgeUseCase'
import { LCAdviseUseCase } from '../../business-layer/LCAdviseUseCase'
import { LCIssueUseCase } from '../../business-layer/LCIssueUseCase'
import { LCRejectAdvisingUseCase } from '../../business-layer/LCRejectAdvisingUseCase'
import { LCRejectBeneficiaryUseCase } from '../../business-layer/LCRejectBeneficiaryUseCase'
import { LCRequestRejectUseCase } from '../../business-layer/LCRequestRejectUseCase'
import getUser from '../../business-layer/util/getUser'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { ILC } from '../../data-layer/models/ILC'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import decode from '../../middleware/utils/decode'
import { IIssueLCRequest } from '../requests/IIssueLCRequest'
import { ICreateLCRequest } from '../requests/ILetterOfCredit'
import { IRejectLCRequest } from '../requests/IRejectLCRequest'
import { ICreateLCResponse, IRequestLCResponse } from '../responses/ICreateLCResponse'
import Uploader from '../utils/Uploader'
import { LetterOfCreditSchema } from '../validation-schema/LetterOfCreditSchema'
import { queryParser, queryStringParser } from './queryParser'
import { ILCPresentationService } from '../../business-layer/lc-presentation/ILCPresentationService'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILCResponse } from '../responses/ILCResponse'
import { LCPresentationStatus } from '@komgo/types'
import {
  LCPresentationRole,
  getCurrentPresentationRole
} from '../../business-layer/events/LCPresentation/LCPresentationRole'
import { generateHttpException } from '../utils/ErrorHandling'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { ILCPresentationActionPerformer } from '../../business-layer/events/LCPresentation/eventProcessors/ILCPresentationActionPerformer'
import { validateLCTimerDuration } from '../../business-layer/timers/utils'
import { ITimerServiceClient } from '../../business-layer/timers/ITimerServiceClient'
import { CONFIG } from '../../inversify/config'
import { LC_STATE } from '../../business-layer/events/LC/LCStates'
import { ITradeInstrumentValidationService } from '../../business-layer/trade-cargo/ITradeInstrumentValidationService'
import { IPaginate } from '../responses/IPaginate'
import { validateMongoFilter } from '@komgo/data-access'
import { LCRequest } from '../requests/LCRequest'
import { Metric, LCControllerEndpoints } from '../../utils/Metrics'

const HEADER_CONTENT_TYPE = 'content-type'
const HEADER_CONTENT_DISPOSITION = 'content-disposition'

const Ajv = require('ajv')

@Route('lc')
@provideSingleton(LCController)
export class LCController extends Controller {
  private logger = getLogger('LCController')
  private ajv
  constructor(
    @inject(TYPES.LCCacheDataAgent) private lcCacheDataAgent: ILCCacheDataAgent,
    @inject(TYPES.LCUseCase) private lcUseCase: ILCUseCase,
    @inject(TYPES.LCRequestRejectUseCase) private lcRequestRejectUseCase: LCRequestRejectUseCase,
    @inject(TYPES.LCIssueUseCase) private lcIssueUseCase: LCIssueUseCase,
    @inject(TYPES.LCAcknowledgeUseCase) private lcAcknowledgeUseCase: LCAcknowledgeUseCase,
    @inject(TYPES.LCAdviseUseCase) private lcAdviseUseCase: LCAdviseUseCase,
    @inject(TYPES.LCRejectBeneficiaryUseCase) private lcRejectBeneficiaryUseCase: LCRejectBeneficiaryUseCase,
    @inject(TYPES.LCRejectAdvisingUseCase) private readonly lcRejectAdvisingUseCase: LCRejectAdvisingUseCase,
    @inject(TYPES.Uploader) private uploader: Uploader,
    @inject(TYPES.DocumentServiceClient) private readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.DocumentService) private readonly documentService: IDocumentService,
    @inject(TYPES.LCPresentationService) private readonly lCPresentationService: ILCPresentationService,
    @inject(TYPES.TimerServiceClient) private readonly timerServiceClient: ITimerServiceClient,
    @inject(TYPES.TradeInstrumentValidationService)
    private readonly tradeInstrumentValidation: ITradeInstrumentValidationService,
    @inject(CONFIG.CompanyStaticId) private readonly companyId: string
  ) {
    super()
    this.ajv = new Ajv({ allErrors: true })
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'read'])
  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'manageCollection'])
  @Get('documents/{documentId}')
  public async getLCDocument(@Path('documentId') documentId: string) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.GetLCDocument
    })
    try {
      const document = await this.documentClient.getDocumentById(DOCUMENT_PRODUCT.TradeFinance, documentId)

      if (!document) {
        throw ErrorUtils.notFoundException(
          ErrorCode.DatabaseMissingData,
          `Could not find document with id: ${documentId}`
        )
      }

      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.GetLCDocument
      })
      return document
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'read'])
  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'manageCollection'])
  @Get('documents/{documentId}/content')
  public async getLCDocumentContent(@Request() request: express.Request, @Path('documentId') documentId: string) {
    let result
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.GetLCDocumentContent
    })
    this.logger.info('getting document content', {
      documentId
    })
    try {
      result = await this.documentClient.getDocumentContent(DOCUMENT_PRODUCT.TradeFinance, documentId, true)
    } catch (error) {
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
      [Metric.APICallFinished]: LCControllerEndpoints.GetLCDocumentContent
    })
  }

  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'readWrite'])
  @SuccessResponse('201', 'Created')
  @Post('/{id}/task/issue')
  public async issueLC(@Path() id: string, @Header('Authorization') jwt: string, @Request() request: express.Request) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.IssueLC
    })
    const user: IUser = getUser(decode(jwt))

    const lc = await this.getLCData(id)

    const formData = await this.uploader.resolveMultipartData<IIssueLCRequest>(request, 'extraData')
    try {
      const result = await this.lcIssueUseCase.issueLC(lc, formData.file, formData.data.issuedLCReference, user)
      this.setStatus(201)
      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.IssueLC
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'readWrite'])
  @SuccessResponse('201', 'Created')
  @Post('/{id}/task/requestReject')
  public async requestReject(@Path() id: string, @Body() request: IRejectLCRequest) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.RequestReject
    })
    const lc = await this.getLCData(id)
    try {
      const result = await this.lcRequestRejectUseCase.rejectLC(lc, request.reason)
      this.setStatus(201)
      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.RequestReject
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'readWrite'])
  @SuccessResponse('201', 'Created')
  @Post('/{id}/task/advise')
  public async advise(@Path() id: string) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.Advise
    })
    const lc = await this.getLCData(id)
    try {
      const result = await this.lcAdviseUseCase.adviseLC(lc)
      this.setStatus(201)
      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.Advise
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'readWrite'])
  @SuccessResponse('201', 'Created')
  @Post('/{id}/task/acknowledge')
  public async acknowledge(@Path() id: string) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.Acknowledge
    })
    const lc = await this.getLCData(id)
    try {
      const result = await this.lcAcknowledgeUseCase.acknowledgeLC(lc)
      this.setStatus(201)
      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.Acknowledge
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'readWrite'])
  @SuccessResponse('201', 'Created')
  @Post('/{id}/task/rejectBeneficiary')
  public async rejectBeneficiary(@Path() id: string, @Body() request: IRejectLCRequest) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.RejectBeneficiary
    })
    const lc = await this.getLCData(id)
    try {
      const result = await this.lcRejectBeneficiaryUseCase.rejectBeneficiaryLC(lc, request.reason)
      this.setStatus(201)
      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.RejectBeneficiary
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'readWrite'])
  @SuccessResponse('201', 'Created')
  @Post('/{id}/task/rejectAdvising')
  public async rejectAdvising(@Path() id: string, @Body() request: IRejectLCRequest) {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.RejectAdvising
    })
    const lc = await this.getLCData(id)
    try {
      const result = await this.lcRejectAdvisingUseCase.rejectAdvisingLC(lc, request.reason)
      this.setStatus(201)
      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.RejectAdvising
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Post()
  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  public async createLC(
    @Body() request: ICreateLCRequest,
    @Header('Authorization') jwt: string
  ): Promise<ICreateLCResponse> {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.CreateLC
    })
    const valid = this.ajv.validate(LetterOfCreditSchema, request)
    if (!valid) {
      const validationErrors = formatValidationErrors(this.ajv.errors)
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpSchema,
        'Invalid letter of credit format.',
        validationErrors
      )
    }
    const validApplication = await this.tradeInstrumentValidation.validateById(request.tradeId)
    if (!validApplication) {
      throw ErrorUtils.conflictException(ErrorCode.ValidationHttpContent, `Invalid LC application`, {
        tradeId: ['active financial instruments for trade exists']
      })
    }
    if (
      request.issueDueDateUnit &&
      request.issueDueDateDuration &&
      !validateLCTimerDuration(request.issueDueDateUnit, request.issueDueDateDuration)
    ) {
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, `IssueDueDateValidationError`, {
        issueDueDate: ['issueDueDate should be in range 1 hour - 1 week']
      })
    }

    let transactionHash
    let referenceId
    const user: IUser = getUser(decode(jwt))

    this.logger.info(`Creating LC...`)

    try {
      const result = await this.lcUseCase.createLC(request, user)
      transactionHash = result[0]
      referenceId = result[1]
    } catch (error) {
      throw generateHttpException(error)
    }

    this.logger.metric({
      [Metric.APICallFinished]: LCControllerEndpoints.CreateLC
    })
    return { _id: transactionHash, reference: referenceId }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'read'])
  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'manageCollection'])
  @Get('{id}')
  public async getLC(@Path() id: string): Promise<ILCResponse> {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: LCControllerEndpoints.GetLC
      })
      const result: ILC = await this.getLCData(id)
      const presentations: ILCPresentation[] = await this.getLCPresentations(result.reference)
      const timer =
        result.issueDueDate &&
        result.issueDueDate.timerStaticId &&
        result.status &&
        result.status === LC_STATE.REQUESTED
          ? await this.timerServiceClient.fetchTimer(result.issueDueDate.timerStaticId)
          : null

      this.logger.metric({
        [Metric.APICallFinished]: LCControllerEndpoints.GetLC
      })
      return {
        ...result,
        presentations,
        timer
      }
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'read'])
  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'manageCollection'])
  @Get('{id}/documents')
  public async getLCDocuments(@Path() id: string): Promise<IDocumentRegisterResponse[]> {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.GetLCDocuments
    })
    let documents: IDocumentRegisterResponse[] = []
    try {
      const lc: ILC = await this.getLCData(id)

      const lCPresentations: ILCPresentation[] = await this.getLCPresentations(lc.reference)

      for (const presentation of lCPresentations) {
        const currentCompanyRole = getCurrentPresentationRole(presentation, this.companyId)

        if (this.shouldLoadPresentationDocuments(presentation, currentCompanyRole)) {
          const documentsByReference: IDocumentRegisterResponse[] =
            (await this.documentClient.getDocuments(
              DOCUMENT_PRODUCT.TradeFinance,
              this.documentRequestBuilder.getPresentationDocumentSearchContext(presentation)
            )) || []

          if (documentsByReference) {
            documents = documents.concat(documentsByReference)
          }
        }
      }

      const lcDocuments = await this.documentClient.getDocuments(
        DOCUMENT_PRODUCT.TradeFinance,
        this.documentRequestBuilder.getLCDocumentSearchContext(lc)
      )
      if (lcDocuments) {
        documents = documents.concat(lcDocuments)
      }
      if (lc.tradeAndCargoSnapshot && lc.tradeAndCargoSnapshot.trade) {
        const tradeDocuments = await this.documentClient.getDocuments(
          DOCUMENT_PRODUCT.TradeFinance,
          this.documentRequestBuilder.getTradeDocumentSearchContext(lc.tradeAndCargoSnapshot.trade.vaktId)
        )
        if (tradeDocuments) {
          documents = documents.concat(tradeDocuments)
        }
      }
    } catch (error) {
      throw generateHttpException(error)
    }

    this.logger.metric({
      [Metric.APICallFinished]: LCControllerEndpoints.GetLCDocuments
    })
    return documents
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'read'])
  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'manageCollection'])
  @Get()
  public async getLCs(
    @Query('filter') filter: {},
    @Request() request: express.Request
  ): Promise<IPaginate<ILCResponse[]>> {
    this.logger.metric({
      [Metric.APICallReceived]: LCControllerEndpoints.GetLCs
    })
    let items
    let total
    const { query, projection, options } = queryStringParser(request)
    const { limit = 200, skip = 0 } = options
    this.logger.info('getLCs::query', { query, projection, options })

    try {
      await validateMongoFilter(JSON.stringify(query), LCRequest, {
        tradeAndCargoSnapshot: { _id: ['$in'], trade: { _id: ['$in'] }, sourceId: ['$in'] }
      })
      items = await this.lcCacheDataAgent.getLCs(query, projection, options)
      if (items) {
        items = items.map(this.unwrapLC)
        await Promise.all(
          items
            .filter(lc => lc.issueDueDate && lc.issueDueDate.timerStaticId)
            .map(async lc => {
              lc.timer =
                lc.issueDueDate && lc.issueDueDate.timerStaticId && lc.status && lc.status === LC_STATE.REQUESTED
                  ? await this.timerServiceClient.fetchTimer(lc.issueDueDate.timerStaticId)
                  : null
            })
        )
      }
      total = await this.lcCacheDataAgent.count(query)
    } catch (error) {
      throw generateHttpException(error)
    }

    this.logger.metric({
      [Metric.APICallFinished]: LCControllerEndpoints.GetLCs
    })
    return {
      limit,
      skip,
      items,
      total
    }
  }

  private async getLCData(id: string) {
    const lc = (await this.lcCacheDataAgent.getLC({
      _id: id
    })) as any

    if (!lc) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `LC with id: ${id} not found`)
    }

    return this.unwrapLC(lc)
  }

  private unwrapLC(lc): ILC {
    return typeof lc.toObject === 'function' ? lc.toObject() : lc // unpack Mongoose type
  }

  private async getLCPresentations(reference: string): Promise<ILCPresentation[]> {
    const presentation = await this.lCPresentationService.getPresentationsByLcReference(reference)

    if (!presentation) {
      throw ErrorUtils.notFoundException(
        ErrorCode.DatabaseMissingData,
        `LC presentation with reference: ${reference} not found`
      )
    }
    return presentation
  }

  private shouldLoadPresentationDocuments(presentation: ILCPresentation, role: ILCPresentationActionPerformer) {
    if (!role) {
      return false
    }

    if (role.role === LCPresentationRole.Applicant) {
      return (
        presentation.status === LCPresentationStatus.DocumentsAcceptedByApplicant ||
        presentation.status === LCPresentationStatus.DocumentsReleasedToApplicant ||
        presentation.status === LCPresentationStatus.DocumentsCompliantByNominatedBank
      )
    }

    if (role.role === LCPresentationRole.IssuingBank) {
      return (
        presentation.status === LCPresentationStatus.DocumentsAcceptedByApplicant ||
        presentation.status === LCPresentationStatus.DocumentsReleasedToApplicant
      )
    }

    return false
  }
}

function formatValidationErrors(errors: [object]) {
  const validationErrors = {}
  errors.map(error => {
    validationErrors[error['dataPath']] = [error['message']] // tslint:disable-line
  })
  return validationErrors
}
