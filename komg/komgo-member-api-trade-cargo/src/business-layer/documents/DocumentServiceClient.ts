import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import { axiosRetry, exponentialDelay } from '../../retry'
import * as AxiosError from 'axios-error'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'

export interface IDocumentServiceClient {
  getDocumentTypes(productId: string, categoryId?: string)
}

@injectable()
export class DocumentServiceClient implements IDocumentServiceClient {
  private readonly logger = getLogger('DocumentServiceClient')
  private readonly retryDelay = 1000

  constructor(@inject('documentsServiceUrl') private readonly documentServiceUrl: string) {}

  async getDocumentTypes(productId: string, categoryId?: string) {
    const url = `${this.documentServiceUrl}/v0/products/${productId}/types`
    const data = categoryId ? { categoryId } : null

    let result

    try {
      result = await axiosRetry(async () => axios.get(url, { data }), exponentialDelay(this.retryDelay))
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.HttpRequestFailed,
        'Error calling the api-documents',
        {
          url,
          axiosMessage: axiosError.message,
          axiosErrorData: this.getErrorResponse(axiosError)
        }
      )

      throw new Error(`Failed to get document types. ${error.message}`)
    }

    if (result && result.data && result.data.length) {
      return result.data
    }

    this.logger.info('Could not find document types', { productId, categoryId })
    return null
  }

  private getErrorResponse(error: AxiosError) {
    if (error.response) return error.response.data
    return '<none>'
  }
}
