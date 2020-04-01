import { injectable } from 'inversify'

import { IFullReceivedDocuments, IReceivedDocuments } from '../models/received-documents'
import { ReceivedDocuments } from '../models/received-documents/ReceivedDocuments'

import { BaseDataAgent } from './BaseDataAgent'
import { POPULATE_PRODUCT, POPULATE_OUTGOING_REQUEST, POPULATE_DOCUMENT_REVIEWS } from './population'
import { flattenFieldQuery } from './query-utils'

/**
 * Implements document object related methods for document received from other KOMGO nodes.
 * @export
 * @class ReceivedDocumentsDataAgent
 */
@injectable()
export default class ReceivedDocumentsDataAgent extends BaseDataAgent<IReceivedDocuments, IFullReceivedDocuments> {
  constructor() {
    super(ReceivedDocuments, [POPULATE_PRODUCT, POPULATE_OUTGOING_REQUEST, POPULATE_DOCUMENT_REVIEWS])
  }

  async getAllWithContext(productId: string, context?: object): Promise<IFullReceivedDocuments[]> {
    return this.populateMany(
      ReceivedDocuments.find({
        productId,
        ...flattenFieldQuery(context, 'context')
      })
    )
  }

  async getAllByDocumentIdDesc(productId: string, documentId: string): Promise<IFullReceivedDocuments[]> {
    return this.populateMany(
      ReceivedDocuments.find({
        'documents.documentId': documentId,
        productId
      }).sort({
        createdAt: -1
      })
    )
  }

  async getAllBareByRequestId(productId: string, requestId: string): Promise<IReceivedDocuments[]> {
    return ReceivedDocuments.find({
      requestId,
      productId
    })
  }
}
