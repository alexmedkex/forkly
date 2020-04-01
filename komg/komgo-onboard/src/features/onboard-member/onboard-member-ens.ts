import { KomgoEntity } from '../../entities'
import { logger } from '../../utils'
import { Web3Wrapper } from '@komgo/blockchain-access'
import { Config } from '../../config'
import { plainToClass } from 'class-transformer'
import { v4 as uuid4 } from 'uuid'
import { ContractArtifacts } from '../../utils/contract-artifacts'
import * as web3Utils from 'web3-utils'
import * as namehash from 'eth-ens-namehash'
import { validateAll } from './validate-input'
import { VaktOnlyKomgoEntity } from '../../entities/vakt-only-komgo-entity'

let contractArtifacts
let props

export const onboardMemberENS = async (config: Config, jsonFileName: string) => {
  contractArtifacts = new ContractArtifacts(config)
  const fromAddress = (await Web3Wrapper.web3Instance.eth.getAccounts())[0]
  props = {
    from: fromAddress || config.get('ens.from'),
    gas: config.get('ens.gas')
  }

  const komgoOnboarderInstance = await contractArtifacts.komgoOnboarder()

  const vaktOnly: boolean = !!config.get('ens.vaktonly')

  const jsonInput = vaktOnly ? await validateAll(jsonFileName, true) : await validateAll(jsonFileName)

  const companyInformationArray = []
  for (const element of jsonInput) {
    const companyName = element.x500Name.CN
    let companyInformation
    let companyInformationFormatted
    companyInformation = vaktOnly
      ? await generateCompanyInformationOnlyVakt(element, companyName, config)
      : await generateCompanyInformation(element, companyName, config)
    companyInformationFormatted = formatCompanyInformation(companyInformation)
    companyInformationArray.push(companyInformationFormatted)
  }

  try {
    logger.info('Sending transaction to onboard companies...')
    await komgoOnboarderInstance.methods.addCompaniesOnboardingInformation(companyInformationArray).send(props)
    logger.info('ENS onboarding completed successfully.')
  } catch (error) {
    logger.error('Error posting in the ENS', error)
    process.exit(1)
  }
}

function formatCompanyInformation(companyInformation: any) {
  const formatted: any = {
    staticIdHashed: companyInformation.staticIdHashed,
    textEntries: companyInformation.textEntries
  }

  formatted.ethPubKey = companyInformation.ethPubKey || {
    publicKey: {
      x: '0x0000000000000000000000000000000000000000000000000000000000000000',
      y: '0x0000000000000000000000000000000000000000000000000000000000000000'
    },
    termDate: 0,
    isEmpty: true
  }

  formatted.komgoMessagingPubKey = companyInformation.komgoMessagingPubKey || {
    key: '',
    termDate: 0,
    isEmpty: true
  }

  formatted.vaktMessagingPubKey = companyInformation.vaktMessagingPubKey || {
    key: '',
    termDate: 0,
    isEmpty: true
  }

  return formatted
}

async function generateCompanyInformation(element: any, companyName: string, config: Config) {
  const komgoEntity = plainToClass(KomgoEntity, element as KomgoEntity)
  logger.info(`${companyName} - JSON input file validation passed (ENS)`)

  if (!komgoEntity.staticId) {
    logger.info(`No staticId passed for ${companyName}, lets generate it...`)
    komgoEntity.staticId = uuid4()
  }

  if (komgoEntity.isMember && !komgoEntity.komgoMnid) {
    logger.error(`No komgoMnid passed for ${companyName}, lets generate it...`)
    komgoEntity.komgoMnid = uuid4()
  }

  return ENSStorage(config, komgoEntity, companyName)
}

async function generateCompanyInformationOnlyVakt(element: any, companyName: string, config: Config) {
  const komgoEntity = plainToClass(KomgoEntity, element as KomgoEntity)

  logger.info(`${companyName} - JSON input file validation passed (ENS)`)

  if (!komgoEntity.staticId) {
    logger.error(`No komgo staticId passed for ${companyName}`)
    process.exit(1)
  }

  logger.info(`Generating Vakt data in ENS for: ${companyName}`)
  return ENSStorageVaktOnly(config, komgoEntity, companyName)
}

async function ENSStorage(config: Config, komgoEntity: KomgoEntity, companyName: string) {
  logger.info(`${companyName} - From address: ${props.from}`)
  logger.info(`${companyName} - ENS address: ${config.get('ens.address')}`)

  const companyNode = namehash.hash(`${komgoEntity.staticId}.meta.komgo`)
  const textEntries = await generateTextEntries(companyNode, komgoEntity, config)

  let companyInformation: any = {
    staticIdHashed: web3Utils.soliditySha3(komgoEntity.staticId),
    textEntries
  }

  const companyKeyInformation = await ENSKeyData(komgoEntity, companyName)
  const companyVaktInformation = await ENSVaktData(komgoEntity, companyName, companyNode)

  companyInformation = {
    ...companyInformation,
    ...companyVaktInformation,
    ...companyKeyInformation
  }
  return companyInformation
}

