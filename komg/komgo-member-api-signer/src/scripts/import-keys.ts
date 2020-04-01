import DataAccess from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import logger from '@komgo/logging'
import config from 'config'
import fs from 'fs'

import CompanyKeyProvider from '../business-layer/key-management/CompanyKeyProvider'
import KeyInitializer from '../business-layer/key-management/KeyInitializer'
import { RsaKeyManager } from '../business-layer/key-management/RsaKeyManager'
import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'
import { ErrorName } from '../middleware/common/Constants'

const inputFileName = 'keyfiles.json'
const outputFileName = 'currentPubKeys.json'

const run = async () => {
  // connect to MongoDB
  DataAccess.setUrl(config.get('mongo.url').toString())
  DataAccess.connect()

  const keyInitializer = new KeyInitializer(
    iocContainer.get<CompanyKeyProvider>(TYPES.CompanyKeyProvider),
    iocContainer.get<RsaKeyManager>(TYPES.RsaKeyManager)
  )

  if (fs.existsSync(inputFileName)) {
    let privKeys
    try {
      const inputFileContent = fs.readFileSync(inputFileName)
      privKeys = JSON.parse(inputFileContent.toString('utf8'))
    } catch (e) {
      logger.error(
        ErrorCode.ConfigurationOnbording,
        ErrorName.InitKeyDataInvalidFile,
        `Invalid ${inputFileName}. ${e.message}`
      )
      process.exit(1)
    }

    await keyInitializer.import(privKeys.komgoMessagingKey)
  } else {
    await keyInitializer.import()
  }

  await keyInitializer.writePublicKeysToFile(outputFileName)

  process.exit(0)
}

run()
