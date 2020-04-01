import * as express from 'express'
import * as multer from 'multer'
import { injectable } from 'inversify'

import { getLogger } from '@komgo/logging'
import { IMultipartData } from '../requests/IMultipartData'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

const FILE_DATA = 'fileData'

@injectable()
export default class Uploader {
  private logger = getLogger('Uploader')
  constructor(fieldName: string = FILE_DATA, private readonly multerSingle: any = multer().single(fieldName)) {}

  async resolveMultipartData<TData>(request: express.Request, dataKey: string): Promise<IMultipartData<TData>> {
    try {
      const parsedRequest = await this.parseWithSingleFile(request)
      const extraDataRequest = parsedRequest.body[dataKey] || '{}'
      const extraData = JSON.parse(extraDataRequest) as TData
      return {
        file: parsedRequest.file,
        data: extraData
      }
    } catch (uploadError) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorNames.UploadFailed, uploadError.message)
      throw uploadError
    }
  }

  async parseWithSingleFile(request: express.Request): Promise<any> {
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
