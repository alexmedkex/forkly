import * as express from 'express'
import { Route, Controller, Security, SuccessResponse, Post, Path, Header, Request, Get, Delete, Body, Put } from 'tsoa'
import { provideSingleton, inject } from '../../inversify/ioc'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../inversify/types'
import { LCPresentationDocumentStatus, LCPresentationStatus } from '@komgo/types'
import { DOCUMENT_CATEGORY, DOCUMENT_PRODUCT } from '../../business-layer/documents/documentTypes'
import ILCDocument from '../../business-layer/types/ILCDocument'
import { IDocumentRegisterResponse } from '../../business-layer/documents/IDocumentRegisterResponse'
import IUser from '../../business-layer/IUser'
import getUser from '../../business-layer/util/getUser'
import decode from '../../middleware/utils/decode'
import { LC_STATE } from '../../business-layer/events/LC/LCStates'
import { IDocumentServiceClient } from '../../business-layer/documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../business-layer/documents/DocumentRequestBuilder'
import { ILCPresentationService } from '../../business-layer/lc-presentation/ILCPresentationService'
import IDocumentService from '../../business-layer/documents/IDocumentService'
import Uploader from '../utils/Uploader'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { IComment } from '../requests/IComment'
import { ILCPresentationReviewService } from '../../business-layer/lc-presentation/ILCPresentationReviewService'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILC } from '../../data-layer/models/ILC'
import * as path from 'path'
import * as mime from 'mime-types'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { generateHttpException } from '../utils/ErrorHandling'
import { ILCPresentationActionCommentRequest } from '../requests/ILCPresentationActionCommentRequest'
import { IPresentationSharedDocuments } from '../../business-layer/lc-presentation/IPresentationSharedDocuments'
import { Metric, LCPresentationControllerEndpoints } from '../../utils/Metrics'
const HTTP_CREATED_STATUS = 201

