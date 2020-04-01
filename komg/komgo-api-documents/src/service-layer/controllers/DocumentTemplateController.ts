import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, validateRequest, HttpException } from '@komgo/microservice-config'
import * as express from 'express'
import { Readable } from 'stream'
import { Body, Controller, Post, Request, Route, Security, Tags, Response } from 'tsoa'
import { v4 as uuid4 } from 'uuid'

import { DocumentTemplateCompiler } from '../../business-layer/presentation/DocumentTemplateCompiler'
import DocumentTemplateDataAgent from '../../data-layer/data-agents/DocumentTemplateDataAgent'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { streamToBuffer } from '../../utils'
import { ErrorName } from '../../utils/ErrorName'
import { CompileDocumentTemplateRequest } from '../request/document-template'
import { convertDocumentTemplate } from '../responses/converters'
import { IStoreTemplateResponse } from '../responses/document-template/'
import Uploader from '../utils/Uploader'

import ControllerUtils from './utils'

const HEADER_CONTENT_TYPE = 'Content-Type'
const HEADER_CONTENT_DISPOSITION = 'Content-disposition'
const PDF_CONTENT_TYPE = 'application/pdf'

@Tags('DocumentTemplate')
@Route('document-templates')
@provide(DocumentTemplateController)
export class DocumentTemplateController extends Controller {
  private readonly logger = getLogger('DocumentTemplateController')

  constructor(
    @inject(TYPES.DocumentTemplateDataAgent) private readonly dataAgent: DocumentTemplateDataAgent,
    @inject(TYPES.DocumentTemplateCompiler) private readonly PDFCompiler: DocumentTemplateCompiler,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils,
    @inject(TYPES.Uploader) private readonly uploader: Uploader
  ) {
    super()
  }
  /**
   * Uploads a new template document in the DB
   *
   * @param request Template to be uploaded
   *
   * @returns a resonse with the document ID in the DB
   */
  // @TODO: Make sure this security is ok, see
  // see https://consensys-komgo.atlassian.net/browse/KOMGO-1631
  @Security('withPermission', ['crud'])
  @Post('')
  public async uploadDocumentTemplate(@Request() request: express.Request): Promise<IStoreTemplateResponse> {
    const upload = await this.uploader.upload(request)
    if (!upload || !upload.file) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Bad Request: file could not be identified. Is the file field set?'
      )
    }
    const fileBuffer = upload.file.buffer
    const fileMimeType = upload.file.mimetype

    const docTemplate = {
      id: undefined,
      content: { fileId: '' }
    }
    this.logger.info('New document template: %s', JSON.stringify(docTemplate))

    const fileName = uuid4()
    try {
      // It is not clear whether this may or may not create the file on failure
      // I currently think it does, but if it is found to, this should move
      // to the next try, catch
      // see https://github.com/lykmapipo/mongoose-gridfs
      docTemplate.content.fileId = await this.dataAgent.saveFileBuffer({
        id: undefined,
        fileName,
        file: fileBuffer,
        contentType: fileMimeType
      })
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }

    try {
      const record = await this.dataAgent.create(docTemplate)
      return convertDocumentTemplate(record)
    } catch (error) {
      try {
        await this.dataAgent.deleteFile(fileName)
      } catch (e) {
        this.logger.error(
          ErrorCode.UnexpectedError,
          ErrorName.DeleteDocumentTemplateError,
          'Could not delete a template file',
          {
            templateId: docTemplate.content.fileId,
            errorMessage: e.message
          }
        )
      }
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Download the full file content.
   * @param request
   * @param docParams The document template ID and JSON fields to populate it
   */
  // @TODO: Make sure this security is ok, see
  // see https://consensys-komgo.atlassian.net/browse/KOMGO-1631
  @Response<HttpException>('404', 'Document template ID not found')
  @Response<HttpException>('422', 'In case the input is invalid (check reply content for details)')
  @Security('signedIn')
  @Post('generate-document')
  public async compileDocumentTemplate(
    @Request() request: express.Request,
    @Body() docParams: CompileDocumentTemplateRequest
  ) {
    await validateRequest(CompileDocumentTemplateRequest, docParams)

    this.logger.info('Loading document template record')

    const document = await this.dataAgent.getById(docParams.templateId)

    if (!document) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorName.DocumentTemplateNotFoundError,
        'Document template not be found',
        { templateId: docParams.templateId }
      )
      throw ErrorUtils.notFoundException(
        ErrorCode.ValidationHttpContent,
        `Document with id ${docParams.templateId} not found`
      )
    }

    this.logger.info('Loading document template file')

    const fileId: string = document.content.fileId
    const stream: Readable = await this.dataAgent.getFileStream(fileId)

    if (!stream) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, 'Document template file not found')
    }

    const buf: Buffer = await streamToBuffer(stream)

    this.logger.info('About to compile PDF document')

    let attachment: Buffer
    try {
      attachment = await this.PDFCompiler.compile(buf, docParams.fields)
    } catch (e) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.TemplateCompilerError, 'Document generation failed', {
        errorMessage: e.message
      })
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `Failed to compile PDF - ${e.message}`
      )
    }

    const response = request.res as express.Response
    response.set(HEADER_CONTENT_DISPOSITION, 'attachment; filename=' + 'out.pdf')
    response.set(HEADER_CONTENT_TYPE, PDF_CONTENT_TYPE)

    response.write(attachment)
  }
}
