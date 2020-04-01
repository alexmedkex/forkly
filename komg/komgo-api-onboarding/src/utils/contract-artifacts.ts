import { BN } from 'bn.js'
import * as namehash from 'eth-ens-namehash'
import * as fs from 'fs'
import { injectable } from 'inversify'
import * as pako from 'pako'
import * as web3u from 'web3-utils'

import { inject } from '../inversify/ioc'
import { TYPES } from '../inversify/types'

import { logger } from '.'

interface IContractArtifacts {
  ensRegistry()
  komgoResolver()
  komgoRegistrar()
  komgoMetaResolver()
  komgoOnboarder()
  resolverForNode(node: string)
}

/**
 * This class now holds deployed contracts in the blockchain.
 * It finds the contracts deployed by ENS and populate the attributes by lazy load.
 * It relies in ENSRegistry ABI and a partial PublicResolver ABI.
 * Those ABIs are standard from ENS, so they are not going to change and it is fine if we just
 * keep them in JSON files under this project. The rest of the contracts' ABIs will be retrieved from ENS Resolvers
 */
@injectable()
export class ContractArtifacts implements IContractArtifacts {
  private ensContract: any
  private komgoResolverContract: any
  private komgoRegistrarContract: any
  private komgoMetaResolverContract: any
  private komgoOnboarderContract: any

  private readonly komgoResolverDomain: string
  private readonly komgoRegistrarDomain: string
  private readonly komgoMetaResolverDomain: string
  private readonly komgoOnboarderDomain: string

  constructor(@inject(TYPES.EnsAddress) private readonly ensAddress, @inject(TYPES.Web3Wrapper) private readonly web3) {
    this.komgoResolverDomain = 'komgoresolver.contract.komgo'
    this.komgoRegistrarDomain = 'komgoregistrar.contract.komgo'
    this.komgoMetaResolverDomain = 'komgometaresolver.contract.komgo'
    this.komgoOnboarderDomain = 'komgoonboarder.contract.komgo'
  }

  async ensRegistry(): Promise<any> {
    if (!this.ensContract) {
      const ensAbi = this.parseJsonFromFile(__dirname + '/../../abi/ENSRegistryAbi.json')
      this.ensContract = new this.web3.eth.Contract(ensAbi, this.ensAddress)
    }
    return this.ensContract
  }

  async komgoResolver(): Promise<any> {
    if (!this.komgoResolverContract) {
      const resolverNode = namehash.hash(this.komgoResolverDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoResolverDomain, resolverNode, 1)
      this.komgoResolverContract = new this.web3.eth.Contract(JSON.parse(this.hexToAscii(abi)), addr)
    }
    return this.komgoResolverContract
  }

  async komgoRegistrar(): Promise<any> {
    if (!this.komgoRegistrarContract) {
      const registrarNode = namehash.hash(this.komgoRegistrarDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoRegistrarDomain, registrarNode, 1)
      this.komgoRegistrarContract = new this.web3.eth.Contract(JSON.parse(this.hexToAscii(abi)), addr)
    }
    return this.komgoRegistrarContract
  }

  async komgoMetaResolver(): Promise<any> {
    if (!this.komgoMetaResolverContract) {
      const metaResolverNode = namehash.hash(this.komgoMetaResolverDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoMetaResolverDomain, metaResolverNode, 2)
      const abiAscii = this.hexToAscii(abi)
      const bufferAbi = Buffer.from(abiAscii, 'hex')
      const uncompressedAbi = pako.inflate(bufferAbi, { to: 'string' })
      this.komgoMetaResolverContract = new this.web3.eth.Contract(JSON.parse(uncompressedAbi), addr)
    }
    return this.komgoMetaResolverContract
  }

  async komgoOnboarder(): Promise<any> {
    if (!this.komgoOnboarderContract) {
      const komgoOnboarderNode = namehash.hash(this.komgoOnboarderDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoOnboarderDomain, komgoOnboarderNode, 1)
      this.komgoOnboarderContract = new this.web3.eth.Contract(JSON.parse(this.hexToAscii(abi)), addr)
    }
    return this.komgoOnboarderContract
  }

  async resolverForNode(node: string) {
    if (!this.ensContract) {
      await this.ensRegistry()
    }
    const resolverAddr = await this.ensContract.resolver(node)
    const { abi } = await this.findAddressAndAbi(this.komgoResolverDomain, namehash.hash(this.komgoResolverDomain), 1)
    const cont = new this.web3.eth.Contract(abi, resolverAddr)
    return cont
  }

  private async findAddressAndAbi(domain: string, resolverNode: string, abiType: number) {
    if (!this.ensContract) {
      await this.ensRegistry()
    }
    const resolverAddress = await this.ensContract.methods.resolver(resolverNode).call()
    if (new BN(resolverAddress, 16).isZero()) {
      logger.error(`domain: ${domain} with node: ${resolverNode} does not have any resolver`)
    }

    const resolverContDeployed = new this.web3.eth.Contract(
      this.parseJsonFromFile(__dirname + '/../../abi/PublicResolverPartialAbi.json'),
      resolverAddress
    )

    const abi = await resolverContDeployed.methods.ABI(resolverNode, abiType).call()

    const addr = await resolverContDeployed.methods.addr(resolverNode).call()
    return { abi, addr }
  }

  private parseJsonFromFile(file: string) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }

  private hexToAscii(abi: any): any {
    return web3u.toAscii(abi[1])
  }
}