@Route('lc')
@provideSingleton(LCPresentationController)
export class LCPresentationController extends Controller {
  private logger = getLogger('LCPresentationController')
  private acknowledgeStateErrorMsg = 'LC should be in the "Acknowledged" state'
  constructor(
    @inject(TYPES.LCCacheDataAgent) private lcCacheDataAgent: ILCCacheDataAgent,
    @inject(TYPES.Uploader) private uploader: Uploader,
    @inject(TYPES.DocumentServiceClient) private readonly documentClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) private readonly documentRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.DocumentService) private readonly documentService: IDocumentService,
    @inject(TYPES.LCPresentationService) private readonly lCPresentationService: ILCPresentationService,
    @inject(TYPES.LCPresentationReviewService)
    private readonly lcPresentationReviewService: ILCPresentationReviewService
  ) {
    super()
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Post('{id}/presentations')
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  public async addPresentation(@Path('id') lcId: string) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.AddPresentation
    })
    const lc = await this.getLCData(lcId)

    const presentation = await this.lCPresentationService.createNewPresentation(lc)

    this.setStatus(HTTP_CREATED_STATUS)

    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.AddPresentation
    })
    return presentation
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @SuccessResponse('200', 'Get')
  @Get('{id}/presentations/{presentationId}/documents')
  public async getPresentationDocuments(
    @Path() id: string,
    @Path() presentationId: string
  ): Promise<IDocumentRegisterResponse[]> {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.GetPresentationDocuments
    })
    const lc = await this.getLCData(id)

    const presentation = await this.getLCPresentationByIdData(presentationId)
    try {
      this.logger.metric({
        [Metric.APICallFinished]: LCPresentationControllerEndpoints.GetPresentationDocuments
      })
      return this.lCPresentationService.getLCPresentationDocuments(lc, presentation)
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @SuccessResponse('200', 'Get')
  @Get('{id}/presentations/{presentationId}/vaktDocuments')
  public async getPresentationVaktDocuments(
    @Path() id: string,
    @Path() presentationId: string
  ): Promise<IDocumentRegisterResponse[]> {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.GetPresentationVaktDocuments
    })
    const lc = await this.getLCData(id)

    let vaktId = null
    if (lc.tradeAndCargoSnapshot && lc.tradeAndCargoSnapshot.trade && lc.tradeAndCargoSnapshot.trade.vaktId) {
      vaktId = lc.tradeAndCargoSnapshot.trade.vaktId
    } else {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'LC should contain trade with vaktId'
      )
    }

    const presentation = await this.getLCPresentationByIdData(presentationId)

    let documents =
      (await this.documentClient.getDocuments(
        DOCUMENT_PRODUCT.TradeFinance,
        this.documentRequestBuilder.getTradeDocumentContext(vaktId)
      )) || []

    if (!documents.length) {
      this.logger.metric({
        [Metric.APICallFinished]: LCPresentationControllerEndpoints.GetPresentationVaktDocuments
      })
      return []
    }

    const documentIds = presentation.documents
      ? new Set(presentation.documents.map(({ documentId }) => documentId))
      : new Set([])

    documents = documents.filter(
      document => !documentIds.has(document.id) && (!document.context || !document.context.presentataionId)
    )

    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.GetPresentationVaktDocuments
    })
    return documents
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  @Post('/{id}/presentation/{presentationId}/upload')
  public async uploadPresentationDocument(
    @Path() id: string,
    @Path() presentationId: string,
    @Header('Authorization') jwt: string,
    @Request() request: express.Request
  ): Promise<IDocumentRegisterResponse> {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.UploadPresentationDocument
    })
    const user: IUser = getUser(decode(jwt))

    const lc = await this.getLCData(id)
    this.verifyLCAcknowledgedState(lc)

    const presentation = await this.getPresentation(presentationId)
    if (presentation.status !== LCPresentationStatus.Draft) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Presentation should be in the "Draft" state'
      )
    }

    const formData = await this.uploader.resolveMultipartData<ILCDocument>(request, 'extraData')

    if (formData.data.categoryId !== DOCUMENT_CATEGORY.TradeDocuments) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Only trade documents can be presented for an LC'
      )
    }

    let document: IDocumentRegisterResponse

    try {
      document = await this.documentService.registerLcPresentationDocument(
        lc,
        presentation,
        formData.data,
        formData.file,
        user,
        {}
      )

      if (!presentation.documents) {
        presentation.documents = []
      }

      if (!presentation.documents) {
        presentation.documents = []
      }

      presentation.documents.push({
        documentId: document.id,
        documentHash: document.hash,
        status: LCPresentationDocumentStatus.Draft,
        documentTypeId: document.type.id,
        dateProvided: document.registrationDate
      })

      await this.lCPresentationService.updatePresentation(presentation)
    } catch (error) {
      throw generateHttpException(error)
    }

    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.UploadPresentationDocument
    })
    return document
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @SuccessResponse('204', 'Deleted')
  @Delete('presentations/{id}')
  public async deletePresentationById(@Path() id: string): Promise<void> {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: LCPresentationControllerEndpoints.DeletePresentationById
      })
      const result = await this.lCPresentationService.deletePresentationById(id)
      this.logger.metric({
        [Metric.APICallFinished]: LCPresentationControllerEndpoints.DeletePresentationById
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @SuccessResponse('204', 'Deleted')
  @Delete('presentations/{id}/documents/{documentId}')
  public async deletePresentationDocument(@Path() id: string, @Path() documentId: string): Promise<void> {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: LCPresentationControllerEndpoints.DeletePresentationDocument
      })
      const result = await this.lCPresentationService.deletePresentationDocument(id, documentId)
      this.logger.metric({
        [Metric.APICallFinished]: LCPresentationControllerEndpoints.DeletePresentationDocument
      })
      return result
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @SuccessResponse(HTTP_CREATED_STATUS)
  @Post('presentations/{presentationId}/submit')
  public async submitPresentation(@Path() presentationId: string, @Body() request: IComment): Promise<string> {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: LCPresentationControllerEndpoints.SubmitPresentation
      })
      this.logger.info('testing')
      const presentation = await this.getLCPresentationByIdData(presentationId)
      const lc = await this.getLCDataByReference(presentation.LCReference)

      const txHash = await this.lCPresentationService.submitPresentation(
        presentation,
        request ? request.comment : null,
        lc
      )

      this.setStatus(HTTP_CREATED_STATUS)
      this.logger.metric({
        [Metric.APICallFinished]: LCPresentationControllerEndpoints.SubmitPresentation
      })
      return txHash
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @SuccessResponse(HTTP_CREATED_STATUS)
  @Put('{id}/presentations/{presentationId}/addDocuments')
  public async addDocuments(
    @Path() id: string,
    @Path() presentationId: string,
    @Body() request: string[]
  ): Promise<IDocumentRegisterResponse[]> {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.AddDocuments
    })
    const lc = await this.getLCData(id)
    if (lc.status !== LC_STATE.ACKNOWLEDGED) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, this.acknowledgeStateErrorMsg)
    }

    const presentation = await this.getPresentation(presentationId)

    let document: IDocumentRegisterResponse
    const allDocument: IDocumentRegisterResponse[] = []

    if (!presentation.documents) {
      presentation.documents = []
    }

    const additionalContext = this.addTradeAndCargoSnapshotVaktId(lc)

    try {
      for (const documentId of request) {
        document = await this.documentClient.getDocumentById(DOCUMENT_PRODUCT.TradeFinance, documentId)
        if (!presentation.documents.find(d => d.documentId === documentId)) {
          let doc = document
          if (
            document.context &&
            (!document.context.lcPresentationStaticId ||
              document.context.lcPresentationStaticId !== presentation.staticId)
          ) {
            doc = await this.deepCloneDocument(lc, presentation, document, additionalContext)
          }

          presentation.documents.push({
            documentId: doc.id,
            documentHash: doc.hash,
            status: LCPresentationDocumentStatus.Draft,
            documentTypeId: doc.type.id,
            dateProvided: doc.registrationDate
          })
          allDocument.push(doc)
        }
      }
      await this.lCPresentationService.updatePresentation(presentation)
    } catch (error) {
      throw generateHttpException(error)
    }

    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.AddDocuments
    })
    return allDocument
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  @Post('/{id}/presentations/{presentationId}/compliant')
  public async markCompliant(@Path() id: string, @Path() presentationId: string) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.MarkCompliant
    })
    const lc = await this.getLCData(id)
    this.verifyLCAcknowledgedState(lc)

    const presentation = await this.getLCPresentationByIdData(presentationId)

    try {
      await this.lcPresentationReviewService.markCompliant(presentation, lc)
    } catch (error) {
      throw generateHttpException(error)
    }
    this.setStatus(HTTP_CREATED_STATUS)
    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.MarkCompliant
    })
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  @Post('/{id}/presentations/{presentationId}/discrepant')
  public async markDiscrepant(
    @Path() id: string,
    @Path() presentationId: string,
    @Body() request: ILCPresentationActionCommentRequest
  ) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.MarkDiscrepant
    })
    const lc = await this.getLCData(id)
    this.verifyLCAcknowledgedState(lc)

    const presentation = await this.getLCPresentationByIdData(presentationId)
    await this.lcPresentationReviewService.markDiscrepant(presentation, lc, request.comment)
    this.setStatus(HTTP_CREATED_STATUS)
    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.MarkDiscrepant
    })
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  @Post('/{id}/presentations/{presentationId}/adviseDiscrepancies')
  public async adviseDsicrepancies(
    @Path() id: string,
    @Path() presentationId: string,
    @Body() request: ILCPresentationActionCommentRequest
  ) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.AdviseDsicrepancies
    })
    const lc = await this.getLCData(id)
    this.verifyLCAcknowledgedState(lc)

    const presentation = await this.getLCPresentationByIdData(presentationId)
    await this.lcPresentationReviewService.adviseDiscrepancies(presentation, lc, request.comment)
    this.setStatus(HTTP_CREATED_STATUS)
    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.AdviseDsicrepancies
    })
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  @Post('/{id}/presentations/{presentationId}/acceptDiscrepancies')
  public async acceptDiscrepancies(
    @Path() id: string,
    @Path() presentationId: string,
    @Body() request: ILCPresentationActionCommentRequest
  ) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.AcceptDiscrepancies
    })
    const lc = await this.getLCData(id)
    this.verifyLCAcknowledgedState(lc)

    const presentation = await this.getLCPresentationByIdData(presentationId)
    await this.lcPresentationReviewService.acceptDiscrepancies(presentation, lc, request.comment)
    this.setStatus(HTTP_CREATED_STATUS)
    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.AcceptDiscrepancies
    })
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @SuccessResponse(HTTP_CREATED_STATUS, 'Created')
  @Post('/{id}/presentations/{presentationId}/rejectDiscrepancies')
  public async rejectDiscrepancies(
    @Path() id: string,
    @Path() presentationId: string,
    @Body() request: ILCPresentationActionCommentRequest
  ) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.RejectDiscrepancies
    })
    const lc = await this.getLCData(id)
    this.verifyLCAcknowledgedState(lc)

    const presentation = await this.getLCPresentationByIdData(presentationId)
    await this.lcPresentationReviewService.rejectDiscrepancies(presentation, lc, request.comment)
    this.setStatus(HTTP_CREATED_STATUS)
    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.RejectDiscrepancies
    })
  }

  @Security('withPermission', ['tradeFinance', 'reviewPresentation', 'readWrite'])
  @Get('/{id}/presentations/{presentationId}/received-documents')
  public async getPresentationDocumentReview(@Path() id: string, @Path() presentationId: string) {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.GetPresentationDocumentReview
    })
    let review
    try {
      const presentation = await this.getLCPresentationByIdData(presentationId)
      review = await this.lcPresentationReviewService.getReceivedDocuments(presentation)
    } catch (error) {
      throw generateHttpException(error)
    }

    if (!review) {
      throw ErrorUtils.notFoundException(
        ErrorCode.DatabaseMissingData,
        `Documents review for presentation ${presentationId} not found`
      )
    }

    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.GetPresentationDocumentReview
    })
    return review
  }

  @Security('withPermission', ['tradeFinance', 'managePresentation'])
  @Get('/{id}/presentations/{presentationId}/documents-feedback')
  public async getPresentationFeedback(
    @Path() id: string,
    @Path() presentationId: string
  ): Promise<IPresentationSharedDocuments> {
    this.logger.metric({
      [Metric.APICallReceived]: LCPresentationControllerEndpoints.GetPresentationFeedback
    })
    await this.getLCData(id)
    const presentation = await this.getLCPresentationByIdData(presentationId)
    const result = this.lcPresentationReviewService.getDocumentsFeedback(presentation)
    this.logger.metric({
      [Metric.APICallFinished]: LCPresentationControllerEndpoints.GetPresentationFeedback
    })
    return result
  }

  private async getLCData(id: string) {
    const lc = (await this.lcCacheDataAgent.getLC({
      _id: id
    })) as any
    if (!lc) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `LC with id: ${id} not found`)
    }
    return typeof lc.toObject === 'function' ? lc.toObject() : lc // unpack Mongoose type
  }

  private async getLCDataByReference(reference: string) {
    const lc = (await this.lcCacheDataAgent.getLC({
      reference
    })) as any

    if (!lc) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `LC with reference: ${reference} not found`)
    }

    return lc
  }

  private async getLCPresentationByIdData(id: string) {
    const presentation = await this.lCPresentationService.getLCPresentationById(id)

    if (!presentation) {
      throw ErrorUtils.notFoundException(
        ErrorCode.DatabaseMissingData,
        `LC Presentation with presentataionId: ${id} not found`
      )
    }
    return presentation
  }

  private async deepCloneDocument(
    lc: ILC,
    presentation: ILCPresentation,
    document: IDocumentRegisterResponse,
    additionalContext: object
  ) {
    const documentContent = await this.documentClient.getDocumentContent(DOCUMENT_PRODUCT.TradeFinance, document.id)
    const extension = path.extname(document.name)
    // name must be unique so presentation reference and name will be unique combination
    return this.documentService.registerLcPresentationDocument(
      lc,
      presentation,
      {
        categoryId: document.category.id,
        comment: document.comment,
        name: `${presentation.reference} - ${document.name}`,
        typeId: document.type.id,
        parcelId: lc.parcelId
      },
      {
        buffer: documentContent.data,
        mimetype: mime.lookup(extension),
        originalname: `${presentation.reference} - ${document.name}`,
        ext: extension
      },
      null,
      additionalContext
    )
  }

  private async getPresentation(presentationId) {
    const presentation = await this.getLCPresentationByIdData(presentationId)
    if (presentation.status !== LCPresentationStatus.Draft) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Presentation should be in the "Draft" state'
      )
    }
    return presentation
  }

  private addTradeAndCargoSnapshotVaktId(lc: any) {
    if (lc && lc.tradeAndCargoSnapshot && lc.tradeAndCargoSnapshot.trade && lc.tradeAndCargoSnapshot.trade.vaktId) {
      return {
        vaktId: lc.tradeAndCargoSnapshot.trade.vaktId
      }
    }
    return null
  }

  private verifyLCAcknowledgedState(lc: ILC) {
    if (lc.status !== LC_STATE.ACKNOWLEDGED) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, this.acknowledgeStateErrorMsg)
    }
  }
}
