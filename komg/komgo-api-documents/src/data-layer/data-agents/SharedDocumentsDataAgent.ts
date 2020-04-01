import { injectable } from 'inversify'

import { IFullSharedDocuments, ISharedDocuments } from '../models/shared-documents'
import { SharedDocuments } from '../models/shared-documents/SharedDocuments'

import { BaseDataAgent } from './BaseDataAgent'
import { POPULATE_PRODUCT, POPULATE_DOCUMENT_FEEDBACK, POPULATE_INCOMING_REQUEST } from './population'
import { flattenFieldQuery } from './query-utils'

/**
 * Implements document object related methods for documents shared to other KOMGO nodes.
 * @export
 * @class SharedDocumentsDataAgent
 */
@injectable()
export default class SharedDocumentsDataAgent extends BaseDataAgent<ISharedDocuments, IFullSharedDocuments> {
  constructor() {
    super(SharedDocuments, [POPULATE_PRODUCT, POPULATE_DOCUMENT_FEEDBACK, POPULATE_INCOMING_REQUEST])
  }

  async getAllWithContext(productId: string, context?: object): Promise<IFullSharedDocuments[]> {
    return this.populateMany(
      SharedDocuments.find({
        productId,
        ...flattenFieldQuery(context, 'context')
      })
    )
  }

  async getAllByRequestId(productId: string, requestId: string): Promise<IFullSharedDocuments[]> {
    return this.populateMany(
      SharedDocuments.find({
        productId,
        requestId
      })
    )
  }
}
