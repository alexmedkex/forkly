const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
const ENSRegistry = artifacts.require("./ENSRegistry.sol");
const KomgoResolver = artifacts.require("./KomgoResolver.sol");
const namehash = require("eth-ens-namehash");

module.exports = async function(callback) {
  
  const documentRegistryNode = namehash.hash(`documentregistry.contract.komgo`)
  const ensRegistry = await ENSRegistry.deployed()
  const resolver = await KomgoResolver.deployed()
  const ensRegistryAddress = ensRegistry.address
  console.log(`Redeploying DocumentRegistry using ENSRegistry=${ensRegistryAddress}`)
  const documentRegistryDeployed = await DocumentRegistry.new(ensRegistryAddress)
  const documentRegistryAddress = documentRegistryDeployed.address
  console.log(`DocumentRegistry deployed, new address=${documentRegistryAddress}`)
  console.log(`Setting new address in resolver for node ${documentRegistryNode}`)
  await resolver.setAddr(documentRegistryNode, documentRegistryAddress)
  console.log(`Done`)
}
