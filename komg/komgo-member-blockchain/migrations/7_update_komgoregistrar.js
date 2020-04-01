const KomgoRegistrar = artifacts.require("./KomgoRegistrar.sol");
const KomgoMetaResolverProxy = artifacts.require("KomgoMetaResolverProxy")

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        console.log(`Getting meta resolver and registrar`);
        const metaResolver = await KomgoMetaResolverProxy.deployed()
        console.log(`MetaResolverAddress=${metaResolver.address}`);
        const registrar = await KomgoRegistrar.deployed();
        console.log(`KomgoRegistrar=${registrar.address}`);
        await registrar.setMetaResolverAddress(metaResolver.address);
    });
};
