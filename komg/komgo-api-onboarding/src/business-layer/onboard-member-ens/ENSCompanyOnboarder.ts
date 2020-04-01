import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { allProducts } from '@komgo/products'
import { plainToClass } from 'class-transformer'
import namehash = require('eth-ens-namehash')
import { isEqual } from 'lodash'
import * as web3Utils from 'web3-utils'

import { KomgoEntity, UpdateKomgoEntity } from '../../entities'
import { IAPIRegistryCompany } from '../../infrastructure/api-registry/IAPIRegistryCompany'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ContractArtifacts } from '../../utils/contract-artifacts'

import {
  ITxProperties,
  IUpdateEthPubKey,
  IPublicKeys,
  ITextEntry,
  ICompanyInformation,
  IUpdateMessagingPubKey,
  IOnboardedCompany,
  IUpdateCompanyInfo
} from './interfaces'

@provideSingleton(ENSCompanyOnboarder)
export class ENSCompanyOnboarder {
  private metaResolverInstance
  private logger = getLogger('ENSCompanyOnboarder')
  private txProperties: ITxProperties | undefined

  constructor(
    @inject(TYPES.ContractArtifacts) private readonly contractArtifacts: ContractArtifacts,
    @inject(TYPES.EnsAddress) private readonly ensAddress,
    @inject(TYPES.Web3Wrapper) private readonly web3
  ) {}

  async onboard(companyInfo: IOnboardedCompany) {
    const komgoOnboarderInstance = await this.contractArtifacts.komgoOnboarder()

    const staticId = companyInfo.staticId
    const companyName = companyInfo.x500Name.O
    const komgoEntity = plainToClass(KomgoEntity, companyInfo)
    this.logger.info(`${companyName} - staticId: ${staticId}`)
    this.logger.info(`${companyName} - JSON input file validation passed (ENS)`)
    this.logger.info(`${companyName} - ENS address: ${this.ensAddress}`)

    const companyNode = namehash.hash(`${staticId}.meta.komgo`)

    const txProperties = await this.getTxProperties()
    const companyInformation = await this.generateCompanyInformation(komgoEntity, companyName, companyNode)
    this.logger.info(`${companyName} - Onboarding`, { companyInformation })
    await komgoOnboarderInstance.methods.addCompanyOnboardingInformation(companyInformation).send(txProperties)
    this.logger.info(`${companyName} - ENS onboarding completed successfully.`)
  }

  /**
   * Update x500Name, hasSWIFTKey, isMember, isFinancialInstitution, vakt fields in ENS
   * Doesn't update komgo messaging and ethereum keys
   */
  async update(updateCompanyInfo: IUpdateCompanyInfo, companyFromENS: IAPIRegistryCompany) {
    const staticId = updateCompanyInfo.staticId
    const companyName = updateCompanyInfo.x500Name.O
    const companyNode = namehash.hash(`${staticId}.meta.komgo`)
    const metaResolverInstance = await this.getMetaResolver()
    const existingStaticId = await metaResolverInstance.methods.staticId(companyNode).call()
    if (!existingStaticId) {
      throw ErrorUtils.notFoundException(
        ErrorCode.ValidationHttpContent,
        `Company with static ID ${staticId} wasn't found in ENS`
      )
    }
    const updateKomgoEntity = plainToClass(UpdateKomgoEntity, updateCompanyInfo)

    const textEntries = await this.generateTextEntries(companyNode, updateKomgoEntity)

    await this.updateTextEntries(companyName, companyNode, textEntries, companyFromENS)
    await this.updateVaktKeys(companyName, companyNode, updateKomgoEntity, companyFromENS)
  }

  async setDeactivated(staticId: string, isActive: boolean) {
    const txProperties = await this.getTxProperties()
    const companyNode = namehash.hash(`${staticId}.meta.komgo`)
    const komgoOnboarderInstance = await this.contractArtifacts.komgoOnboarder()
    await komgoOnboarderInstance.methods
      .addTextEntries(companyNode, [{ key: 'isDeactivated', value: JSON.stringify(!isActive) }])
      .send(txProperties)
  }

  async transferEnsNodesOwnership(node: string, address: string) {
    const txProperties = await this.getTxProperties()
    const komgoEnscontract = await this.contractArtifacts.ensRegistry()
    await komgoEnscontract.methods.setOwner(node, address).send(txProperties)
  }

  private async getMetaResolver() {
    if (!this.metaResolverInstance) {
      this.metaResolverInstance = await this.contractArtifacts.komgoMetaResolver()
    }
    return this.metaResolverInstance
  }

