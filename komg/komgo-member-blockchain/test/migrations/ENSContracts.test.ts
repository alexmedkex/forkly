import { ENSContracts } from "../../scripts/migrations/ENSContracts";
import { ENSRegistryInstance } from "../../types/contracts";

const ENSRegistry = artifacts.require("ENSRegistry")

contract("ENSContracts", (accounts: string[]) => {

    let ens: ENSRegistryInstance;
    let ensContractsInstance: ENSContracts;

    beforeEach(async () => {
        ens = await ENSRegistry.deployed()
        ensContractsInstance = new ENSContracts(ens.address);
    })

    describe("ENS Deployed", async () => {
        it("should have ENS defined", () => {
            assert.isDefined(ens)
            assert.isNotEmpty(ens.address);
        })
    })
    describe("getDefaultAccount", () => {
        it("should get the default account", async () => {
            const defaultAccountObtained = ensContractsInstance.getDefaultAccount();

            assert.equal(defaultAccountObtained, accounts[0]);
        })
    })

    describe("deployMigrations", () => {
        it("should deploy the migrations contract", async () => {
            const migrations = await ensContractsInstance.deployMigrations();

            assert.isDefined(migrations);
            assert.isNotEmpty(migrations.address);
        })
    })

    describe("getENSRegistry", () => {
        it("should get the ENSRegistry instance", async () => {
            const ensRegistry = await ensContractsInstance.getENSRegistry();

            assert.isDefined(ensRegistry);
            assert.isNotEmpty(ensRegistry.address);
        })
    })

    describe("getNetworkId", () => {
        it("should get the network id", async () => {
            const networkId = await ensContractsInstance.getNetworkId();

            assert.isDefined(networkId);
            assert.isNotEmpty(networkId);
        })
    })

    describe("getMigrationsInstance", () => {
        beforeEach(async () => {
            const migrationsContractInstance = await ensContractsInstance.deployMigrations();

            await ensContractsInstance.setMigrationsResolver(migrationsContractInstance);
        })

        it("should get the migrations instance", async () => {
            const migrations = await ensContractsInstance.getMigrationsInstance();

            assert.isDefined(migrations);
            assert.isNotEmpty(migrations.address);
        })
    })

    describe("getKomgoResolverInstance", () => {
        it("should get the komgo resolver instance", async () => {
            const komgoResolver = await ensContractsInstance.getKomgoResolverInstance();

            assert.isDefined(komgoResolver);
            assert.isNotEmpty(komgoResolver.address);
        })
    })

    describe("getKomgoRegistrarInstance", () => {
        it("should get the komgo registrar instance", async () => {
            const komgoRegistrar = await ensContractsInstance.getKomgoRegistrarInstance();

            assert.isDefined(komgoRegistrar);
            assert.isNotEmpty(komgoRegistrar.address);
        })
    })

    describe("getContractLibraryInstance", () => {
        it("should get the contract library instance", async () => {
            const contractLibrary = await ensContractsInstance.getContractLibraryInstance();

            assert.isDefined(contractLibrary);
            assert.isNotEmpty(contractLibrary.address);
        })
    })

    describe("getKomgoMetaResolverInstance", () => {
        it("should get the komgo meta resolver instance", async () => {
            const komgoMetaResolver = await ensContractsInstance.getKomgoMetaResolverInstance();

            assert.isDefined(komgoMetaResolver);
            assert.isNotEmpty(komgoMetaResolver.address);
        })
    })

    describe("getDocumentRegistryInstance", () => {
        it("should get document registry instance", async () => {
            const documentRegistry = await ensContractsInstance.getDocumentRegistryInstance();

            assert.isDefined(documentRegistry);
            assert.isNotEmpty(documentRegistry.address);
        })
    })
})