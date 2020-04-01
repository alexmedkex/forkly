import { getLogger } from '@komgo/logging'
import namehash = require('eth-ens-namehash')
import { injectable } from 'inversify'
import contract = require('truffle-contract')

import ensRegistryData from '../../data-layer/contracts/ENSRegistry'
import metaResolverContractAbi from '../../data-layer/contracts/KomgoMetaResolver'
import onboarderContractAbi from '../../data-layer/contracts/KomgoOnboarder'
import resolverContractAbi from '../../data-layer/contracts/KomgoResolver'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

import ISmartContract from './ISmartContract'

@injectable()
export default class SmartContract implements ISmartContract {
  private komgoMetaResolverContract: any
  private komgoResolverContract: any
  private ensContract: any
  private komgoOnboarderContract: any
  private readonly logger = getLogger('SmartContract')
  constructor(
    @inject(TYPES.Web3) private readonly web3,
    @inject('komgometaresolver-domain') private readonly komgoMetaResolverDomain,
    @inject('komgoonboarder-domain') private readonly komgoOnboarderDomain,
    @inject('ens-address') private readonly komgoENSAddress
  ) {}

  async ensRegistry(): Promise<any> {
    if (!this.ensContract) {
      this.ensContract = await this.instantiateContract(ensRegistryData, this.komgoENSAddress)
    }
    return this.ensContract
  }

  async komgoResolver(address: string): Promise<any> {
    if (!this.komgoResolverContract) {
      this.komgoResolverContract = await this.instantiateContract(resolverContractAbi, address)
    }
    return this.komgoResolverContract
  }

  async komgoMetaResolver(): Promise<any> {
    if (!this.komgoMetaResolverContract) {
      const ens = await this.ensRegistry()
      const resloverAddress = await ens.resolver(namehash.hash(this.komgoMetaResolverDomain))
      const resolver = await this.komgoResolver(resloverAddress)
      const metaResolverAddress = await resolver.addr(namehash.hash(this.komgoMetaResolverDomain))
      this.komgoMetaResolverContract = await this.instantiateContract(metaResolverContractAbi, metaResolverAddress)
    }
    return this.komgoMetaResolverContract
  }

  async komgoOnboarder(): Promise<any> {
    if (!this.komgoMetaResolverContract) {
      const ens = await this.ensRegistry()
      const resloverAddress = await ens.resolver(namehash.hash(this.komgoOnboarderDomain))
      const resolver = await this.komgoResolver(resloverAddress)
      const onboarderAddress = await resolver.addr(namehash.hash(this.komgoOnboarderDomain))
      this.komgoOnboarderContract = await this.instantiateContract(onboarderContractAbi, onboarderAddress)
    }
    return this.komgoOnboarderContract
  }

  private async instantiateContract(abi, address) {
    this.logger.info(`${abi.contractName} contract is not initialized. Creating it with address=${address}`)
    const contractAbi = abi.abi
    const cont = contract({
      abi: contractAbi,
      networks: {
        [await this.web3.web3Instance.eth.net.getId()]: { address }
      }
    })
    cont.setProvider(this.web3.web3Provider)
    if (typeof cont.currentProvider.sendAsync !== 'function') {
      cont.currentProvider.sendAsync = function() {
        return cont.currentProvider.send.apply(cont.currentProvider, arguments)
      }
    }
    const contractInst = await cont.deployed()
    this.logger.info(`${abi.contractName} contract initialized successfully`)

    return contractInst
  }
}
