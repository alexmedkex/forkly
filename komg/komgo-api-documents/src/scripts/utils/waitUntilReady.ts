import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import { iocContainer } from '../../inversify/ioc'
import { HealthController } from '../../service-layer/controllers/HealthController'
import { ErrorName } from '../../utils/ErrorName'
import { sleep } from '../../utils/sleep'

const logger = getLogger('waitUntilReady')

export const waitUntilReady = async (maxRetries = 100, retryTimeout = 3e3) => {
  const controller = iocContainer.get<HealthController>(HealthController)
  let retry = 0
  while (maxRetries > retry) {
    try {
      await controller.Ready()
      return
    } catch (e) {
      retry++
      logger.warn(
        ErrorCode.Connection,
        ErrorName.DependenciesAreNotReadyError,
        `Dependencies are not ready. Retry ${retry} of ${maxRetries}`,
        { error: e }
      )
      await sleep(retryTimeout)
    }
  }

  throw new Error('Max retries reached while waiting for service readiness')
}
