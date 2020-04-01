import { KomgoEntity, MessagePublicKeyEntity, EthPublicKeyEntity } from '../../entities'
import { logger } from '../../utils'
import axios from 'axios'
import { axiosRetry, exponentialDelay } from '../../utils/retry'
import { Config } from '../../config'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import querystring from 'querystring'
import { getKeycloakToken } from './keycloak-integration'
import { validateAll, validation } from './validate-input'

const keysSignerUrlProp = 'keys.signer.url'
const keysBlockchainSignerUrlProp = 'keys.blockchainsigner.url'
const keycloakUrlProp = 'keycloak.url'

export const onboardMemberKeys = async (
  config: Config,
  jsonFileName: string,
  apiSignerURL: string,
  apiBlockchainSignerURL: string,
  retrieveOnly: boolean = false
) => {
  const signerURL: string = apiSignerURL || config.get(keysSignerUrlProp)
  const blockchainSignerURL: string = apiBlockchainSignerURL || config.get(keysBlockchainSignerUrlProp)
  const komgoEntity: KomgoEntity[] = []
  const jsonInput = await validateAll(jsonFileName)
  const promises = jsonInput.map(async element => {
    // We retrieve the companyName for logging purposes
    const companyName = element.x500Name.CN
    komgoEntity.push(
      await onboardMemberKeysElement(element, companyName, signerURL, blockchainSignerURL, config, retrieveOnly)
    )
  })
  await Promise.all(promises)

  return komgoEntity
}

async function onboardMemberKeysElement(
  element: any,
  companyName: string,
  apiSignerURL: string,
  apiBlockchainSignerURL: string,
  config: Config,
  retrieveOnly: boolean = false
) {
  const komgoEntity = plainToClass(KomgoEntity, element as KomgoEntity)

  logger.info(`${companyName} - JSON input file validation passed (keys)`)

  logger.info(`Getting keys for ${companyName}`)
  try {
    await keysStorage(config, komgoEntity, companyName, apiSignerURL, apiBlockchainSignerURL, retrieveOnly)
  } catch (error) {
    logger.error('Error calling the API signer', error.message)
    process.exit(1)
  }

  return komgoEntity
}

async function keysStorage(
  config: Config,
  komgoEntity: KomgoEntity,
  companyName: string,
  apiSignerURL: string,
  apiBlockchainSignerURL: string,
  retrieveOnly: boolean = false
) {
  let publicKey: MessagePublicKeyEntity
  let ethPublicKey: EthPublicKeyEntity

  if (retrieveOnly) {
    // GET public RSA key
    publicKey = await getMessagingKey(config, apiSignerURL)
    logger.info(`${companyName} - Messaging public key retrieved`)
    // GET public Ethereum key
    ethPublicKey = await getEthereumKey(config, apiBlockchainSignerURL)
    logger.info(`${companyName} - Ethereum public key retrieved`)
  } else {
    // SET RSA key
    publicKey = await setMessagingKey(config, komgoEntity, apiSignerURL)
    logger.info(`${companyName} - Messaging private key posted`)
    // SET Ethereum key
    ethPublicKey = await setEthereumKey(config, komgoEntity, apiBlockchainSignerURL)
    logger.info(`${companyName} - Ethereum private key posted`)
  }

  if (config.get('keys.enabled')) {
    // TODO: This is getting current time for now
    const currentDate = new Date()
    publicKey.validFrom = currentDate.toISOString()
    ethPublicKey.validFrom = currentDate.toISOString()
    currentDate.setDate(currentDate.getDate() + 365)
    ethPublicKey.validTo = currentDate.toISOString()
    publicKey.validTo = currentDate.toISOString()
    komgoEntity.messagingPublicKey = publicKey
    komgoEntity.ethereumPublicKey = ethPublicKey
  }
}

