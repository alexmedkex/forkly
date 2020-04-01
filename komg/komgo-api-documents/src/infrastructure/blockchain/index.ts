import { SignerApi } from '@komgo/api-blockchain-signer-client'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import axios from 'axios'

import { ErrorName } from '../../utils/ErrorName'

import { DocumentsTransactionManager } from './DocumentsTransactionManager'

const namehash = require('eth-ens-namehash')

const logger = getLogger('blockchain')

/**
 * Builds the doc tx manager (which manages hashing and eth tx, signing and posting)
 * This is a multi-stage process as we need to find contract address, build
 * the right provider and build the instance
 */
export async function buildDocTxManager(web3Instance, signerApi: SignerApi): Promise<DocumentsTransactionManager> {
  const networkId = await web3Instance.eth.net.getId()

  const apiRegistryData = await buildDocumentsData(networkId)
  const contractAddress = apiRegistryData.networks[networkId].address
  const abi = JSON.parse(apiRegistryData.abi)
  logger.info(`DocumentRegistry address found: ${contractAddress}`)

  return new DocumentsTransactionManager(web3Instance, contractAddress, abi, signerApi)
}

async function buildDocumentsData(networkId) {
  const registryUrl = process.env.API_REGISTRY_BASE_URL || 'http://api-registry'
  const documentsDomain = process.env.DOCUMENT_REGISTRY_DOMAIN || 'documentregistry.contract.komgo'
  const documentsNode = namehash.hash(documentsDomain)
  const query = `{"node" : "${documentsNode}" }`
  const response = await axios.get(`${registryUrl}/v0/registry/cache/?companyData=${encodeURIComponent(query)}`)
  if (!response.data || response.data.length === 0 || !response.data[0].address || !response.data[0].abi) {
    logger.error(
      ErrorCode.ConnectionMicroservice,
      ErrorName.SmartContractAddressNotFound,
      'Could not retrieve DocumentRegistry address from api-registry',
      { documentsDomain }
    )
  }
  const address = response.data[0].address
  const abi = response.data[0].abi
  const networks = {}
  networks[networkId] = { address }
  const obj = { abi, networks }
  return obj
}
