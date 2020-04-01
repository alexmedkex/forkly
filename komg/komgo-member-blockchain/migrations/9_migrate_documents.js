const namehash = require("eth-ens-namehash")
const web3Utils = require("web3-utils")
const AbiCoder = require("web3-eth-abi")

const ENSRegistry = artifacts.require("./ENSRegistry.sol")
const Sha3AddressLib = artifacts.require("./Sha3AddressLib.sol")
const KomgoMetaResolver = artifacts.require("KomgoMetaResolver")
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol")
const DocumentRegistryProxy = artifacts.require("./DocumentRegistryProxy.sol")
const Migrations = artifacts.require("./Migrations.sol")

const KOMGO_META_RESOLVER_NODE = namehash.hash("komgometaresolver.contract.komgo")
const KOMGO_ROOT_LABEL = "komgo"
const CONTRACTS_LABEL = "contract"
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`
const CONTRACTS_NODE = namehash.hash(CONTRACTS_ROOT_LABEL)
const DOCUMENT_REGISTRY_LABEL = "documentregistry"
const DOCUMENT_REGISTRY_NODE = namehash.hash(`${DOCUMENT_REGISTRY_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const OLD_DOCUMENT_REGISTRY_LABEL = "documentregistryv1"
const OLD_DOCUMENT_REGISTRY_NODE = namehash.hash(
  `${OLD_DOCUMENT_REGISTRY_LABEL}.${CONTRACTS_ROOT_LABEL}`
)

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    const ens = await ENSRegistry.deployed()
    const komgoMetaResolverProxy = await ens.resolver(KOMGO_META_RESOLVER_NODE)
    const resolver = KomgoMetaResolver.at(komgoMetaResolverProxy)
    console.log("Deploying documents registry with proxy")
    await deployer.deploy(DocumentRegistry, ens.address)
    const documentsRegistry = await DocumentRegistry.deployed()
    console.log(`Deployed documents registry implementation: ${documentsRegistry.address}`)
    console.log(AbiCoder)
    const encodedInitialise = AbiCoder.encodeFunctionCall(
      {
        name: "initialise",
        type: "function",
        inputs: [{ type: "address", name: "_ensRegistry" }]
      },
      [ens.address]
    )
    console.log(
      `Deploying documents registry proxy with implementation: ${documentsRegistry.address}`
    )
    await deployer.deploy(
      DocumentRegistryProxy,
      encodedInitialise,
      documentsRegistry.address,
      ens.address
    )
    const documentsRegistryProxy = await DocumentRegistryProxy.deployed()
    console.log(
      `Storing old document registry contract resolver to documentregistryv1.contract.komgo domain`
    )
    const documentsResolverAdress = await ens.resolver(DOCUMENT_REGISTRY_NODE)
    const documentsResolver = KomgoMetaResolver.at(documentsResolverAdress)

    const oldAddr = await documentsResolver.addr(DOCUMENT_REGISTRY_NODE)
    const oldAbi = await documentsResolver.ABI(DOCUMENT_REGISTRY_NODE, 1)
    await ens.setSubnodeOwner(
      CONTRACTS_NODE,
      web3Utils.sha3(OLD_DOCUMENT_REGISTRY_LABEL),
      accounts[0]
    )
    await ens.setResolver(OLD_DOCUMENT_REGISTRY_NODE, resolver.address)
    await resolver.setAddr(OLD_DOCUMENT_REGISTRY_NODE, oldAddr)
    await resolver.setABI(OLD_DOCUMENT_REGISTRY_NODE, 1, JSON.parse(web3.toAscii(oldAbi[1])))
    console.log(`Setting new contract data in resolver for documentregistry.contract.komgo domain`)
    await ens.setResolver(DOCUMENT_REGISTRY_NODE, resolver.address)
    await resolver.setAddr(DOCUMENT_REGISTRY_NODE, DocumentRegistryProxy.address)
    await resolver.setABI(DOCUMENT_REGISTRY_NODE, 1, DocumentRegistry.abi)
  })
}
