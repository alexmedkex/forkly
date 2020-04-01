import { Web3Wrapper } from '@komgo/blockchain-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import contract = require('truffle-contract')

import { generateBlockchainException, ErrorNames } from '../../exceptions/utils'
import { TYPES } from '../../inversify/types'

import { ensRegistryData } from './ENSRegistryContract'
import { IContractArtifacts } from './IContractArtifacts'
import { publicResolverData } from './PublicResolverContract'
const namehash = require('eth-ens-namehash')
const pako = require('pako')

/**
 * This class now holds deployed contracts in the blockchain.
 * It finds the contracts deployed by ENS and populate the attributes by lazy load.
 * It relies in ENSRegistry ABI and a partial PublicResolver ABI.
 * Those ABIs are standard from ENS, so they are not going to change and it is fine if we just
 * keep them in JSON files under this project. The rest of the contracts' ABIs will be retrieved from ENS Resolvers
 */
@injectable()
export default class ContractArtifacts implements IContractArtifacts {
  ensContract: any
  komgoResolverContract: any
  komgoRegistrarContract: any
  komgoMetaResolverContract: any
  private logger = getLogger('ContractArtifacts')

  constructor(
    @inject('ens_registry_contract_address') private readonly ensAddress,
    @inject('komgoresolver-domain') private readonly komgoResolverDomain,
    @inject('komgoregistrar-domain') private readonly komgoRegistrarDomain,
    @inject('komgometaresolver-domain') private readonly komgoMetaResolverDomain,
    @inject(TYPES.Web3Wrapper) private readonly web3Wrapper: Web3Wrapper
  ) {}

  async ensRegistry(): Promise<any> {
    if (!this.ensContract) {
      this.logger.info(`ENSRegistry contract is not initialized. Creating it with address=${this.ensAddress}`)
      const ensAbi = ensRegistryData.abi
      const cont = contract(await this.buildContractObject(ensAbi, this.ensAddress))
      this.updateProvider(cont)
      try {
        this.ensContract = await cont.deployed()
      } catch (error) {
        throw generateBlockchainException(error, ErrorNames.DeployENSContractFailed, new Error().stack, this.logger)
      }
      this.logger.info(`ENSRegistry contract initialized successfully`)
    }
    return this.ensContract
  }

  async komgoResolver(): Promise<any> {
    if (!this.komgoResolverContract) {
      this.logger.info('KomgoResolver contract is not initialized. Creating it with domain', {
        komgoResolverDomain: this.komgoResolverDomain
      })
      const resolverNode = namehash.hash(this.komgoResolverDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoResolverDomain, resolverNode, 1)
      this.logger.info('KomgoResolver address retrieved from ENS', { contractAdress: addr })
      const cont = contract(await this.buildContractObject(this.hexToAscii(abi), addr))
      this.updateProvider(cont)
      try {
        this.komgoResolverContract = await cont.deployed()
      } catch (error) {
        throw generateBlockchainException(error, ErrorNames.DeployKomgoResolverFailed, new Error().stack, this.logger)
      }
      this.logger.info(`KomgoResolver contract initialized successfully`)
    }
    return this.komgoResolverContract
  }

  async komgoRegistrar(): Promise<any> {
    if (!this.komgoRegistrarContract) {
      this.logger.info('KomgoRegistrar contract is not initialized. Creating it with domain', {
        komgoRegistrarDomain: this.komgoRegistrarDomain
      })

      const registrarNode = namehash.hash(this.komgoRegistrarDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoRegistrarDomain, registrarNode, 1)
      this.logger.info('KomgoRegistrar address retrieved from ENS', { contractAdress: addr })
      const cont = contract(await this.buildContractObject(this.hexToAscii(abi), addr))
      this.updateProvider(cont)
      try {
        this.komgoRegistrarContract = await cont.deployed()
      } catch (error) {
        throw generateBlockchainException(error, ErrorNames.DeployKomgoRegistrarFailed, new Error().stack, this.logger)
      }
      this.logger.info(`KomgoRegistrar contract initialized successfully`)
    }
    return this.komgoRegistrarContract
  }

