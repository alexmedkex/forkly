import { axiosRetry, exponentialDelay } from '../../retry'
import { IRegisterDocument } from './IRegisterDocument'
import * as request from 'request-promise'
import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import { IShareDocument } from './IShareDocument'
import { IDocumentRegisterResponse } from './IDocumentRegisterResponse'
import * as AxiosError from 'axios-error'
import { IReceivedDocumentsResponse } from './IReceivedDocuments'
import { ISharedDocumentsResponse } from './ISharedDocumentsResponse'
import { CONFIG } from '../../inversify/config'
import { MicroserviceConnectionException, InvalidDocumentException, DuplicateDocumentException } from '../../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

export interface IDocumentServiceClient {
  registerDocument(document: IRegisterDocument): Promise<IDocumentRegisterResponse>
  shareDocument(documentShare: IShareDocument)
  deleteDocument(productId: string, documentId: string)
  getDocumentById(productId: string, documentId: string): Promise<IDocumentRegisterResponse>
  getDocument(productId: string, typeid: string, context: any)
  getDocumentContent(productId: string, documentId: string, showPreview?: boolean)
  getDocumentTypes(productId: string)
  getDocuments(productId, context: object): Promise<IDocumentRegisterResponse[]>
  sendDocumentFeedback(productId: string, receivedDocumentsId: string): Promise<void>
  getReceivedDocuments(productId: string, context: object): Promise<IReceivedDocumentsResponse[]>
  getSendDocumentFeedback(productId: string, context: object): Promise<ISharedDocumentsResponse[]>
}

@injectable()
export class DocumentServiceClient implements IDocumentServiceClient {
  private logger = getLogger('DocumentServiceClient')
  constructor(
    @inject(CONFIG.DocumentsServiceUrl) private readonly documentServiceUrl: string | any,
    private readonly retryDelay: number = 1000
  ) {}

