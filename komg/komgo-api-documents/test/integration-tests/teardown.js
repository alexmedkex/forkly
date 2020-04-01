const fs = require('fs')
const logger = require('winston')
const { NetworkUtils, DockerUtility } = require('@komgo/integration-test-utilities')

const lockFileRegex = new RegExp('integration-tests..+.lock')

module.exports = async () => {
  if (!process.env.INTEGRATION_TESTS) {
    logger.info('Running unit tests. Skipping teardown')
    return
  }

  if (process.env.LOCAL_EXECUTION) {
    logger.info('Running integration tests locally. Skipping teardown. Do not forget to remove lock files')
    return
  }

  logger.info('Test environment teardown')
  await safeTry('test containers', DockerUtility.clearTestContainers())
  await safeTry('test network', NetworkUtils.removeTestNetwork())
  removeLocks()
}

async function safeTry(name, promise) {
  try {
    logger.info(`Trying to remove ${name}`)
    await promise
  } catch (e) {
    logger.error(`Failed to remove ${name}`, e)
  }
}

async function removeLocks() {
  fs.readdirSync('.')
    .filter(path => lockFileRegex.test(path))
    .forEach(path => {
      logger.info(`Removing lock file: ${path}`)
      fs.unlinkSync(path)
    })
}
