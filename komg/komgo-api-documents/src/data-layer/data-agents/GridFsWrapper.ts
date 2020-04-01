import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import { Readable, Stream } from 'stream'

import { TYPES } from '../../inversify/types'

import ItemNotFound from './exceptions/ItemNotFound'
import IFileBuffer from './interfaces/IFileBuffer'
import { bufferToStream } from './utils'

/**
 * A wrapper around the GridFs instance to promisify it's API for mongo access
 *
 * @export
 * @class GridFsWrapper
 */
@injectable()
export default class GridFsWrapper {
  private readonly logger = getLogger('GridFsWrapper')

  private gridFsInstance

  constructor(@inject(TYPES.GridFsProvider) private readonly gridFsProvider: () => Promise<any>) {}

  /**
   * Save a file as Buffer to GridFs
   *
   * @param fileName Name of the file
   * @param file Binary contents
   * @param contentType e.g. application/pdf
   *
   * @returns Promise that resolves to the ID of file created
   */
  async saveFileBuffer(fileBuffer: IFileBuffer): Promise<string> {
    const DocumentFile = await this.fileModel()

    return new Promise<string>((resolve, reject) => {
      const fileStream: Stream = bufferToStream(fileBuffer.file)

      DocumentFile.write(
        {
          _id: fileBuffer.id,
          filename: fileBuffer.fileName,
          contentType: fileBuffer.contentType
        },
        fileStream,
        (error, createdFile) => {
          if (error) {
            reject(error)
            return
          }

          if (!createdFile) {
            reject(new ItemNotFound(`File ${fileBuffer.id} was not found!`))
            return
          }

          resolve(createdFile._id)
        }
      )
    })
  }

  /**
   * Get a file as a buffer using its ID
   *
   * @param fileId the ID of the file in GridFs
   *
   * @returns Promise that returns to the buffer retrieved
   */
  async getFileBuffer(fileId: string): Promise<Buffer> {
    const DocumentFile = await this.fileModel()

    return new Promise<Buffer>((resolve, rejects) => {
      DocumentFile.readById(fileId, (error, buffer) => {
        if (error) {
          rejects(error)
          return
        }

        if (!buffer) {
          rejects(new ItemNotFound(`File ${fileId} was not found!`))
          return
        }

        resolve(buffer)
      })
    })
  }

  /**
   * Get a file as a stream using its ID
   *
   * @param fileId the ID of the file in GridFs
   *
   * @returns Stream from the file retrieved
   */
  async getFileStream(fileId: string): Promise<Readable> {
    const DocumentFile = await this.fileModel()

    return DocumentFile.readById(fileId)
  }

  /**
   * Get the content type of a file using its ID
   *
   * @param fileId the ID of the file in GridFs
   *
   * @returns Promise that resolves to the content-type string of the file
   */
  async getFileContentType(fileId: string): Promise<string> {
    const DocumentFile = await this.fileModel()

    return new Promise<string>((resolve, reject) => {
      DocumentFile.findOne({ _id: fileId }, (error, content) => {
        if (error) {
          reject(error)
          return
        }
        if (!content) {
          reject(new ItemNotFound(`File ${fileId} was not found!`))
          return
        }

        resolve(content.contentType)
      })
    })
  }

  async getFileLength(fileId: string): Promise<number> {
    const DocumentFile = await this.fileModel()

    return new Promise<number>((resolve, reject) => {
      DocumentFile.findOne({ _id: fileId }, (error, content) => {
        if (error) {
          reject(error)
          return
        }

        if (!content) {
          reject(new ItemNotFound(`File ${fileId} was not found!`))
          return
        }

        resolve(content.length)
      })
    })
  }

  /**
   * Remove a file from GridFs by name
   *
   * @param fileName the name of the file
   */
  async deleteFile(fileName: string): Promise<any> {
    const DocumentFile = await this.fileModel()

    return new Promise<any>((resolve, reject) => {
      DocumentFile.findOne({ filename: fileName }, (error, content) => {
        if (error) {
          reject(error)
          return
        }

        DocumentFile.unlinkById(content._id, (unlinkError, deletedFile) => {
          if (unlinkError) reject(unlinkError)

          if (!deletedFile) {
            reject(new ItemNotFound(`File ${fileName} was not found!`))
            return
          }

          resolve(deletedFile)
        })
      })
    })
  }

  /**
   * Delete a file from GridFs by ID
   *
   * @param fileId the `_id` of the file in `documents.file` collection
   */
  async deleteFileById(fileId: string): Promise<any> {
    const DocumentFile = await this.fileModel()

    return new Promise<any>((resolve, reject) => {
      DocumentFile.unlinkById(fileId, (unlinkError, deletedFile) => {
        if (unlinkError) reject(unlinkError)

        if (!deletedFile) {
          reject(new ItemNotFound(`File with ID ${fileId} was not found!`))
          return
        }

        resolve(deletedFile)
      })
    })
  }

  private async fileModel(): Promise<any> {
    const gridFs = await this.gridFs()

    return gridFs.model
  }

  private async gridFs(): Promise<any> {
    if (this.gridFsInstance) return this.gridFsInstance

    this.logger.info('Not connected to GridFS. Using async provider to connect')
    this.gridFsInstance = await this.gridFsProvider()
    return Promise.resolve(this.gridFsInstance)
  }
}
