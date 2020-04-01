// import { PrivateKey } from 'web3'
import { Web3Wrapper } from '@komgo/blockchain-access'
import { Config } from '../../config'
import { logger } from '../../utils'

export const onboardFunding = async (config: Config, key, passphrase: string) => {
  // Connecting provider:
  logger.info('Connecting provider...')
  const web3 = Web3Wrapper.web3Instance

  // Decrypting key:
  logger.info('Decrypting key...')
  const pair = web3.eth.accounts.decrypt(key, passphrase)

  // Importing key:
  logger.info('Importing key...')
  web3.eth.personal.importRawKey(pair.privateKey, passphrase)

  // Output:
  logger.info('Import was finished. Public key: ' + pair.address)
}
