import logger from '@komgo/logging'
import { injectable, inject } from 'inversify'

import {
  CommonToInternalMessageModel,
  InternalToCommonMessageModel,
  CommonBrokerMessageModel
} from '../models/CommonBrokerMessage'
import CommonBrokerSchema from '../models/CommonBrokerMessageSchema'
import { ICommonBrokerMessage } from '../models/ICommonBrokerMessage'

@injectable()
export class CommonBrokerMessageDataAgent {
  private commonToInternalMessageModel: CommonBrokerMessageModel
  private internalToCommonMessageModel: CommonBrokerMessageModel

  constructor(@inject('message-audit-write-timeout') writeTimeout: string) {
    logger.info('creating CommonBrokerMessageSchema with writeTimeout: ' + writeTimeout)
    const schema = CommonBrokerSchema(writeTimeout)
    this.commonToInternalMessageModel = CommonToInternalMessageModel(schema)
    this.internalToCommonMessageModel = InternalToCommonMessageModel(schema)
  }

  public createCommonToInternalMessage(message: ICommonBrokerMessage): Promise<CommonBrokerMessageModel> {
    return this.commonToInternalMessageModel.create(message)
  }

  public createInternalToCommonMessage(message: ICommonBrokerMessage): Promise<CommonBrokerMessageModel> {
    return this.internalToCommonMessageModel.create(message)
  }

  public findCommontoInternalMessage(attributes: any): Promise<CommonBrokerMessageModel> {
    return this.commonToInternalMessageModel.findOne(attributes)
  }

  public findInternalToCommonlMessage(attributes: any): Promise<CommonBrokerMessageModel> {
    return this.internalToCommonMessageModel.findOne(attributes)
  }
}