async function setMessagingKey(
  config: Config,
  komgoEntity: KomgoEntity,
  apiSignerURL: string
): Promise<MessagePublicKeyEntity> {
  const signerURL: string = apiSignerURL || config.get(keysSignerUrlProp)
  const retryDelay: number = config.get('delay')
  let signerInput
  if (komgoEntity.QAOnly) {
    signerInput = {
      key: komgoEntity.QAOnly.QAPrivateMessagingKey
    }
  }

  const publicKeyReturn = await axiosRetry(
    async () => axios.post(`${signerURL}/v0/key-manage/rsa`, signerInput),
    exponentialDelay(retryDelay)
  )

  if (publicKeyReturn.status !== 200) {
    logger.error('Error calling api-signer to POST the RSA private key')
    process.exit(1)
  }

  const publicKey = new MessagePublicKeyEntity()
  publicKey.key = publicKeyReturn.data

  return publicKey
}

async function getMessagingKey(config: Config, apiSignerURL: string): Promise<MessagePublicKeyEntity> {
  const signerURL: string = apiSignerURL || config.get(keysSignerUrlProp)
  const kcURL: string = config.get(keycloakUrlProp)
  const retryDelay: number = config.get('delay')

  const headers = await getKeycloakToken(config, kcURL, retryDelay)

  const publicKeyReturn = await axiosRetry(
    async () => axios.get(`${signerURL}/v0/key-manage/rsa/public-key`, headers),
    exponentialDelay(retryDelay)
  )

  if (publicKeyReturn.status !== 200) {
    logger.error('Error calling api-signer to GET the RSA private key')
    process.exit(1)
  }

  const publicKey = new MessagePublicKeyEntity()
  publicKey.key = publicKeyReturn.data

  return publicKey
}

async function setEthereumKey(
  config: Config,
  komgoEntity: KomgoEntity,
  apiBlockchainSignerURL: string
): Promise<EthPublicKeyEntity> {
  const signerURL: string = apiBlockchainSignerURL || config.get(keysBlockchainSignerUrlProp)
  const retryDelay: number = config.get('delay')
  let signerInput
  if (komgoEntity.QAOnly) {
    signerInput = {
      key: komgoEntity.QAOnly.QAEthereumPrivateKey
    }
  }

  const ethPublicKeyReturn = await axiosRetry(
    async () => axios.post(`${signerURL}/v0/key-manage/eth`, signerInput),
    exponentialDelay(retryDelay)
  )

  if (ethPublicKeyReturn.status !== 200) {
    logger.error('Error calling api-signer to POST the Ethereum private key')
    process.exit(1)
  }

  // TODO adapt signer to have the last data + dates
  const ethPublicKey = new EthPublicKeyEntity()
  ethPublicKey.key = ethPublicKeyReturn.data.publicKey
  ethPublicKey.keyCompressed = ethPublicKeyReturn.data.publicKeyCompressed
  ethPublicKey.address = ethPublicKeyReturn.data.address

  return ethPublicKey
}

async function getEthereumKey(config: Config, apiBlockchainSignerURL: string): Promise<EthPublicKeyEntity> {
  const signerURL: string = apiBlockchainSignerURL || config.get(keysBlockchainSignerUrlProp)
  const kcURL: string = config.get(keycloakUrlProp)
  const retryDelay: number = config.get('delay')

  const headers = await getKeycloakToken(config, kcURL, retryDelay)

  const ethPublicKeyReturn = await axiosRetry(
    async () => axios.get(`${signerURL}/v0/key-manage/eth/public-key`, headers),
    exponentialDelay(retryDelay)
  )

  if (ethPublicKeyReturn.status !== 200) {
    logger.error('Error calling api-signer to GET the Ethereum private key')
    process.exit(1)
  }

  // TODO adapt signer to have the last data + dates
  const ethPublicKey = new EthPublicKeyEntity()
  ethPublicKey.key = ethPublicKeyReturn.data.publicKey
  ethPublicKey.keyCompressed = ethPublicKeyReturn.data.publicKeyCompressed
  ethPublicKey.address = ethPublicKeyReturn.data.address

  return ethPublicKey
}
