const namehash = require("eth-ens-namehash")
const web3Utils = require("web3-utils")
const KomgoOnboarder = artifacts.require("./KomgoOnboarder.sol")
const ENSRegistry = artifacts.require("./ENSRegistry.sol")
const KomgoRegistrar = artifacts.require("./KomgoRegistrar.sol")
const KomgoMetaResolver = artifacts.require("KomgoMetaResolver")
const KomgoMetaResolverProxy = artifacts.require("KomgoMetaResolverProxy")

const KOMGO_ROOT_LABEL = "komgo"
const CONTRACTS_LABEL = "contract"
const KOMGO_ONBOARDER_LABEL = "komgoonboarder"
const REGISTRAR_LABEL = "komgoregistrar"
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`
const REGISTRAR_NODE = namehash.hash(`${REGISTRAR_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const CONTRACTS_NODE = namehash.hash(CONTRACTS_ROOT_LABEL)
const KOMGO_ONBOARDER_NODE = namehash.hash(`${KOMGO_ONBOARDER_LABEL}.${CONTRACTS_ROOT_LABEL}`)

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    const ens = await ENSRegistry.deployed()
    const komgoMetaResolverProxy = await KomgoMetaResolverProxy.deployed()
    const resolver = KomgoMetaResolver.at(komgoMetaResolverProxy.address)
    console.log(`Getting registrar`)
    const registrar = await KomgoRegistrar.deployed()
    console.log("Ensure domain komgoregistrar.contract.komgo has new resolver")
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(REGISTRAR_LABEL), accounts[0], {
      from: accounts[0]
    })
    await ens.setResolver(REGISTRAR_NODE, KomgoMetaResolverProxy.address)
    await resolver.setAddr(REGISTRAR_NODE, registrar.address)
    await resolver.setABI(REGISTRAR_NODE, 1, KomgoRegistrar.abi)
    console.log(`KomgoRegistrar=${registrar.address}`)

    console.log(`Deploying KomgoOnboarder`)
    await deployer.deploy(KomgoOnboarder, ens.address)
    console.log(`Setting domain komgoonboarder.contract.komgo`)
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(KOMGO_ONBOARDER_LABEL), accounts[0], {
      from: accounts[0]
    })
    await ens.setResolver(KOMGO_ONBOARDER_NODE, KomgoMetaResolverProxy.address)
    await resolver.setAddr(KOMGO_ONBOARDER_NODE, KomgoOnboarder.address)
    await resolver.setABI(KOMGO_ONBOARDER_NODE, 1, KomgoOnboarder.abi)

    console.log("setting owner for KomgoRegistrar")
    await registrar.transferOwnership(KomgoOnboarder.address)
  })
}
