import { CLI } from '../../cli'
import { Config } from '../../config'
import { AddressBookEntity } from '../../entities/address-book-entity'
import * as fs from 'fs'
import { onboardGenAddrBook } from '../../features'
import { logger } from '../../utils'

export const commandGenerateAddressBook = async (config: Config, cli: CLI) => {
  const [, , apiRegistryURL, keycloakURL] = cli.input

  const entries: AddressBookEntity[] = await onboardGenAddrBook(config, apiRegistryURL, keycloakURL)
  const json = JSON.stringify(
    {
      version: config.get('addressbook.version'),
      updated: new Date().toISOString(),
      entities: entries
    },
    null,
    2
  )
  const outputFileName = config.get('addressbook.outputfilename')

  fs.writeFile(outputFileName, json, function(err) {
    if (err) {
      return logger.error(`Got exception during json saving`, err)
    }
    logger.info(`Komgo address-book saved into ${outputFileName} file`)
  })
}
