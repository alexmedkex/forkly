import { FileParserToPDF } from '@komgo/document-generator'
import { ErrorCode } from '@komgo/error-utilities'
import logger, { getLogger } from '@komgo/logging'
import { ErrorUtils, validateRequest, HttpException } from '@komgo/microservice-config'
import { ObjectId } from 'bson'
import * as express from 'express'
import * as lodash from 'lodash'
import * as path from 'path'
import { Readable } from 'stream'
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Request,
  Route,
  Security,
  Tags,
  Header,
  Response
} from 'tsoa'

import { ReceivedDocumentsService } from '../../business-layer/services/ReceivedDocumentsService'
import CategoryDataAgent from '../../data-layer/data-agents/CategoryDataAgent'
import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { IDocument, IFullDocument } from '../../data-layer/models/document'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { DocumentsTransactionManager } from '../../infrastructure/blockchain/DocumentsTransactionManager'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { streamToBuffer } from '../../utils'
import Clock from '../../utils/Clock'
import { ErrorName } from '../../utils/ErrorName'
import { updatePDF } from '../../utils/updatePDFWithVerificationLink/updatePDF'
import { CreateDocumentRequest, Owner, UpdateDocumentRequest } from '../request/document'
import { KeyValueRequest } from '../request/KeyValueRequest'
import { convertDocument, convertFullDocument } from '../responses/converters'
import { IDocumentResponse } from '../responses/document'
import { IFullDocumentResponse } from '../responses/document/IFullDocumentResponse'
import { getFilenameExt, getFilenameWithoutExt, isParseableToPDF } from '../utils/filename'
import Uploader from '../utils/Uploader'

import { IDocumentHash } from './IDocumentHash'
import ControllerUtils from './utils'

const HEADER_CONTENT_TYPE = 'Content-Type'
const HEADER_CONTENT_DISPOSITION = 'Content-disposition'

@Tags('Documents')
@Route('products')
@provideSingleton(RegisterController)
export class RegisterController extends Controller {
  private readonly logger = getLogger('RegisterController')
  private transactionManagerInstance: DocumentsTransactionManager

