import { inject, injectable } from 'inversify'
import { Readable } from 'stream'

import { TYPES } from '../../inversify/types'
import { DocumentState } from '../models/ActionStates'
import { Document, IDocument } from '../models/document'
import { IFullDocument } from '../models/document/IFullDocument'

import { BaseDataAgent } from './BaseDataAgent'
import InvalidOperation from './exceptions/InvalidOperation'
import GridFsWrapper from './GridFsWrapper'
import IFileBuffer from './interfaces/IFileBuffer'
import { POPULATE_FULL_CATEGORY, POPULATE_PRODUCT, POPULATE_TYPE } from './population'
import { flattenFieldQuery } from './query-utils'

/**
 * Implements document object related methods for document types
 * @export
 * @class DocumentDataAgent
 */
@injectable()
export default class DocumentDataAgent extends BaseDataAgent<IDocument, IFullDocument> {
  constructor(@inject(TYPES.GridFsWrapper) private readonly gridFs: GridFsWrapper) {
    super(Document, [POPULATE_PRODUCT, POPULATE_FULL_CATEGORY, POPULATE_TYPE])
  }

  async saveFileBuffer(fileBuffer: IFileBuffer): Promise<string> {
    return this.gridFs.saveFileBuffer(fileBuffer)
  }

  async deleteFile(name: string): Promise<void> {
    return this.gridFs.deleteFile(name)
  }

  async getFileBuffer(fileId: string): Promise<Buffer> {
    return this.gridFs.getFileBuffer(fileId)
  }

  async getFileStream(fileId: string): Promise<Readable> {
    return this.gridFs.getFileStream(fileId)
  }

  async getFileContentType(fileId: string): Promise<string> {
    return this.gridFs.getFileContentType(fileId)
  }

  async getFileLength(fileId: string): Promise<number> {
    return this.gridFs.getFileLength(fileId)
  }

  async getByName(productId: string, name: string): Promise<IFullDocument> {
    return this.populateOne(Document.findOne({ productId, name }))
  }

  async getByMerkleRoot(productId: string, merkleHash: string): Promise<IFullDocument> {
    return this.populateOne(Document.findOne({ productId, hash: merkleHash }))
  }

  async getBareByTransactionId(transactionId: string): Promise<IDocument> {
    return Document.findOne({ 'uploadInfo.transactionId': transactionId })
  }

  async getAllWithContext(
    productId: string,
    sharedBy?: string,
    context?: object,
    regexp?: RegExp
  ): Promise<IFullDocument[]> {
    const conditions: any = { productId }
    if (sharedBy) {
      conditions.sharedBy = sharedBy
    }
    if (regexp) {
      conditions.name = { $regex: regexp, $options: 'i' }
    }
    return this.getDocuments({
      ...conditions,
      ...flattenFieldQuery(context, 'context')
    })
  }

  async getDocuments(conditions: any = {}): Promise<IFullDocument[]> {
    return this.populateMany(Document.find(conditions))
  }

  /**
   * It will add a new entry in the sharedWith array for the counterparty passed as first parameter and fail in case it already exists.
   * If the counterparty already exists in the array, it returns undefined so you will have to use findAndUpdate function to update
   * that specific field
   */
  async shareDocumentsWithNewCounterparty(
    sharedWithCounterpartyId: string,
    productId: string,
    id: string,
    update: object
  ): Promise<IFullDocument> {
    const result = this.model.findOneAndUpdate(
      {
        productId,
        _id: id,
        'sharedWith.counterpartyId': {
          $not: new RegExp(sharedWithCounterpartyId)
        } /* In case the counterpartyId
        doesnt exists yet in the array of sharedWith, I fail the operation */
      },
      {
        ...update,
        $inc: { __v: 1 } // Increment Mongoose version field
      },
      {
        new: true // Return updated version of the record
      }
    )

    return (result as unknown) as IFullDocument
  }

  /**
   *  Updates state of document
   *
   * @param productId - product id
   * @param id - document id
   * @param newState - string representing state (@see ActionStates.PENDING,ActionStates.CONFIRMED,ActionStates.FAILED)
   */
  async updateDocumentState(productId: string, id: string, newState: DocumentState): Promise<IDocument> {
    const document: IDocument = await this.getBareById(productId, id)

    // TODO: We should move all conditions and data checks to a layer above our data agent
    // We should also not expose CRUD operations from our data agent directly to our business logic
    if (document.state !== DocumentState.Pending) {
      throw new InvalidOperation(`Document state already set as : ${document.state}`)
    }

    if (newState !== DocumentState.Registered && newState !== DocumentState.Failed) {
      throw new InvalidOperation(`Not a valid state to set in document`)
    }

    document.state = newState
    return this.update(productId, document)
  }

  async updateDownloadByUser(productId: string, id: string, newDownloaderId: string): Promise<IDocument> {
    return Document.findOneAndUpdate(
      { productId, _id: id, 'downloadInfo.downloadedByUsers': { $nin: [newDownloaderId] } },
      {
        $push: { 'downloadInfo.downloadedByUsers': newDownloaderId }
      },
      {
        new: true
      }
    ).exec()
  }

  async existsWithName(productId: string, name: string): Promise<boolean> {
    const document = await this.getByName(productId, name)
    return document !== null
  }

  async existsWithId(productId: string, id: string): Promise<boolean> {
    const document = await this.getBareById(productId, id)
    return document !== null
  }

  async existsWithMerkleRoot(productId: string, merkleHash: string): Promise<boolean> {
    const document = await this.getByMerkleRoot(productId, merkleHash)
    return document !== null
  }

  async delete(productId: string, id: string): Promise<void> {
    const docToBeDeleted = await this.getBareById(productId, id)
    if (docToBeDeleted) {
      await this.deleteFile(docToBeDeleted.name)
    }
    return super.delete(productId, id)
  }

  async resetTransactionId(documentId: string, newTransactionId: string) {
    const result = this.model.findOneAndUpdate(
      { _id: documentId },
      { $set: { 'uploadInfo.transactionId': newTransactionId, state: DocumentState.Pending } },
      { new: true }
    )

    return (result as unknown) as Promise<IFullDocument>
  }
}
