import { injectable } from 'inversify'

import { IOutgoingRequest, OutgoingRequest } from '../models/outgoing-request'
import { IFullOutgoingRequest } from '../models/outgoing-request/IFullOutgoingRequest'

import { BaseDataAgent } from './BaseDataAgent'
import { POPULATE_DOCUMENTS, POPULATE_PRODUCT, POPULATE_TYPES } from './population'

/**
 * Implements document object related methods for document requests
 * @export
 * @class OutgoingRequestDataAgent
 */
@injectable()
export default class OutgoingRequestDataAgent extends BaseDataAgent<IOutgoingRequest, IFullOutgoingRequest> {
  constructor() {
    super(OutgoingRequest, [POPULATE_PRODUCT, POPULATE_TYPES, POPULATE_DOCUMENTS])
  }
}
