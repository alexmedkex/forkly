import { inject, injectable } from 'inversify'
import * as mongoose from 'mongoose'
import { Readable } from 'stream'

import { TYPES } from '../../inversify/types'
import { DocumentTemplate } from '../models/document-template'

import GridFsWrapper from './GridFsWrapper'
import IFileBuffer from './interfaces/IFileBuffer'
import { handleRecordUpsert } from './utils'

/**
 * Implements document object related methods for document types
 * @export
 * @class DocumentDataAgent
 */
@injectable()
export default class DocumentTemplateDataAgent {
  private readonly model: mongoose.Model<mongoose.Document> = DocumentTemplate

  constructor(@inject(TYPES.GridFsWrapper) private readonly gridFs: GridFsWrapper) {}

  async saveFileBuffer(fileBuffer: IFileBuffer): Promise<string> {
    return this.gridFs.saveFileBuffer(fileBuffer)
  }

  async deleteFile(name: string): Promise<void> {
    return this.gridFs.deleteFile(name)
  }

  async getFileStream(fileId: string): Promise<Readable> {
    return this.gridFs.getFileStream(fileId)
  }

  async getFileBuffer(fileId: string): Promise<Buffer> {
    return this.gridFs.getFileBuffer(fileId)
  }

  async getFileContentType(fileId: string): Promise<string> {
    return this.gridFs.getFileContentType(fileId)
  }

  /**
   * Create a new mongoDB record corresponding to a file
   *
   * @param record object representing a document in mongo
   */
  async create(record: any): Promise<any> {
    return handleRecordUpsert(this.model.create({
      ...(record as object)
    }) as Promise<any>)
  }

  /**
   * Retrieve a document from mongo
   *
   * @param id represents an ID in the database
   */
  async getById(id: string): Promise<any> {
    return this.model.findOne({ _id: id }).exec()
  }
}
