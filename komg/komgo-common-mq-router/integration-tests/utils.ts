/* tslint:disable-next-line:no-implicit-dependencies */
import { RabbitMQContainer } from '@komgo/integration-test-utilities'

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const rabbitContainer = new RabbitMQContainer()

export const startContainers = async () => {
  await rabbitContainer.start()
  await rabbitContainer.waitFor()
  await sleep(3000)
}

export const stopContainers = async () => {
  await rabbitContainer.stop()
  await rabbitContainer.delete()
}

export const logger = {
  error: jest.fn(),
  info: jest.fn()
}
