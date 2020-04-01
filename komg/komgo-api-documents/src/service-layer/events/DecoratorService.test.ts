import 'reflect-metadata'

import DecoratorService from './DecoratorService'
import IService from './IService'

const mockCacheEventService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

describe('Decorator service', () => {
  let service: DecoratorService

  beforeEach(() => {
    service = new DecoratorService(mockCacheEventService)
  })

  it('should start all services', async () => {
    service.start()

    expect(mockCacheEventService.start).toHaveBeenCalledTimes(1)
  })

  it('should start all services', async () => {
    service.stop()

    expect(mockCacheEventService.stop).toHaveBeenCalledTimes(1)
  })
})
