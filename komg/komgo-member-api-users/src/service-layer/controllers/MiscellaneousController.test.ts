import 'reflect-metadata'

import { MiscellaneousController } from './MiscellaneousController'

describe('MiscellaneousController', () => {
  it('throws an error', async () => {
    const controller: MiscellaneousController = new MiscellaneousController()
    await expect(controller.error500()).rejects.toEqual({
      status: 500,
      response: {
        message: 'Internal Server Error',
        origin: 'api-users'
      }
    })
  })
})
