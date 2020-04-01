import 'reflect-metadata'

import DecoratorService from './DecoratorService'
import IService from './IService'

const mockInternalToCommonService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}
const mockCommonToInternalService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

describe('DecoratorService', () => {
  let service: DecoratorService

  beforeEach(() => {
    service = new DecoratorService(mockCommonToInternalService, mockInternalToCommonService)
  })

  it('should start all services', async () => {
    service.start()

    expect(mockInternalToCommonService.start).toHaveBeenCalledTimes(1)
    expect(mockCommonToInternalService.start).toHaveBeenCalledTimes(1)
  })

  it('should stop all services', async () => {
    service.stop()

    expect(mockInternalToCommonService.stop).toHaveBeenCalledTimes(1)
    expect(mockCommonToInternalService.stop).toHaveBeenCalledTimes(1)
  })
})