  private async updateVaktKeys(
    companyName: string,
    companyNode: string,
    komgoEntity: UpdateKomgoEntity,
    companyFromENS: IAPIRegistryCompany
  ) {
    if (!komgoEntity.vakt && !companyFromENS.vaktStaticId) {
      return
    }
    const komgoOnboarderInstance = await this.contractArtifacts.komgoOnboarder()
    const txProperties = await this.getTxProperties()
    const revokeVakt = companyFromENS.vaktStaticId && !komgoEntity.vakt

    const currentKeyIndex = this.getCurrentVaktMessagingKeyIndex(companyFromENS)
    if (revokeVakt) {
      this.logger.info(`${companyName} - Revoking VAKT messaging key`)
      if (currentKeyIndex === -1) {
        this.logger.info(`${companyName} - VAKT keys are empty`)
        return
      }
      this.logger.info(`${companyName} - revoked VAKT key #${currentKeyIndex}`)
      await komgoOnboarderInstance.methods.revokeVaktMessagingPublicKey(companyNode).send(txProperties)
      return
    }

    const currentVaktKey = currentKeyIndex > -1 ? companyFromENS.vaktMessagingPubKeys[currentKeyIndex].key : null
    const newVaktKey = komgoEntity.vakt && JSON.stringify(komgoEntity.vakt.messagingPublicKey.key)
    const updateVakt = currentVaktKey !== newVaktKey
    if (komgoEntity.vakt && updateVakt) {
      this.logger.info(`${companyName} - Updating VAKT keys`, { currentVaktKey, newVaktKey })
      const termDate = new Date(komgoEntity.vakt.messagingPublicKey.validTo).getTime()
      await komgoOnboarderInstance.methods
        .setVaktMessgingPublicKey(
          companyNode,
          {
            termDate,
            key: newVaktKey,
            isEmpty: false
          },
          [{ key: 'vaktMnid', value: komgoEntity.vakt.mnid }, { key: 'vaktStaticId', value: komgoEntity.vakt.staticId }]
        )
        .send(txProperties)
    }
  }

  /**
   * Returns -1 if there are no keys in ENS
   */
  private getCurrentVaktMessagingKeyIndex(companyFromENS: IAPIRegistryCompany): number {
    const vaktKeys = companyFromENS.vaktMessagingPubKeys
    for (let i = 0; i < vaktKeys.length; i++) {
      if (vaktKeys[i].current) {
        return i
      }
    }
    return -1
  }

  /**
   * Prepares a JSON object in a form which is required for the onboarding smartcontract
   */
  private async generateCompanyInformation(
    komgoEntity: KomgoEntity,
    companyName: string,
    companyNode: string
  ): Promise<ICompanyInformation> {
    const textEntries = await this.generateTextEntries(companyNode, komgoEntity)

    const companyInformation: ICompanyInformation = {
      ...(komgoEntity.isMember ? this.preparePubKeys(komgoEntity, companyName) : {}),
      vaktMessagingPubKey: komgoEntity.vakt ? this.prepareVaktPubKey(komgoEntity) : undefined,
      staticIdHashed: web3Utils.soliditySha3(komgoEntity.staticId),
      textEntries
    }
    return this.fillInEmptyPubKeys(companyInformation)
  }

  private prepareVaktPubKey(komgoEntity: KomgoEntity): IUpdateMessagingPubKey {
    return {
      key: JSON.stringify(komgoEntity.vakt.messagingPublicKey.key),
      termDate: new Date(komgoEntity.vakt.messagingPublicKey.validTo).getTime(),
      isEmpty: false
    }
  }

  private async generateTextEntries(companyNode: string, komgoEntity: UpdateKomgoEntity): Promise<ITextEntry[]> {
    const metaResolverInstance = await this.getMetaResolver()
    const existingStaticId = await metaResolverInstance.methods.staticId(companyNode).call()
    const commonKeys = ['x500Name', 'hasSWIFTKey', 'isFinancialInstitution', 'isMember', 'staticId', 'komgoMnid']
    const memberKeys = [...commonKeys, 'komgoProducts', 'nodeKeys', 'memberType']
    const keys = komgoEntity.isMember ? memberKeys : commonKeys

    // add extra data
    if (komgoEntity instanceof KomgoEntity) {
      komgoEntity.komgoProducts = allProducts
      komgoEntity.nodeKeys = JSON.stringify([komgoEntity.nodeKeys])
    }

    const textEntries: ITextEntry[] = []
    keys.forEach(key => {
      if (key === 'staticId' && existingStaticId !== '') {
        this.logger.info(`StaticId=${existingStaticId} was already set for node=${companyNode}. Won't set staticId.`)
        return
      }

      const currentValue = komgoEntity[key]
      if (currentValue === undefined) {
        return
      }

      textEntries.push({
        key,
        value: this.textEntryValueToString(currentValue)
      })
    })

    if (komgoEntity.vakt) {
      textEntries.push({ key: 'vaktStaticId', value: komgoEntity.vakt.staticId })
      textEntries.push({ key: 'vaktMnid', value: komgoEntity.vakt.mnid })
    }

    return textEntries
  }

