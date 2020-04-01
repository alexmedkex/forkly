const namehash = require("eth-ens-namehash");
const web3Utils = require("web3-utils");
const pako = require('pako');

const ENSRegistry = artifacts.require("./ENSRegistry.sol");
const KomgoRegistrar = artifacts.require("./KomgoRegistrar.sol");
const KomgoMetaResolver = artifacts.require("./KomgoMetaResolver.sol");
const KomgoResolver = artifacts.require("./KomgoResolver.sol");
const Sha3AddressLib = artifacts.require("./Sha3AddressLib.sol");

const KOMGO_ROOT_LABEL = "komgo";
const REVERSE_LABEL = "reverse";
const ADDR_LABEL = "addr";

const CONTRACTS_LABEL = "contract";
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`

const META_RESOLVER_LABEL = "komgometaresolver";
const META_RESOLVER_NODE = namehash.hash(`${META_RESOLVER_LABEL}.${CONTRACTS_ROOT_LABEL}`)

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        console.log(`Migrations 3 skipped`)
        const compressed = pako.deflate(JSON.stringify(KomgoMetaResolver.abi));
        const compressedHex = Buffer.from(compressed).toString('hex');
        // check that meta resolver has changes
        const resolver = await KomgoResolver.deployed();
        console.log("Resolver address", resolver.address);

        const abi = await resolver.ABI(META_RESOLVER_NODE, 2);
        if (compressedHex !== abi[1]) {
            const ens = await ENSRegistry.deployed();

            //link sha3lib
            await deployer.deploy(Sha3AddressLib);
            await deployer.link(Sha3AddressLib, KomgoMetaResolver);

            //deply new instance
            const newMetaResolver = await deployer.deploy(KomgoMetaResolver);
            console.log("newMetaResolver address", newMetaResolver.address);

            //update resolver with new meta resolver
            await resolver.setAddr(META_RESOLVER_NODE, newMetaResolver.address);
            await resolver.setABI(META_RESOLVER_NODE, 2, compressedHex);

            //update registrar with new meta resolver address
            const registrar = await KomgoRegistrar.deployed();
            await registrar.setMetaResolverAddress(newMetaResolver.address);

            //update new meta resolver address in ens
            await ens.setSubnodeOwner(namehash.hash(REVERSE_LABEL), web3Utils.sha3(ADDR_LABEL), newMetaResolver.address);

        }
    });
};
