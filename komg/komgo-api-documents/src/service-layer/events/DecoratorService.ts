import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'

import IService from './IService'

@injectable()
export default class DecoratorService implements IService {
  private services: IService[]

  constructor(@inject(TYPES.DocumentEventService) documentEventService: IService | any) {
    this.services = [documentEventService]
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
