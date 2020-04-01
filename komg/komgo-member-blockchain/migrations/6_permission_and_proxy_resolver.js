const AbiCoder = require('web3-eth-abi');
const namehash = require("eth-ens-namehash");
const web3Utils = require("web3-utils");
const pako = require('pako');

const ENSRegistry = artifacts.require("./ENSRegistry.sol");
const Sha3AddressLib = artifacts.require("./Sha3AddressLib.sol");
const PermissionChecker = artifacts.require("./PermissionChecker.sol");
const KomgoMetaResolverProxy = artifacts.require("KomgoMetaResolverProxy")
const KomgoMetaResolver = artifacts.require("KomgoMetaResolver")
const DocumentRegistry = artifacts.require("./DocumentRegistry.sol");
const Migrations = artifacts.require("./Migrations.sol");
const KomgoOnboarder = artifacts.require("./KomgoOnboarder.sol");
const KomgoRegistrar = artifacts.require("./KomgoRegistrar.sol");

const KOMGO_META_RESOLVER_NODE = namehash.hash('komgometaresolver.contract.komgo')
const KOMGO_ROOT_LABEL = "komgo";
const CONTRACTS_LABEL = "contract";
const REVERSE_LABEL = "reverse";
const ADDR_LABEL = "addr";
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`
const CONTRACTS_NODE = namehash.hash(CONTRACTS_ROOT_LABEL);
const DOCUMENT_REGISTRY_LABEL = "documentregistry";
const DOCUMENT_REGISTRY_NODE = namehash.hash(`${DOCUMENT_REGISTRY_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const MIGRATIONS_LABEL = "migrations";
const MIGRATIONS_NODE = namehash.hash(`${MIGRATIONS_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const PERMISSION_CHECKER_LABEL = "permissionchecker"
const PERMISSION_CHECKER_NODE = namehash.hash(`${PERMISSION_CHECKER_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const KOMGO_ONBOARDER_LABEL = "komgoonboarder"
const KOMGO_ONBOARDER_NODE = namehash.hash(`${KOMGO_ONBOARDER_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const REGISTRAR_LABEL = "komgoregistrar";
const REGISTRAR_NODE = namehash.hash(`${REGISTRAR_LABEL}.${CONTRACTS_ROOT_LABEL}`)

/**
 * This migrations file will:
 * - Deploy PermissionChecker under a new domain: permissionchecker.contract.komgo
 * - Deploy the new proxified KomgoMetaResolver and assign it to komgometaresolver.contract.komgo
 * - Deploy KomgoOnboarder under a new domain: komgoonboarder.contract.komgo
 * - If documentregistry.contract.komgo resolver is 0x0 (brand new deployment), deploy DocumentRegistry 
 *   with the new Permissioned.sol inherited, if not, do nothing and keep it as it is
 * - If migrations.contract.komgo resolver is 0x0 (brand new deployment), deploy Migrations
 *   and set the domain information
 */
module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {

    console.log(`Starting migrations 6`)
    const ens = await ENSRegistry.deployed();
    console.log(`Deploying sha3AddressLib`)
    await deployer.deploy(Sha3AddressLib);
    console.log(`Linking Sha3AddressLib to PermissionChecker and KomgoMetaResolver`)
    PermissionChecker.link("Sha3AddressLib", Sha3AddressLib.address)
    KomgoMetaResolver.link("Sha3AddressLib", Sha3AddressLib.address)
    
    console.log(`Deploying KomgoMetaResolver implementation`)
    await deployer.deploy(KomgoMetaResolver);
    const komgoMetaResolver = await KomgoMetaResolver.deployed()
    console.log(`Deployed KomgoMetaResolver implementation: ${komgoMetaResolver.address}`)
    console.log(AbiCoder)
    const encodedInitialise = AbiCoder.encodeFunctionCall({
        name: 'initialise',
        type: 'function',
        inputs: [{ type: 'address', name: '_ensAddr' }],
      }, [ens.address]);
    console.log(`Deploying KomgoMetaResolverProxy with implementation: ${komgoMetaResolver.address}`)
    await deployer.deploy(KomgoMetaResolverProxy, encodedInitialise, komgoMetaResolver.address);
    const komgoMetaResolverProxy = await KomgoMetaResolverProxy.deployed()
    console.log(`Deployed KomgoMetaResolverProxy: ${komgoMetaResolverProxy.address}`)
    const resolver = KomgoMetaResolver.at(komgoMetaResolverProxy.address)
    console.log(`Setting new resolver to komgometaresolver.contract.komgo domain (it will be itself)`)
    await ens.setResolver(KOMGO_META_RESOLVER_NODE, KomgoMetaResolverProxy.address)
    await resolver.setAddr(KOMGO_META_RESOLVER_NODE, komgoMetaResolverProxy.address)
    const compressed = pako.deflate(JSON.stringify(KomgoMetaResolver.abi));
    const compressedHex = Buffer.from(compressed).toString('hex');
    await resolver.setABI(KOMGO_META_RESOLVER_NODE, 2, compressedHex);
    console.log(`KomgoMetaResolver resolver set to: ${KomgoMetaResolverProxy.address}, ABI compressed length in hex chars: ${compressedHex.length}`)
    
    console.log(`Setting reverse domains to new metaresolver`)
    await ens.setSubnodeOwner(namehash.hash(REVERSE_LABEL), web3Utils.sha3(ADDR_LABEL), resolver.address);

    console.log(`Deploying PermissionChecker`)
    await deployer.deploy(PermissionChecker, ens.address)
    console.log(`Setting domain permissionchecker.contract.komgo`)
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(PERMISSION_CHECKER_LABEL), accounts[0], { from: accounts[0] })
    await ens.setResolver(PERMISSION_CHECKER_NODE, KomgoMetaResolverProxy.address)
    await resolver.setAddr(PERMISSION_CHECKER_NODE, PermissionChecker.address)
    await resolver.setABI(PERMISSION_CHECKER_NODE, 1, PermissionChecker.abi)

    console.log('Ensure domain komgoregistrar.contract.komgo has new resolver')
    const registrar = await KomgoRegistrar.deployed();
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(REGISTRAR_LABEL), accounts[0], { from: accounts[0] })
    await ens.setResolver(REGISTRAR_NODE, KomgoMetaResolverProxy.address)
    await resolver.setAddr(REGISTRAR_NODE, registrar.address)
    await resolver.setABI(REGISTRAR_NODE, 1, KomgoRegistrar.abi)

    console.log(`Deploying KomgoOnboarder`)
    await deployer.deploy(KomgoOnboarder, ens.address)
    console.log(`Setting domain komgoonboarder.contract.komgo`)
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(KOMGO_ONBOARDER_LABEL), accounts[0], { from: accounts[0] })
    await ens.setResolver(KOMGO_ONBOARDER_NODE, KomgoMetaResolverProxy.address)
    await resolver.setAddr(KOMGO_ONBOARDER_NODE, KomgoOnboarder.address)
    await resolver.setABI(KOMGO_ONBOARDER_NODE, 1, KomgoOnboarder.abi)

    console.log(`Checking if this is the first time we deploy - if DocumentRegistry has a resolver or not`)
    const documentRegistryResolver = await ens.resolver(DOCUMENT_REGISTRY_NODE)
    if (documentRegistryResolver === '0x0000000000000000000000000000000000000000') {
      console.log(`DocumentRegistry resolver is 0x0, so we need to deploy it`)
      await deployer.deploy(DocumentRegistry, ens.address)
      await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(DOCUMENT_REGISTRY_LABEL), accounts[0])
      await ens.setResolver(DOCUMENT_REGISTRY_NODE, resolver.address);
      await resolver.setAddr(DOCUMENT_REGISTRY_NODE, DocumentRegistry.address);
      await resolver.setABI(DOCUMENT_REGISTRY_NODE, 1, DocumentRegistry.abi);
    } else {
      console.log(`DocumentRegistry resolver is ${documentRegistryResolver}, so we don't need to deploy it`)
    }

    console.log(`Checking if this is the first time we deploy Migrations`)
    const migrationsResolver = await ens.resolver(MIGRATIONS_NODE)
    if (migrationsResolver === '0x0000000000000000000000000000000000000000') {
      console.log(`Migrations resolver ix 0x0, so we need to deploy it`)
      await deployer.deploy(Migrations)
      await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(MIGRATIONS_LABEL), accounts[0])
      await ens.setResolver(MIGRATIONS_NODE, resolver.address);
      await resolver.setAddr(MIGRATIONS_NODE, Migrations.address);
      await resolver.setABI(MIGRATIONS_NODE, 1, Migrations.abi);
    } else {
      console.log(`Migrations resolver is ${migrationsResolver}, so we don't need to deploy it`)
    }
  })
}
