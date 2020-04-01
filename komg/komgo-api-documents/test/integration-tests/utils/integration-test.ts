import 'jest'

import * as logger from 'winston'

import { EnvironmentInstanceHolder } from './InstanceHolder'
import { createTestInstance } from './IntegrationEnvironment'
import { TestContainer } from './TestContainer'

/**
 * Creates a test environment and hooks up it to jest's lifecycle methods.
 *
 * @param name name of a Jest test
 * @param containers a list of containers a test depends on
 * @param func a function that receives a test instance and defines normal Jest tests
 */
export function integrationTest(name: string, containers: TestContainer[], func: (EnvironmentInstanceHolder) => void) {
  logger.info('Creating test: ', name)
  describe(name, () => {
    const holder: EnvironmentInstanceHolder = new EnvironmentInstanceHolder()

    beforeAll(async () => {
      try {
        holder.instance = await createTestInstance(containers)
        logger.info(`Test "${name}" assigned port ${holder.instance.port}`)
        await holder.instance.beforeAll()
      } catch (e) {
        logger.error('Failed while creating test instance', {
          error: 'IntegrationTestsBeforeAllError',
          errorMessage: e.message,
          errorObject: e
        })
        throw e
      }
    })

    afterAll(async () => {
      await holder.instance.afterAll()
    })

    func(holder)
  })
}