async function generateTextEntries(companyNode: string, komgoEntity: any, config: Config) {
  const metaResolverInstance = await contractArtifacts.komgoMetaResolver()

  let textEntries: object[] = []
  const textEntriesWithoutVakt = await addTextEntries(komgoEntity, companyNode)

  if (komgoEntity.vakt) {
    let vaktStaticId
    const existingVaktId = await metaResolverInstance.methods.vaktStaticId(companyNode).call()
    logger.info(`About to set vaktStaticId, existing vaktStaticId=${existingVaktId}, isEmpty=${existingVaktId === ''}`)
    if (existingVaktId === '') {
      vaktStaticId = {
        key: 'vaktStaticId',
        value: komgoEntity.vakt.staticId
      }
    } else {
      logger.info(`vaktStaticId=${existingVaktId} was already set for node=${companyNode}, skipping step`)
    }

    const vaktMnid = {
      key: 'vaktMnid',
      value: komgoEntity.vakt.mnid
    }

    textEntries = [...textEntriesWithoutVakt, vaktMnid]

    if (vaktStaticId) {
      textEntries.push(vaktStaticId)
    }
    return textEntries
  }

  return textEntriesWithoutVakt
}

async function addTextEntries(komgoEntity, companyNode) {
  const metaResolverInstance = await contractArtifacts.komgoMetaResolver()
  const existingStaticId = await metaResolverInstance.methods.staticId(companyNode).call()
  const keys = [
    'staticId',
    'x500Name',
    'hasSWIFTKey',
    'isFinancialInstitution',
    'isMember',
    'isFMS',
    'komgoProducts',
    'nodeKeys',
    'komgoMnid'
  ]

  const textEntriesWithoutVakt: object[] = []
  keys.forEach(key => {
    if (key === 'staticId' && !(existingStaticId === '')) {
      logger.info(`StaticId=${existingStaticId} was already set for node=${companyNode}. Won't set staticId.`)
    } else {
      const currentValue = komgoEntity[key]
      if (currentValue !== undefined) {
        textEntriesWithoutVakt.push(getTextEntry(key, currentValue, komgoEntity))
      }
    }
  })
  return textEntriesWithoutVakt
}

function getTextEntry(key, currentValue, komgoEntity) {
  if (key === 'nodeKeys') {
    return {
      key,
      value: JSON.stringify([komgoEntity.nodeKeys])
    }
  }
  return {
    key,
    value:
      Array.isArray(currentValue) || typeof currentValue === 'object'
        ? JSON.stringify(currentValue)
        : currentValue.toString()
  }
}

async function ENSStorageVaktOnly(config: Config, komgoEntity: VaktOnlyKomgoEntity, companyName: string) {
  logger.info(`${companyName} - From address: ${props.from}`)
  logger.info(`${companyName} - ENS address: ${config.get('ens.address')}`)

  const companyNode = namehash.hash(`${komgoEntity.staticId}.meta.komgo`)

  const textEntries = []
  if (!!config.get('ens.vaktonly') && komgoEntity.vakt.mnid) {
    textEntries.push({ key: 'vaktMnid', value: komgoEntity.vakt.mnid })
  }
  if (!!config.get('ens.vaktonly') && komgoEntity.vakt.staticId) {
    textEntries.push({ key: 'vaktStaticId', value: komgoEntity.vakt.staticId })
  }

  return {
    ...(await ENSVaktData(komgoEntity, companyName, companyNode)),
    textEntries
  }
}

async function ENSKeyData(komgoEntity: KomgoEntity, companyName: string) {
  const companyInformation: any = {}
  if (komgoEntity.isMember) {
    companyInformation.komgoMessagingPubKey = {
      key: JSON.stringify(komgoEntity.messagingPublicKey.key),
      termDate: new Date(komgoEntity.messagingPublicKey.validTo).getTime(),
      isEmpty: false
    }

    let ethKey = komgoEntity.ethereumPublicKey.key
    if (!ethKey.startsWith('0x')) {
      ethKey = `0x${ethKey}`
    }
    logger.debug(`${companyName} - ETH key: ${ethKey}`)
    const first32EthKey = '0x' + ethKey.substr(2, 64)
    logger.debug(`${companyName} - first32EthKey: ${first32EthKey}`)
    const last32EthKey = '0x' + ethKey.substr(66, 128)
    logger.debug(`${companyName} - last32EthKey: ${last32EthKey}`)

    companyInformation.ethPubKey = {
      publicKey: {
        x: first32EthKey,
        y: last32EthKey
      },
      termDate: new Date(komgoEntity.ethereumPublicKey.validTo).getTime(),
      isEmpty: false
    }
  }
  return companyInformation
}

async function ENSVaktData(komgoEntity: VaktOnlyKomgoEntity, companyName: string, companyNode: string) {
  const companyInformation: any = {
    staticIdHashed: web3Utils.soliditySha3(komgoEntity.staticId)
  }
  if (komgoEntity.vakt) {
    companyInformation.vaktMessagingPubKey = {
      key: JSON.stringify(komgoEntity.vakt.messagingPublicKey.key),
      termDate: new Date(komgoEntity.vakt.messagingPublicKey.validTo).getTime(),
      isEmpty: false
    }
  }
  return companyInformation
}