  private preparePubKeys(komgoEntity: KomgoEntity, companyName: string): IPublicKeys {
    const komgoMessagingPubKey = {
      key: JSON.stringify(komgoEntity.messagingPublicKey.key),
      termDate: new Date(komgoEntity.messagingPublicKey.validTo).getTime(),
      isEmpty: false
    }

    let ethKey = komgoEntity.ethereumPublicKey.key
    if (!ethKey.startsWith('0x')) {
      ethKey = `0x${ethKey}`
    }

    this.logger.debug(`${companyName} - ETH key: ${ethKey}`)
    const first32EthKey = '0x' + ethKey.substr(2, 64)
    this.logger.debug(`${companyName} - first32EthKey: ${first32EthKey}`)
    const last32EthKey = '0x' + ethKey.substr(66, 128)
    this.logger.debug(`${companyName} - last32EthKey: ${last32EthKey}`)

    const ethPubKey = {
      publicKey: {
        x: first32EthKey,
        y: last32EthKey
      },
      termDate: new Date(komgoEntity.ethereumPublicKey.validTo).getTime(),
      isEmpty: false
    }

    return {
      komgoMessagingPubKey,
      ethPubKey
    }
  }

  /**
   * Fills in missing keys with zeros
   * That's needed because ENS v2 requires some values provided for the keys
   */
  private fillInEmptyPubKeys(companyInformation: ICompanyInformation): ICompanyInformation {
    const emptyEthPubKey: IUpdateEthPubKey = {
      publicKey: {
        x: '0x0000000000000000000000000000000000000000000000000000000000000000',
        y: '0x0000000000000000000000000000000000000000000000000000000000000000'
      },
      termDate: 0,
      isEmpty: true
    }

    const emptyMessagingKey: IUpdateMessagingPubKey = {
      key: '',
      termDate: 0,
      isEmpty: true
    }

    return {
      ...companyInformation,
      ethPubKey: companyInformation.ethPubKey || emptyEthPubKey,
      komgoMessagingPubKey: companyInformation.komgoMessagingPubKey || emptyMessagingKey,
      vaktMessagingPubKey: companyInformation.vaktMessagingPubKey || emptyMessagingKey
    }
  }

  private async getTxProperties(): Promise<ITxProperties> {
    if (this.txProperties) {
      return this.txProperties
    }

    const fromAddress = (await this.web3.eth.getAccounts())[0]
    this.txProperties = {
      from: fromAddress,
      gas: 2000000
    }

    return this.txProperties
  }

  /**
   * ENS v2 doesn't support batch update of text entries, so we must update them one by one
   */
  private async updateTextEntries(
    companyName: string,
    companyNode: string,
    textEntries: ITextEntry[],
    companyFromENS: IAPIRegistryCompany
  ) {
    const komgoOnboarderInstance = await this.contractArtifacts.komgoOnboarder()
    const txProperties = await this.getTxProperties()
    const updateableTextEntries = [
      'x500Name',
      'isMember',
      'isFinancialInstitution',
      'hasSWIFTKey',
      'vaktStaticId',
      'vaktMnid',
      'memberType'
    ]
    const filteredEntries = textEntries
      .filter(textEntry => updateableTextEntries.indexOf(textEntry.key) > -1)
      .filter(textEntry => this.fieldHasBeenChanged(textEntry, companyFromENS))

    await komgoOnboarderInstance.methods.addTextEntries(companyNode, filteredEntries).send(txProperties)
  }

  private fieldHasBeenChanged(textEntry: ITextEntry, companyFromENS: IAPIRegistryCompany): boolean {
    if (textEntry.key === 'x500Name') {
      return !isEqual(JSON.parse(textEntry.value), companyFromENS.x500Name)
    }
    return textEntry.value !== this.textEntryValueToString(companyFromENS[textEntry.key])
  }

  private textEntryValueToString(value: undefined | object | string) {
    if (value === undefined) {
      return ''
    }
    return Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value.toString()
  }
}
