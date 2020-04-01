const namehash = require("eth-ens-namehash");
const web3Utils = require("web3-utils");
const pako = require('pako');
const fs = require('fs');

const ENSRegistry = artifacts.require("./ENSRegistry.sol");
const KomgoRegistrar = artifacts.require("./KomgoRegistrar.sol");
const KomgoMetaResolver = artifacts.require("./KomgoMetaResolver.sol");
const KomgoResolver = artifacts.require("./KomgoResolver.sol");
const Sha3AddressLib = artifacts.require("./Sha3AddressLib.sol");

// Reverse lookup setup
const REVERSE_LABEL = "reverse";
const ADDR_LABEL = "addr";
const ADDR_REVERSE_LABEL = "addr.reverse";
// companies setup
const KOMGO_ROOT_LABEL = "komgo";
const KOMGO_ROOT_NODE = namehash.hash(KOMGO_ROOT_LABEL);
const META_ROOT_LABEL = "meta.komgo";
const META_ROOT_NODE = namehash.hash(META_ROOT_LABEL);
const META_LABEL = "meta";
// contracts setup
const CONTRACTS_LABEL = "contract";
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`
const CONTRACTS_NODE = namehash.hash(CONTRACTS_ROOT_LABEL);
const REGISTRAR_LABEL = "komgoregistrar";
const REGISTRAR_NODE = namehash.hash(`${REGISTRAR_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const META_RESOLVER_LABEL = "komgometaresolver";
const META_RESOLVER_NODE = namehash.hash(`${META_RESOLVER_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const KOMGO_RESOLVER_LABEL = "komgoresolver";
const KOMGO_RESOLVER_NODE = namehash.hash(`${KOMGO_RESOLVER_LABEL}.${CONTRACTS_ROOT_LABEL}`)

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    console.log(`Starting Migrations 1`)
    console.log(`Deploying ENSRegistry`)
    await deployer.deploy(ENSRegistry);
    const ens = await ENSRegistry.deployed();
    await deployer.deploy(Sha3AddressLib);
    await deployer.link(Sha3AddressLib, KomgoMetaResolver);
    await deployer.deploy(KomgoMetaResolver);
    console.log(`Deploying KomgoMetaResolver`)
    const resolver = await deployer.deploy(KomgoResolver);
    resolver.initialise(ens.address)
    await deployer.deploy(
      KomgoRegistrar,
      ENSRegistry.address,
      KOMGO_ROOT_NODE,
      META_ROOT_NODE,
      KomgoMetaResolver.address,
      KomgoMetaResolver.address
    );
    console.log(`Deploying KomgoRegistrar`)
    const registrar = await KomgoRegistrar.deployed();

    // komgo domain
    console.log(`Setting root komgo domain`)
    await ens.setSubnodeOwner("0x0", web3Utils.sha3(KOMGO_ROOT_LABEL), accounts[0]);

    // meta.komgo domain
    console.log(`Setting meta.komgo domain`)
    await ens.setSubnodeOwner(
      KOMGO_ROOT_NODE,
      web3Utils.sha3(META_LABEL),
      registrar.address
    );
    console.log(`Setting reverse domain`)
    await ens.setSubnodeOwner("0x0", web3Utils.sha3(REVERSE_LABEL), accounts[0]);
    console.log(`Setting addr.reverse domain`)
    await ens.setSubnodeOwner(namehash.hash(REVERSE_LABEL), web3Utils.sha3(ADDR_LABEL), accounts[0]);
    await ens.setOwner(namehash.hash(ADDR_REVERSE_LABEL), KomgoMetaResolver.address);
    // initial contracts setup
    console.log(`Setting contracts.komgo domain`)
    await ens.setSubnodeOwner(KOMGO_ROOT_NODE, web3Utils.sha3(CONTRACTS_LABEL), accounts[0]);
    // KomgoRegistrar
    console.log(`Setting komgoregistrar.contracts.komgo domain`)
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(REGISTRAR_LABEL), accounts[0]);
    console.log(`Setting komgoregistrar properties in resolver`)
    await ens.setResolver(REGISTRAR_NODE, resolver.address);
    await resolver.setAddr(REGISTRAR_NODE, KomgoRegistrar.address);
    await resolver.setABI(REGISTRAR_NODE, 1, KomgoRegistrar.abi);
    // KomgoMetaResolver
    console.log(`Setting KomgoMetaResolver properties in resolver`)
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(META_RESOLVER_LABEL), accounts[0]);
    await ens.setResolver(META_RESOLVER_NODE, resolver.address);
    await resolver.setAddr(META_RESOLVER_NODE, KomgoMetaResolver.address);
    // have to compress into zlib (ID will be 2 as per EIP-634) because ABI is too big at this point
    /** 
     * Follow this to uncompress from blockchain: 
     * 
     * const abiCompressed = await resolver.ABI(META_RESOLVER_NODE,2);
     * const abi = abiCompressed[1];
     * abiAscii = web3Utils.toAscii(abi);
     * const bufferAbi = Buffer.from(abiAscii, 'hex');
     * const abi1 = JSON.parse(pako.inflate(bufferAbi, {to: 'string'}));
     */
    const compressed = pako.deflate(JSON.stringify(KomgoMetaResolver.abi));
    const compressedHex = Buffer.from(compressed).toString('hex');
    await resolver.setABI(META_RESOLVER_NODE, 2, compressedHex);

    console.log(`Setting KomgoResolver properties in resolver`)
    await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(KOMGO_RESOLVER_LABEL), accounts[0]);
    await ens.setResolver(KOMGO_RESOLVER_NODE, KomgoResolver.address);
    await resolver.setAddr(KOMGO_RESOLVER_NODE, KomgoResolver.address);
    await resolver.setABI(KOMGO_RESOLVER_NODE, 1, KomgoResolver.abi);

    // komgo node owner is registrar
    await ens.setOwner(KOMGO_ROOT_NODE, registrar.address);
    fs.writeFileSync('/tmp/address.txt', ens.address);
  });
};