  constructor(
    @inject(TYPES.DocumentsTransactionManagerProvider)
    private readonly docTxManagerProvider: () => Promise<DocumentsTransactionManager>,
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.ProductDataAgent) private readonly productDataAgent: ProductDataAgent,
    @inject(TYPES.CategoryDataAgent) private readonly categoryDataAgent: CategoryDataAgent,
    @inject(TYPES.TypeDataAgent) private readonly typeDataAgent: TypeDataAgent,
    @inject(TYPES.Uploader) private readonly uploader: Uploader,
    @inject(TYPES.CompaniesRegistryClient) private readonly registryClient: CompaniesRegistryClient,
    @inject(TYPES.Clock) private readonly clock: Clock,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils,
    @inject(TYPES.ReceivedDocumentsService) private readonly receivedDocumentsService: ReceivedDocumentsService
  ) {
    super()
  }

  /**
   * Uploads a new document
   * extraData as an example :
   * { "name":"docName", "metadata": [{"name": "string", "value": "string" }],"owner": {"firstName": "string","lastName": "string","companyId": "string" }}
   *
   * @param request File to upload
   * @param productId functional ID of product (ex: 'kyc' or 'tradeFinance')
   * @param categoryId functional ID of enclosing category
   * @param typeId functional ID of enclosing type
   * @param jwt
   * @param komgoStamp
   */
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['kyc', 'requestDoc', 'readRequest'])
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post('{productId}/categories/{categoryId}/types/{typeId}/upload')
  public async upload(
    @Request() request: express.Request,
    @Path('productId') productId: string,
    @Path('categoryId') categoryId: string,
    @Path('typeId') typeId: string,
    @Header('Authorization') jwt?: string,
    @Header('komgoStamp') komgoStamp = false
  ): Promise<IFullDocumentResponse> {
    let uploadedDoc: IFullDocumentResponse

    uploadedDoc = await this.uploadDocument(request, productId, categoryId, typeId, jwt, komgoStamp)

    // retry will attempt to sign & register internal
    try {
      return await this.retry(productId, uploadedDoc.id)
    } catch (error) {
      throw ErrorUtils.internalServerException(ErrorCode.ConnectionMicroservice, JSON.stringify(uploadedDoc))
    }
  }

  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post('{productId}/document/{documentId}/retry')
  public async retry(
    @Path('productId') productId: string,
    @Path('documentId') documentId: string
  ): Promise<IFullDocumentResponse> {
    const document: IDocument = await this.documentDataAgent.getBareById(productId, documentId)
    if (!document) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.DocumentNotFoundError, {
        documentId,
        errorMessage: 'Document not found'
      })
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Document does not exist')
    }

    let signedDoc
    try {
      signedDoc = await this.signDocument(document)
    } catch (signError) {
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.DocumentNotSignedError, 'Failed to sign document', {
        documentId,
        error: signError.message
      })
      throw signError
    }

    try {
      const registeredDoc = await this.registerDocument(signedDoc)

      return await this.convertDocument(registeredDoc)
    } catch (registerError) {
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.SubmitDocumentHashError, 'Failed to submit hash', {
        documentId,
        error: registerError.message
      })

      throw registerError
    }
  }

  /**
   * Uploads and registers a new File in the DB and Smart Contract
   * extraData as an example :
   * { "name":"docName", "metadata": [{"name": "string", "value": "string" }],"owner": {"firstName": "string","lastName": "string","companyId": "string" }}
   *
   * @param request File to upload
   * @param productId functional ID of product (ex: 'kyc' or 'tradeFinance')
   * @param categoryId functional ID of enclosing category
   * @param typeId functional ID of enclosing type
   */
  @Response<HttpException>(422, 'Input data had malformed or missing data')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post('{productId}/categories/{categoryId}/types/{typeId}/documents')
  public async uploadFile(
    @Request() request: express.Request,
    @Path('productId') productId: string,
    @Path('categoryId') categoryId: string,
    @Path('typeId') typeId: string,
    @Header('Authorization') jwt?: string
  ): Promise<IFullDocumentResponse> {
    const upload = await this.uploader.upload(request)
    const docTxManager = await this.transactionManager()
    const documentRequest: CreateDocumentRequest = JSON.parse(upload.body.extraData)
    // throws 422 if product ID is unknown
    await this.validateRequest(productId, categoryId, typeId, documentRequest)

    const fileExt = path.extname(upload.file.originalname)

    const metadata: KeyValueRequest[] = documentRequest.metadata
    const owner: Owner = documentRequest.owner
    const name: string = documentRequest.name + fileExt
    const context: object = documentRequest.context
    const comment: string = documentRequest.comment

    // Hash content + hash metadata = Merkle(hashContent + hashMeta)
    const fileBuffer: Buffer = upload.file.buffer
    const fileMimeType: string = upload.file.mimetype
    const content: string = fileBuffer.toString('base64')
    const hashDoc: Buffer = docTxManager.hash(content)
    const hashMetadata: Buffer = docTxManager.hash(JSON.stringify(metadata))
    const hashMerkle: string = docTxManager.merkle([hashDoc, hashMetadata])

    const documentExists: boolean = await this.documentDataAgent.existsWithMerkleRoot(productId, hashMerkle)
    if (documentExists) {
      throw ErrorUtils.conflictException(
        ErrorCode.ValidationHttpContent,
        'A document with the same content and metadata already exists'
      )
    }

    const duplicateName: boolean = await this.documentDataAgent.existsWithName(productId, name)
    if (duplicateName) {
      throw ErrorUtils.conflictException(
        ErrorCode.ValidationHttpContent,
        'A document with the same name, product and owner already exists'
      )
    }

    const signedHashDoc = await docTxManager.signDocument(hashMerkle)

    const newDocument: IDocument = {
      id: undefined,
      context,
      name,
      productId,
      categoryId,
      typeId,
      owner,
      hash: hashMerkle,
      contentHash: `0x${hashDoc.toString('hex')}`,
      komgoStamp: false,
      registrationDate: this.clock.currentTime(),
      metadata,
      content: {
        // data to be added after gridfs returns the _id (referencing the chunks)
        fileId: '',
        signature: signedHashDoc,
        size: fileBuffer.byteLength
      },
      sharedWith: [],
      sharedBy: 'none',
      comment,
      state: DocumentState.Pending
    }

    this.logger.info('Adding new document', {
      name: newDocument.name,
      context: newDocument.context,
      product: newDocument.productId,
      category: newDocument.categoryId,
      type: newDocument.typeId,
      owner: newDocument.owner
    })

    // gridfs
    let record
    try {
      const fileRecord = await this.storeFileInGridFS(name, fileBuffer, fileMimeType)
      newDocument.content.fileId = fileRecord

      record = await this.documentDataAgent.create(productId, newDocument)
    } catch (error) {
      // in case we created the file but not the record
      await this.documentDataAgent.deleteFile(name)
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }

    const transactionId = await this.registerHash(record)

    const uploaderUserId: string = jwt ? await this.controllerUtils.fetchUserIdByJwt(jwt) : undefined

    record.uploadInfo = {
      transactionId,
      uploaderUserId
    }
    this.logger.info('Updating document to store signing transaction id', {
      transactionId
    })
    await this.documentDataAgent.update(productId, record)

    record.product = await this.productDataAgent.getById(productId)
    record.category = await this.categoryDataAgent.getById(productId, categoryId)
    record.type = await this.typeDataAgent.getById(productId, typeId)

    return convertFullDocument(record)
  }

  /**
   * Get documents by productId, sharedBy, and context.
   * Can get all documents by productId (if only this parameter is provided).
   * Alternatively, can return all documents sharedBy specific party with the provided context if "sharedBy" and "context" are provided.
   * Alternatively, can return all documents with names matching provided regular expression, if  "query" parameter is provided.
   *
   * @param productId
   * @param {string} sharedBy Filter document based on shared by field
   * @param {string} context filter documents based on context
   * @param {string} sharedBy filter documents by the "sharedBy" field
   * @param {string} query regex expression to filter documents' names by
   */
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Get('{productId}/documents')
  @Response<HttpException>(422, 'Product ID does not exist or context is malformed')
  public async Find(
    @Path('productId') productId: string,
    @Query('sharedBy') sharedBy?: string,
    @Query('context') context?: string,
    @Query('query') query?: string
  ): Promise<IFullDocumentResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    // throws 422 if it is unable to parse value
    const documentContext = this.controllerUtils.parseJSONParam(context, 'context')
    const documents = await this.documentDataAgent.getAllWithContext(
      productId,
      sharedBy,
      documentContext,
      this.parseRegexp(query)
    )
    const fullDocs: IFullDocumentResponse[] = documents.map(document => convertFullDocument(document))
    const fullDocsWithSharedInfo: IFullDocumentResponse[] = await this.addSharedInfo(fullDocs, productId)
    return fullDocsWithSharedInfo
  }

  /**
   * Get a single document by productId and documentId.
   * Can get all documents by productId (if only this parameter is provided).
   * Alternatively, can return all documents sharedBy specific party with the provided context if "sharedBy" and "context" are provided.
   * Alternatively, can return all documents with names matching provided regular expression, if  "query" parameter is provided.
   *
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param {string} documentId Identifier of the document to return
   */
  @Response<HttpException>(404, 'Document does not exist for supplied document ID')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Get('{productId}/documents/{documentId}')
  public async GetById(
    @Path('productId') productId: string,
    @Path('documentId') documentId: string
  ): Promise<IFullDocumentResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      const document = await this.documentDataAgent.getById(productId, documentId)
      if (document) {
        return convertFullDocument(document)
      } else {
        throw ErrorUtils.notFoundException(
          ErrorCode.ValidationHttpContent,
          `Document not found for given Document ID: ${documentId}`
        )
      }
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Updates a document
   *
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param updateDocument Actual update of the document
   */
  @Response<HttpException>(404, 'Document to update does not exist')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Patch('{productId}/documents')
  public async UpdateDocument(
    @Path('productId') productId: string,
    @Body() updateDocument: UpdateDocumentRequest
  ): Promise<IDocumentResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    await validateRequest(UpdateDocumentRequest, updateDocument)
    try {
      let toUpdate: IDocument = await this.documentDataAgent.getBareById(productId, updateDocument.id)
      toUpdate = lodash.merge(toUpdate, updateDocument)

      const updatedDocument: IDocument = await this.documentDataAgent.update(productId, toUpdate)
      return convertDocument(updatedDocument)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Download document content.
   *
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param request request object from the "express" library
   * @param documentId id of a document for which file content should be returned
   * @param printVersion optional boolean to inform that we want the printable version (pdf) of the document or the original format
   */
  @Response<HttpException>(404, 'Document does not exist')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Get('{productId}/documents/{documentId}/content')
  public async DownloadFile(
    @Request() request: express.Request,
    @Path('productId') productId: string,
    @Path('documentId') documentId: string,
    @Query('printVersion') printVersion?: boolean,
    @Header('Authorization') jwt?: string
  ) {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const response = request.res as express.Response

    // find gridFS file ID
    const document: IFullDocument = await this.documentDataAgent.getById(productId, documentId)
    if (document == null) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, `Document with id ${documentId} not found`)
    }

    let download: Buffer
    try {
      const fileId: string = document.content.fileId
      const contentType: string = await this.documentDataAgent.getFileContentType(fileId)

      response.set(HEADER_CONTENT_DISPOSITION, `attachment; filename=${document.name}`)
      response.set(HEADER_CONTENT_TYPE, contentType)

      const fileExt = getFilenameExt(document.name, false)
      if (printVersion && isParseableToPDF(fileExt)) {
        download = await this.getContentOfPrintableVersion(document, productId)
        const pdfMimetype = 'application/pdf'
        const pdfNewFilename = `${getFilenameWithoutExt(document.name)}.pdf`
        response.set(HEADER_CONTENT_DISPOSITION, `attachment; filename=${pdfNewFilename}`)
        response.set(HEADER_CONTENT_TYPE, pdfMimetype)
      } else {
        download = await this.readFileContentFromGridFS(fileId)
      }

      response.write(download)

      // update downloader records
      const downloaderUserId: string = jwt ? await this.controllerUtils.fetchUserIdByJwt(jwt) : undefined
      await this.documentDataAgent.updateDownloadByUser(productId, document.id, downloaderUserId)
    } catch (error) {
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Delete a document for a given product ID and document ID
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param documentId Identifier of the document to delete
   */
  @Response<HttpException>(404, 'Document does not exist for supplied document ID')
  @Response<HttpException>(
    422,
    'Reasons: 1) Product ID does not exist 2) Document has been shared with us 3) Document was already shared'
  )
  @Response<HttpException>(500, 'Unable to delete document')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['tradeFinance', 'manageTrades', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Delete('{productId}/documents/{documentId}')
  public async DeleteDocument(
    @Path('productId') productId: string,
    @Path('documentId') documentId: string
  ): Promise<IFullDocumentResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const document = await this.documentDataAgent.getById(productId, documentId)
    if (!document) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Document not found')
    }

    // sharedBy will hold the static id of whom shared the doc with us
    const isDocTheirs: boolean = document.sharedBy !== 'none' && document.sharedBy.length > 0
    if (isDocTheirs) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Document has been shared with us! Unable to delete!'
      )
    }

    const hasDocBeenShared: boolean = document.sharedWith.length > 0
    if (hasDocBeenShared) {
      const counterparties = document.sharedWith.map(
        async sharedWith => `${await this.registryClient.getCompanyNameByStaticId(sharedWith.counterpartyId)}`
      )

      const sharedWithAsStr = await Promise.all(counterparties)
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `Can't delete file. We have already shared ${document.name} with counterparties : ${sharedWithAsStr}`
      )
    }

    try {
      await this.documentDataAgent.delete(productId, documentId)
    } catch (dbError) {
      logger.error(ErrorCode.DatabaseInvalidData, ErrorName.DeleteDocumentError, 'Failed to delete document', {
        documentId,
        errorMessage: dbError.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.Connection)
    }

    return convertFullDocument(document)
  }

  private async storeFileInGridFS(namefile: string, fileBuffer: Buffer, memtype: string): Promise<string> {
    return this.documentDataAgent.saveFileBuffer({
      id: undefined,
      fileName: namefile,
      file: fileBuffer,
      contentType: memtype
    })
  }

  private async convertDocument(document: any): Promise<IFullDocumentResponse> {
    const productId = document.productId

    document.product = await this.productDataAgent.getById(productId)
    document.category = await this.categoryDataAgent.getById(productId, document.categoryId)
    document.type = await this.typeDataAgent.getById(productId, document.typeId)

    return convertFullDocument(document)
  }

  private async uploadDocument(
    request: express.Request,
    productId: string,
    categoryId: string,
    typeId: string,
    jwt?: string,
    komgoStamp = false
  ): Promise<IFullDocumentResponse> {
    const upload = await this.uploader.upload(request)
    const documentRequest: CreateDocumentRequest = JSON.parse(upload.body.extraData)

    if (komgoStamp) {
      const companyStaticId = documentRequest.owner.companyId
      const companyName = await this.registryClient.getCompanyNameByStaticId(companyStaticId)

      try {
        upload.file.buffer = updatePDF(upload.file.buffer, companyName)
      } catch (err) {
        this.logger.error(ErrorCode.UnexpectedError, ErrorName.UpdatePDFError, err.message, { stacktrace: err.stack })
        const errorMessage = 'Unable to update PDF with the komgo stamp. Please check if PDF document is correct'
        throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, errorMessage)
      }
    }

    // throws 422 if request fields are unknown
    await this.validateRequest(productId, categoryId, typeId, documentRequest)

    const uploaderUserId: string = jwt ? await this.controllerUtils.fetchUserIdByJwt(jwt) : undefined

    const newDocument: IDocument = await this.buildDocumentRecord(
      productId,
      categoryId,
      typeId,
      documentRequest,
      upload,
      uploaderUserId,
      komgoStamp
    )

    try {
      const fileId = await this.saveToGridFs(newDocument.name, upload)
      newDocument.content.fileId = fileId

      const record = await this.documentDataAgent.create(productId, newDocument)
      return await this.convertDocument(record)
    } catch (error) {
      // in case we created the file but not the record
      await this.documentDataAgent.deleteFile(newDocument.name)
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  private async signDocument(document: IDocument): Promise<IDocumentResponse> {
    if (document.content.signature) {
      // already signed
      return document
    }

    const docTxManager = await this.transactionManager()
    const signedHash = await docTxManager.signDocument(document.hash)

    return this.documentDataAgent.findAndUpdate(document.productId, document.id, {
      $set: { 'content.signature': signedHash }
    })
  }

  private async registerDocument(document: IDocument): Promise<IDocumentResponse> {
    if (!document.content.signature) {
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, 'Document is not signed yet', {
        signature: ['Missing signature']
      })
    }

    const updatedDoc = await this.updateTxIdIfNecessary(document)

    await this.registerHash(updatedDoc, new ObjectId(updatedDoc.uploadInfo.transactionId))
    return updatedDoc
  }

  private async updateTxIdIfNecessary(document: IDocument): Promise<IDocument> {
    if (document.state === DocumentState.Registered) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Document has been succesfully registered'
      )
    }

    // Document registration has failed
    // We need to retry with a new transaction id
    if (document.state === DocumentState.Failed) {
      const transactionId = this.generateTxId()
      this.logger.info('Updating document to store signing transaction id', {
        transactionId,
        documentState: document.state
      })

      // This should fail if called concurrently because
      // Mongoose is keeping track of document versions
      document.uploadInfo.transactionId = transactionId
      document.state = DocumentState.Pending
      this.documentDataAgent.update(document.productId, document)
    }

    return document
  }

  private async validateRequest(productId: string, categoryId: string, typeId: string, bodyRequest) {
    await this.controllerUtils.validateProductId(productId)

    const categoryExists: boolean = await this.categoryDataAgent.exists(productId, categoryId)
    if (!categoryExists) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Category does not exist', {
        categoryId: ['Category with this id does not exist']
      })
    }

    const typeExists: boolean = await this.typeDataAgent.exists(productId, typeId)
    if (!typeExists) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Type does not exist', {
        typeId: ['Type with this id does not exist']
      })
    }

    await validateRequest(CreateDocumentRequest, bodyRequest)
  }

  private async registerHash(document: IDocument, txId?: ObjectId): Promise<string> {
    const docTxManager = await this.transactionManager()
    const hashes = [document.hash]
    if (document.komgoStamp) {
      // register content hash for documents with komgo stamp
      // so that users can verify them using a public Document Verification page
      hashes.push(document.contentHash)
    }
    try {
      this.logger.info('Sending a blockchain transaction to send a document')
      const transactionId = await docTxManager.submitDocHashes(hashes, txId)
      this.logger.info('Generated a blockchain transaction id', { transactionId })
      return transactionId
    } catch (txError) {
      this.logger.error(
        ErrorCode.Connection,
        ErrorName.SubmitDocumentHashError,
        'Failed to submit hash to blockchain signer!',
        {
          errorMessage: txError.message
        }
      )

      throw ErrorUtils.internalServerException(ErrorCode.Connection)
    }
  }

  private async transactionManager(): Promise<DocumentsTransactionManager> {
    if (this.transactionManagerInstance) return this.transactionManagerInstance

    this.logger.info('Transaction manager not created. Using async transaction provider')
    this.transactionManagerInstance = await this.docTxManagerProvider()
    return Promise.resolve(this.transactionManagerInstance)
  }

  private parseRegexp(query?: string): RegExp {
    if (!query) return null
    try {
      return new RegExp(query)
    } catch (e) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, `Invalid regex: "${query}"`)
    }
  }

  /**
   *
   * @param name Name of the file to be stored in gridfs
   * @param uploadPayload Buffer holding the contents of the file
   */
  private async saveToGridFs(name: string, uploadPayload: any) {
    const fileBuffer: Buffer = uploadPayload.file.buffer
    const fileMimeType: string = uploadPayload.file.mimetype

    return this.documentDataAgent.saveFileBuffer({
      id: undefined,
      fileName: name,
      file: fileBuffer,
      contentType: fileMimeType
    })
  }

  /**
   *
   * @param productId productId string
   * @param categoryId categoryId strnig
   * @param typeId typeId string
   * @param uploadPayload upload contents from the express request
   */
  private async buildDocumentRecord(
    productId: string,
    categoryId: string,
    typeId: string,
    documentRequest: CreateDocumentRequest,
    uploadPayload: any,
    uploaderUserId: string,
    komgoStamp: boolean
  ): Promise<IDocument> {
    const fileExt = path.extname(uploadPayload.file.originalname)

    const metadata: KeyValueRequest[] = documentRequest.metadata
    const owner: Owner = documentRequest.owner
    const name: string = documentRequest.name + fileExt

    const duplicateName: boolean = await this.documentDataAgent.existsWithName(productId, name)
    if (duplicateName) {
      throw ErrorUtils.conflictException(
        ErrorCode.ValidationHttpContent,
        'A document with the same name, product and owner already exists'
      )
    }

    const fileBuffer: Buffer = uploadPayload.file.buffer
    const content: string = fileBuffer.toString('base64')

    const docHashes = await this.calculateDocumentHashes(content, metadata)

    const documentExists: boolean = await this.documentDataAgent.existsWithMerkleRoot(productId, docHashes.merkle)
    if (documentExists) {
      throw ErrorUtils.conflictException(
        ErrorCode.ValidationHttpContent,
        'A document with the same content and metadata already exists'
      )
    }

    // Unsigned new document
    // Signing requires calling the sign endpoint
    const newDocument: IDocument = {
      id: undefined,
      context: documentRequest.context,
      name,
      productId,
      categoryId,
      typeId,
      owner,
      hash: docHashes.merkle,
      contentHash: docHashes.content,
      komgoStamp,
      registrationDate: this.clock.currentTime(),
      metadata,
      content: {
        // data to be added after gridfs returns the _id (referencing the chunks)
        fileId: '',
        signature: undefined,
        size: fileBuffer.byteLength
      },
      sharedWith: [],
      sharedBy: 'none',
      comment: documentRequest.comment,
      state: DocumentState.Pending,
      uploadInfo: {
        transactionId: this.generateTxId(),
        uploaderUserId
      }
    }

    this.logger.info('Building new unsigned document', {
      name: newDocument.name,
      context: newDocument.context,
      product: newDocument.productId,
      category: newDocument.categoryId,
      type: newDocument.typeId,
      owner: newDocument.owner
    })

    return newDocument
  }

  private generateTxId(): string {
    return new ObjectId().toHexString()
  }

  private async calculateDocumentHashes(content: string, metadata: KeyValueRequest[]): Promise<IDocumentHash> {
    const docTxManager = await this.transactionManager()
    const hashDoc: Buffer = docTxManager.hash(content)
    const hashMetadata: Buffer = docTxManager.hash(JSON.stringify(metadata))
    return {
      merkle: docTxManager.merkle([hashDoc, hashMetadata]),
      content: `0x${hashDoc.toString('hex')}`
    }
  }

  private async readFileContentFromGridFS(fileId: string): Promise<Buffer> {
    const stream: Readable = await this.documentDataAgent.getFileStream(fileId)
    return streamToBuffer(stream)
  }

  /**
   * This function returns the content (Buffer) of the PDF version of a given document.
   * We have 2 cases here:
   *  - The document contains an attribute `contentPreview` with the id of the PDF
   * already stored in mongo, in which case we will return that content.
   *  - The `contentPreview` does not exist, so we have to parse the content of the original
   * document to generate a PDF, store it in GridFS and then populate `contentPreview` in mongo. We
   * will return that content in this function.
   */
  private async getContentOfPrintableVersion(document: IFullDocument, productId: string): Promise<Buffer> {
    const attachment: Buffer = await this.readFileContentFromGridFS(document.content.fileId)
    const fileExt = getFilenameExt(document.name, false)
    const pdfMimetype = 'application/pdf'
    const pdfNewFilename = `${getFilenameWithoutExt(document.name)}.pdf`
    if (document.contentPreview) {
      // The PDF version already exists in mongo
      return this.readFileContentFromGridFS(document.contentPreview.fileId)
    } else if (isParseableToPDF(fileExt)) {
      // We need to generate the PDF for first time and store it in mongo
      const parser = new FileParserToPDF('libreoffice')
      const pdfBuffer = await parser.generate(attachment, fileExt, '.')
      // We have parsed the document into PDF, so we need to store it in GridFS
      const idNewPDFGenerated: string = await this.storeFileInGridFS(pdfNewFilename, pdfBuffer, pdfMimetype)
      const docToUpdate: IDocument = await this.documentDataAgent.getBareById(productId, document.id)
      // We need to update the IFullDocument document in mongo so its `contentPreview` field points to this new stored PDF file
      docToUpdate.contentPreview = { fileId: idNewPDFGenerated, size: pdfBuffer.byteLength }
      this.logger.info('Updating document to store the PDF version of it')
      await this.documentDataAgent.update(productId, docToUpdate)
      return pdfBuffer
    }
  }

  private async addSharedInfo(fullDocs: IFullDocumentResponse[], productId: string): Promise<IFullDocumentResponse[]> {
    for (const [i, fullDoc] of fullDocs.entries()) {
      if (fullDoc.sharedBy) {
        // The document has been shared with us, so it contains sharing info
        try {
          const sharedInfo = await this.receivedDocumentsService.getSharedInfo(productId, fullDoc.id)
          fullDocs[i].sharedInfo = sharedInfo
        } catch (error) {
          this.logger.warn(
            ErrorCode.DatabaseInvalidData,
            ErrorName.DocumentSharedInfoError,
            'Error loading the sharedInfo of the document',
            { documentId: fullDoc.id, errorMessage: error.message }
          )
        }
      }
    }
    return fullDocs
  }
}
