import { logger } from '.'
import { Web3Wrapper, Web3Instance } from '@komgo/blockchain-access'
import { Config } from '../config'
import fs from 'fs'
import namehash from 'eth-ens-namehash'
import pako from 'pako'

/**
 * This class now holds deployed contracts in the blockchain.
 * It finds the contracts deployed by ENS and populate the attributes by lazy load.
 * It relies in ENSRegistry ABI and a partial PublicResolver ABI.
 * Those ABIs are standard from ENS, so they are not going to change and it is fine if we just
 * keep them in JSON files under this project. The rest of the contracts' ABIs will be retrieved from ENS Resolvers
 */
export class ContractArtifacts {
  private ensContract: any
  private komgoResolverContract: any
  private komgoRegistrarContract: any
  private komgoMetaResolverContract: any
  private komgoOnboarderContract: any

  private readonly ensAddress: string
  private readonly komgoResolverDomain: string
  private readonly komgoRegistrarDomain: string
  private readonly komgoMetaResolverDomain: string
  private readonly komgoOnboarderDomain: string

  constructor(config: Config) {
    this.ensAddress = config.get('ens.address')
    this.komgoResolverDomain = config.get('ens.domain.komgoresolver')
    this.komgoRegistrarDomain = config.get('ens.domain.komgoregistrar')
    this.komgoMetaResolverDomain = config.get('ens.domain.komgometaresolver')
    this.komgoOnboarderDomain = config.get('ens.domain.komgoonboarder')
  }

  async ensRegistry(): Promise<any> {
    if (!this.ensContract) {
      const ensAbi = this.parseJsonFromFile(__dirname + '/../../abi/ENSRegistryAbi.json')
      this.ensContract = new Web3Wrapper.web3Instance.eth.Contract(ensAbi, this.ensAddress)

      // this.updateProvider(cont)
    }
    return this.ensContract
  }

  async komgoResolver(): Promise<any> {
    if (!this.komgoResolverContract) {
      const resolverNode = namehash.hash(this.komgoResolverDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoResolverDomain, resolverNode, 1)
      this.komgoResolverContract = new Web3Wrapper.web3Instance.eth.Contract(JSON.parse(this.hexToAscii(abi)), addr)
      // this.updateProvider(cont)
    }
    return this.komgoResolverContract
  }

  async komgoRegistrar(): Promise<any> {
    if (!this.komgoRegistrarContract) {
      const registrarNode = namehash.hash(this.komgoRegistrarDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoRegistrarDomain, registrarNode, 1)
      this.komgoRegistrarContract = new Web3Wrapper.web3Instance.eth.Contract(JSON.parse(this.hexToAscii(abi)), addr)
      // this.updateProvider(cont)
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
      this.komgoMetaResolverContract = new Web3Wrapper.web3Instance.eth.Contract(JSON.parse(uncompressedAbi), addr)
      // this.updateProvider(cont)
    }
    return this.komgoMetaResolverContract
  }

  async komgoOnboarder(): Promise<any> {
    if (!this.komgoOnboarderContract) {
      const komgoOnboarderNode = namehash.hash(this.komgoOnboarderDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoOnboarderDomain, komgoOnboarderNode, 1)
      this.komgoOnboarderContract = new Web3Wrapper.web3Instance.eth.Contract(JSON.parse(this.hexToAscii(abi)), addr)
      // this.updateProvider(cont)
    }
    return this.komgoOnboarderContract
  }

  async resolverForNode(node: string) {
    if (!this.ensContract) {
      await this.ensRegistry()
    }
    const resolverAddr = await this.ensContract.resolver(node)
    const { abi, addr } = await this.findAddressAndAbi(
      this.komgoResolverDomain,
      namehash.hash(this.komgoResolverDomain),
      1
    )
    const cont = new Web3Wrapper.web3Instance.eth.Contract(abi, resolverAddr)
    // this.updateProvider(cont)
  }

  async findAddressAndAbi(domain: string, resolverNode: string, abiType: number) {
    if (!this.ensContract) {
      await this.ensRegistry()
    }
    const resolverAddress = await this.ensContract.methods.resolver(resolverNode).call()
    if (Web3Wrapper.web3Instance.utils.toBN(resolverAddress).isZero()) {
      logger.error(`domain: ${domain} with node: ${resolverNode} does not have any resolver`)
    }

    const resolverContDeployed = new Web3Wrapper.web3Instance.eth.Contract(
      this.parseJsonFromFile(__dirname + '/../../abi/PublicResolverPartialAbi.json'),
      resolverAddress
    )
    // this.updateProvider(resolverCont)

    const abi = await resolverContDeployed.methods.ABI(resolverNode, abiType).call()

    const addr = await resolverContDeployed.methods.addr(resolverNode).call()
    return { abi, addr }
  }

  private async buildContractObject(inputAbi: any, inputAddress: string) {
    const networkId = await Web3Wrapper.web3Instance.eth.net.getId()
    const inputNetworks = {}
    inputNetworks[networkId] = { address: inputAddress }
    const obj = { abi: inputAbi, networks: inputNetworks }
    return obj
  }

  private parseJsonFromFile(file: string) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }

  private async buildResolverContractObject(address: string) {
    return this.buildContractObject(
      this.parseJsonFromFile(__dirname + '/../../abi/PublicResolverPartialAbi.json'),
      address
    )
  }

  private hexToAscii(abi: any): any {
    return Web3Wrapper.web3Instance.utils.toAscii(abi[1])
  }

  private updateProvider(artifact: any) {
    artifact.setProvider(Web3Wrapper.web3Provider)
    if (typeof artifact.currentProvider.sendAsync !== 'function') {
      artifact.currentProvider.sendAsync = function() {
        return artifact.currentProvider.send.apply(artifact.currentProvider, arguments)
      }
    }
  }
}
