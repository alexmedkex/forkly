const { sha3 } = require("web3-utils")
const namehash = require("eth-ens-namehash")
const { encodeEventSignature } = require("web3-eth-abi")

const ENSRegistry = artifacts.require("./ENSRegistry.sol")
const ContractLibrary = artifacts.require("./ContractLibrary.sol")
const CastEventEmitter = artifacts.require("./ICastEventEmitter.sol")
const KomgoResolver = artifacts.require("./KomgoResolver.sol")

const CONTRACT_LIBRARY_LABEL = "contractlibrary"
const KOMGO_ROOT_LABEL = "komgo"
const CONTRACT_ROOT_LABEL = "contract"

const CONTRACTS_SUB_DOMAIN = `${CONTRACT_ROOT_LABEL}.${KOMGO_ROOT_LABEL}`
const CONTRACT_LIBRARY_SUB_DOMAIN = `${CONTRACT_LIBRARY_LABEL}.${CONTRACTS_SUB_DOMAIN}`
const CONTRACTS_NODE = namehash.hash(CONTRACTS_SUB_DOMAIN)
const CONTRACT_LIBRARY_NODE = namehash.hash(CONTRACT_LIBRARY_SUB_DOMAIN)

const CAST_EVENT_NAME = "CastEvent"

module.exports = (deployer, _, accounts) => {
  deployer.then(async () => {
    const castEventSignatureHash = getEncodedEventSignature(CastEventEmitter.abi, CAST_EVENT_NAME)
    const contractLibrary = await deployer.deploy(ContractLibrary, castEventSignatureHash)

    const ens = await ENSRegistry.deployed()
    const resolver = await KomgoResolver.deployed()

    await ens.setSubnodeOwner(CONTRACTS_NODE, sha3(CONTRACT_LIBRARY_LABEL), accounts[0])
    await ens.setResolver(CONTRACT_LIBRARY_NODE, resolver.address)

    await resolver.setAddr(CONTRACT_LIBRARY_NODE, contractLibrary.address)
    await resolver.setABI(CONTRACT_LIBRARY_NODE, 1, contractLibrary.abi)
  })
}

const getEncodedEventSignature = (abi, eventName) => {
  const sig = abi.find(({ type, name }) => type === "event" && name === eventName)
  if (!sig) {
    throw new Error(`Fatal error: event signature '${eventName}' not found in abi`)
  }
  return encodeEventSignature(sig)
}
