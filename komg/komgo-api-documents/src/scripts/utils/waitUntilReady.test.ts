import { iocContainer } from '../../inversify/ioc'
import { HealthController } from '../../service-layer/controllers/HealthController'

import { waitUntilReady } from './waitUntilReady'

describe('waitUntilReady', () => {
  let controllerMock

  beforeEach(() => {
    controllerMock = {
      Ready: jest.fn()
    }
    iocContainer.rebind(HealthController).toConstantValue(controllerMock)
  })

  it('should call controller.Ready', async () => {
    await waitUntilReady()

    expect(controllerMock.Ready).toHaveBeenCalledWith()
  })

  it('should throw error if max retries reached', async () => {
    controllerMock.Ready.mockImplementation(() => Promise.reject('Oops'))
    await expect(waitUntilReady(5, 1)).rejects.toEqual(
      new Error('Max retries reached while waiting for service readiness')
    )
  })

  it('should call controller.Ready 4 times', async () => {
    controllerMock.Ready.mockRejectedValueOnce('Oops')
      .mockRejectedValueOnce('Oops')
      .mockRejectedValueOnce('Oops')

    await waitUntilReady(5, 1)

    expect(controllerMock.Ready).toHaveBeenCalledTimes(4)
  })
})