  async deleteDocument(productId: string, documentId: string) {
    this.logger.info('Deleting document', {
      productId,
      documentId
    })

    const url: string = `${this.documentServiceUrl}/v0/products/${productId}/documents/${documentId}`
    try {
      return axios.delete(url, {})
    } catch (err) {
      const axiosError = new AxiosError(err)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.ApiDocumentsDeleteEndpointFailed,
        axiosError.message,
        {
          productId,
          documentId
        },
        new Error().stack
      )

      throw new MicroserviceConnectionException(`Failed to delete a document.`)
    }
  }

  async registerDocument(document: IRegisterDocument): Promise<IDocumentRegisterResponse> {
    this.logger.info('Registering document', {
      documentName: document.name,
      productId: document.productId,
      categoryId: document.categoryId,
      typeId: document.typeId
    })

    const fileData = {
      value: document.documentData.buffer,
      options: {
        filename: document.documentData.originalname,
        contentType: document.documentData.mimetype
      }
    }

    const formData = {
      fileData,
      extraData: JSON.stringify({
        name: document.name,
        context: document.context,
        owner: document.owner,
        metadata: document.metadata,
        comment: document.comment
      })
    }

    let response
    try {
      response = await request.post({
        url: `${this.documentServiceUrl}/v0/products/${document.productId}/categories/${document.categoryId}/types/${
          document.typeId
        }/documents`,
        formData,
        json: true
      })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.DocumentRegistrationFailed,
        error.error.message,
        {
          documentName: document.name
        },
        new Error().stack
      )

      if (error.statusCode === 409) {
        throw new DuplicateDocumentException(error.error.message || 'Document registration failed.')
      }
      throw new MicroserviceConnectionException('Document registration failed.')
    }

    const hash = response ? response.hash : null

    this.logger.info('Registered document', { documentName: document.name, documentHash: hash })

    return response
  }

  async shareDocument(documentShare: IShareDocument) {
    const url = `${this.documentServiceUrl}/v0/products/${documentShare.productId}/send-documents/internal`

    return Promise.all(
      documentShare.companies.map(companyId => {
        this.logger.info('Sending documents', { documents: documentShare.documents.join(','), to: companyId })
        return axios
          .post(
            url,
            {
              documents: documentShare.documents,
              companyId,
              reviewNotRequired: true,
              context: documentShare.context
            },
            {}
          )
          .catch(err => {
            const axiosError = new AxiosError(err)
            this.logger.error(
              ErrorCode.ConnectionMicroservice,
              ErrorNames.ApiDocumentsSendingEndpointFailed,
              axiosError.message,
              {
                documentId: documentShare.documents.join(','),
                to: companyId
              }
            )
          })
      })
    )
  }

  async getDocumentById(productId: string, documentId: string) {
    this.logger.info('Getting document by id', { documentId })
    const url = `${this.documentServiceUrl}/v0/products/${productId}/documents/${documentId}`
    let result

    try {
      result = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetDocumentByIdFailed,
        axiosError.message,
        {
          productId,
          documentId
        },
        new Error().stack
      )
      if (error.response && error.response.status && error.response.status === 404) {
        throw new InvalidDocumentException(axiosError.message)
      }
      throw new MicroserviceConnectionException(axiosError.message)
    }

    if (!result || !result.data || result.status === 404) {
      this.logger.info('Document not found', { documentId })
      return null
    }

    return result.data
  }

  async getDocument(productId: string, typeId: string, context: any) {
    const documents = await this.getDocuments(productId, context)
    if (documents && documents.length) {
      const [document] = documents.filter(doc => doc.typeId || doc.type.id === typeId)
      return document
    }

    return null
  }

  async getDocumentContent(productId: string, documentId: string, showPreview = false) {
    this.logger.info('Getting document content', { productId, documentId })
    let url = `${this.documentServiceUrl}/v0/products/${productId}/documents/${documentId}/content`
    if (showPreview) {
      url += `?printVersion=${true}`
    }

    let result

    try {
      result = await axiosRetry(
        async () => axios.get(url, { responseType: 'arraybuffer' }),
        exponentialDelay(this.retryDelay)
      )
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetDocumentContentFailed,
        axiosError.message,
        {
          productId,
          documentId
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException(axiosError.message)
    }

    return result
  }

  async getDocuments(productId, context: object) {
    const url = `${this.documentServiceUrl}/v0/products/${productId}/documents?context=${encodeURIComponent(
      JSON.stringify(context)
    )}`

    let result
    try {
      result = await axiosRetry(async () => axios.get(url), exponentialDelay(this.retryDelay))
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetDocumentsFailed,
        axiosError.message,
        {
          productId,
          ...context
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException(`Failed to get documents.`)
    }

    if (result && result.data && result.data.length) {
      return result.data
    }

    this.logger.info('Could not find documents', { productId, ...context })
    return null
  }

  async getDocumentTypes(productId: string) {
    const url = `${this.documentServiceUrl}/v0/products/${productId}/types`

    const result = await axios.get(url)

    if (result && result.data && result.data.length) {
      return result.data
    }

    this.logger.info('Could not find document types', { productId })
    return null
  }

  async sendDocumentFeedback(productId: string, receivedDocumentsId: string): Promise<void> {
    try {
      const url = `${
        this.documentServiceUrl
      }/v0/products/${productId}/received-documents/${receivedDocumentsId}/send-feedback`
      await axiosRetry(async () => axios.post(url), exponentialDelay(this.retryDelay))
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.ApiDocumentsSendFeedbackFailed,
        axiosError.message,
        {
          productId,
          receivedDocumentsId
        }
      )
      throw new MicroserviceConnectionException(`Failed to send feedback document content.`)
    }
  }

  async getReceivedDocuments(productId: string, context: object): Promise<IReceivedDocumentsResponse[]> {
    const url = `${this.documentServiceUrl}/v0/products/${productId}/received-documents?context=${encodeURIComponent(
      JSON.stringify(context)
    )}`

    let result
    try {
      result = await axiosRetry(
        async () => axios.get<IReceivedDocumentsResponse[]>(url),
        exponentialDelay(this.retryDelay)
      )
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.LCPresentationGetReceivedDocumentsFailed,
        axiosError.message,
        {
          productId
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException(`Failed to send feedback document content.`)
    }
    if (result && result.data && result.data.length) {
      return result.data
    }
    return null
  }

  async getSendDocumentFeedback(productId: string, context: object): Promise<ISharedDocumentsResponse[]> {
    try {
      const url = `${this.documentServiceUrl}/v0/products/${productId}/send-documents?context=${encodeURIComponent(
        JSON.stringify(context)
      )}`
      const result = await axiosRetry(
        async () => axios.get<ISharedDocumentsResponse[]>(url),
        exponentialDelay(this.retryDelay)
      )
      if (result && result.data && result.data.length) {
        return result.data
      }

      return null
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.ApiDocumentsGetFeedbackFailed,
        axiosError.message,
        {
          productId
        }
      )
      throw new MicroserviceConnectionException(`Failed to send feedback document content.`)
    }
  }
}