  async komgoMetaResolver(): Promise<any> {
    if (!this.komgoMetaResolverContract) {
      this.logger.info('KomgoMetaResolver contract is not initialized. Creating it with domain', {
        komgoMetaResolverDomain: this.komgoMetaResolverDomain
      })

      const metaResolverNode = namehash.hash(this.komgoMetaResolverDomain)
      const { abi, addr } = await this.findAddressAndAbi(this.komgoMetaResolverDomain, metaResolverNode, 2)
      this.logger.info('KomgoMetaResolver address retrieved from ENS', { contractAdress: addr })
      const abiAscii = this.hexToAscii(abi)
      const bufferAbi = Buffer.from(abiAscii, 'hex')
      const uncompressedAbi = pako.inflate(bufferAbi, { to: 'string' })
      const cont = contract(await this.buildContractObject(uncompressedAbi, addr))
      this.updateProvider(cont)
      try {
        this.komgoMetaResolverContract = await cont.deployed()
      } catch (error) {
        throw generateBlockchainException(
          error,
          ErrorNames.DeployKomgoMetaResolverFailed,
          new Error().stack,
          this.logger
        )
      }
      this.logger.info(`KomgoMetaResolver contract initialized successfully`)
    }
    return this.komgoMetaResolverContract
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
    const cont = contract(await this.buildContractObject(this.hexToAscii(abi), resolverAddr))
    this.updateProvider(cont)
    try {
      return await cont.deployed()
    } catch (error) {
      throw generateBlockchainException(error, ErrorNames.DeployResolverForNodeFailed, new Error().stack, this.logger)
    }
  }

  async findAddressAndAbi(domain: string, resolverNode: string, abiType: number) {
    if (!this.ensContract) {
      await this.ensRegistry()
    }
    let abi
    let addr
    try {
      const accounts = await this.web3Wrapper.web3Instance.eth.getAccounts()
      this.logger.info(`using: ${accounts[0]}`)
      this.logger.info('Finding address and ABI', { domain, resolverNode, abiType })
      const resolverAddress = await this.ensContract.resolver(resolverNode, { from: accounts[0] })
      this.logger.info('Resolver address', { resolverAddress })
      if (this.web3Wrapper.web3Instance.utils.toBN(resolverAddress) === this.web3Wrapper.web3Instance.utils.toBN(0)) {
        this.logger.warn(
          ErrorCode.BlockchainTransaction,
          ErrorNames.ResolverNotFound,
          `Resolver not found for domain`,
          { domain, resolverNode },
          new Error().stack
        )
      }
      const resolverCont = contract(await this.buildResolverContractObject(resolverAddress))
      this.logger.info(`Resolver contract object created`, { resolverAddress })
      this.updateProvider(resolverCont)
      const resolverContDeployed = await resolverCont.deployed()
      this.logger.info(`Found resolver contract deployed`, { resolverAddress })
      abi = await resolverContDeployed.ABI(resolverNode, abiType, { from: accounts[0] })
      this.logger.info(`Could retrieve ABI from Resolver`, { resolverAddress, abiType })
      addr = await resolverContDeployed.addr(resolverNode, { from: accounts[0] })
      this.logger.info('Could retrieve address from Resolver', { resolverAddress, contractAdress: addr })
    } catch (error) {
      throw error
    }
    return { abi, addr }
  }

  private async buildContractObject(abi: any, address: string) {
    let networkId
    try {
      this.logger.info(`Building contract object - getting networkId`)
      networkId = await this.web3Wrapper.web3Instance.eth.net.getId()
      this.logger.info(`Got networkId`, { networkId })
    } catch (error) {
      throw generateBlockchainException(error, ErrorNames.Web3GetIdFailed, new Error().stack, this.logger)
    }
    const networks = {}
    networks[networkId] = { address }
    const obj = { abi, networks }
    return obj
  }

  private async buildResolverContractObject(address: string) {
    return this.buildContractObject(publicResolverData.abi, address)
  }

  private hexToAscii(abi: any): any {
    return this.web3Wrapper.web3Instance.utils.toAscii(abi[1])
  }

  private updateProvider(artifact: any) {
    artifact.setProvider(this.web3Wrapper.web3Provider)
    if (typeof artifact.currentProvider.sendAsync !== 'function') {
      artifact.currentProvider.sendAsync = function() {
        return artifact.currentProvider.send.apply(artifact.currentProvider, arguments)
      }
    }
  }
}
