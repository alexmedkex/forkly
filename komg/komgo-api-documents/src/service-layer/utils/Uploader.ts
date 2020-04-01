import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import * as express from 'express'
import { injectable } from 'inversify'
import * as multer from 'multer'

import { ErrorName } from '../../utils/ErrorName'

const FILE_DATA = 'fileData'

@injectable()
export default class Uploader {
  private readonly logger = getLogger('Uploader')

  constructor(fieldName: string = FILE_DATA, private readonly multerSingle: any = multer().single(fieldName)) {}

  async upload(request: express.Request): Promise<any> {
    try {
      return await this.uploadSingleFile(request)
    } catch (uploadError) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.UploadTemplateError, 'Error uploading a template', {
        errorMessage: uploadError.message
      })
      throw ErrorUtils.noContentException(ErrorCode.ValidationHttpContent, 'Failed to handle upload')
    }
  }

  async uploadSingleFile(request: express.Request): Promise<any> {
    return new Promise((resolve, reject) => {
      this.multerSingle(request, undefined, async error => {
        if (error) {
          reject(error)
        }
        resolve(request)
      })
    })
  }
}
