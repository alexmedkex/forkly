import { getLogger } from '@komgo/logging'
import axios from 'axios'
import { injectable, inject } from 'inversify'
import contract = require('truffle-contract')
import * as Web3 from 'web3'

import { TYPES } from '../../inversify/types'

import { ISmartContractProvider } from './interfaces'
const namehash = require('eth-ens-namehash')

@injectable()
export class SmartContractProvider implements ISmartContractProvider {
  public contractAddress: string

  private readonly logger = getLogger('SmartContractProvider')
  private abi: any[]
  private truffleContract

  constructor(
    @inject(TYPES.ApiRegistryUrl) private readonly registryBaseUrl: string,
    @inject(TYPES.Web3Instance) private readonly web3Instance: Web3
  ) {}

  public async getTruffleContract<T>(documentRegistryDomain: string): Promise<T> {
    if (!this.abi || !this.contractAddress) {
      await this.getContractAbi(documentRegistryDomain)
    }

    if (this.truffleContract) {
      return this.truffleContract as T
    }

    this.logger.info('Instantiating truffle contract')
    const instance = contract({
      abi: this.abi,
      networks: {
        [await this.web3Instance.eth.net.getId()]: { address: this.contractAddress }
      }
    })
    instance.setProvider(this.web3Instance.currentProvider)
    if (typeof instance.currentProvider.sendAsync !== 'function') {
      instance.currentProvider.sendAsync = function() {
        return instance.currentProvider.send.apply(instance.currentProvider, arguments)
      }
    }

    this.truffleContract = await instance.deployed()
    this.logger.info('Truffle contract initialized successfully')

    return this.truffleContract as T
  }

  private async getContractAbi(documentRegistryDomain: string) {
    if (this.abi && this.contractAddress) {
      return
    }

    const documentsNode = namehash.hash(documentRegistryDomain)

    const response = await axios.get(
      `${this.registryBaseUrl}/v0/registry/cache?companyData=${encodeURIComponent(`{"node" : "${documentsNode}" }`)}`
    )
    this.contractAddress = response.data[0].address
    this.abi = JSON.parse(response.data[0].abi)
  }
}
