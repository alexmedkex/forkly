import 'reflect-metadata'

import PollingServiceFactory from './PollingServiceFactory'

const intervalMS = 100

describe('PollingServiceFactory', () => {
  let pollingFactory: PollingServiceFactory

  beforeEach(() => {
    pollingFactory = new PollingServiceFactory()
  })

  describe('createPolling', () => {
    it('should create a polling service succesfully', async () => {
      const service = await pollingFactory.createPolling(end => {
        end()
      }, intervalMS)

      expect(service.start).toBeDefined()
      expect(service.stop).toBeDefined()
    })

    it('should create a polling service succesfully and start it', async () => {
      let counter = 0
      const service = await pollingFactory.createPolling(end => {
        counter++
        end()
      }, intervalMS)

      service.start()
      expect(counter).toBe(1)
      service.stop()
    })
  })
})
