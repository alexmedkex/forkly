import { injectable } from 'inversify'

import { IIncomingRequest, IncomingRequest } from '../models/incoming-request'
import { IDismissedDocumentType } from '../models/incoming-request/IDismissedDocumentType'
import { IFullIncomingRequest } from '../models/incoming-request/IFullIncomingRequest'

import { BaseDataAgent } from './BaseDataAgent'
import { POPULATE_DOCUMENTS, POPULATE_PRODUCT, POPULATE_TYPES } from './population'

/**
 * Implements document object related methods for received document requests
 * @exports
 * @class IncomingRequestDataAgent
 */
@injectable()
export default class IncomingRequestDataAgent extends BaseDataAgent<IIncomingRequest, IFullIncomingRequest> {
  constructor() {
    super(IncomingRequest, [POPULATE_PRODUCT, POPULATE_TYPES, POPULATE_DOCUMENTS])
  }

  /**
   *
   * @param productId
   * @param id
   * @param documentType
   */
  public async dismissDocumentType(
    productId: string,
    id: string,
    dismissedDocumentType: IDismissedDocumentType
  ): Promise<IFullIncomingRequest> {
    await this.findAndUpdate(productId, id, { $push: { dismissedTypes: dismissedDocumentType } })
    return this.getById(productId, id)
  }
}
