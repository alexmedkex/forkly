import { inject, injectable } from 'inversify'

import { TYPES } from '../inversify/types'

import IService from './IService'

@injectable()
export default class DecoratorService implements IService {
  private services: IService[]

  constructor(
    @inject(TYPES.CommonToInternalForwardingService) commonToInternalService: IService | any,
    @inject(TYPES.InternalToCommonForwardingService) internalToCommonService: IService | any
  ) {
    this.services = [internalToCommonService, commonToInternalService]
  }

  start() {
    for (const service of this.services) {
      service.start()
    }
  }

  stop() {
    for (const service of this.services) {
      service.stop()
    }
  }
}
