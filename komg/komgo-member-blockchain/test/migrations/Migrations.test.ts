import { Migrations } from "../../scripts/migrations/Migrations";
import { ENSContracts, ContractType } from "../../scripts/migrations/ENSContracts";
import { ENSRegistryInstance } from "../../types/contracts";
import executeCommand from "./utils/executeCommand";

const ENSRegistry = artifacts.require("ENSRegistry")
const KomgoMetaResolver = artifacts.require("KomgoMetaResolver");

describe("Migrations tests", () => {
    let ens: ENSRegistryInstance;
    let ensContractsInstance: ENSContracts;
    let migrationsInstance: Migrations;

    beforeEach(async () => {
        ens = await ENSRegistry.deployed()
        console.log("ENS ADDRESS", ens.address)
        ensContractsInstance = new ENSContracts(ens.address);
        console.log("ENS INSTANCE", ensContractsInstance)
        migrationsInstance = new Migrations(ensContractsInstance);
    })

    describe("restore()", () => {
        const defaultVersionToSetAsCompleted = 2;

        beforeEach(async () => {
            await migrationsInstance.restore(defaultVersionToSetAsCompleted)
        })

        it("should be defined", async () => {
            assert.isDefined(migrationsInstance);
        })

        it("should deploy the migrations contract", async () => {
            const migrationsContractDeployed = await ensContractsInstance.getMigrationsInstance();

            assert.isDefined(migrationsContractDeployed);
            assert.isDefined(migrationsContractDeployed.address);
            assert.isNotEmpty(migrationsContractDeployed.address);
        })

        it("should deploy set last completed migration to version 2", async () => {
            const migrationsContractDeployed = await ensContractsInstance.getMigrationsInstance();
            const last_completed_migration = await migrationsContractDeployed.last_completed_migration();
            const expectedLastCompletedMigrationNumber = 2;

            assert.isDefined(last_completed_migration);
            assert.isNumber(last_completed_migration.toNumber());
            assert.equal(last_completed_migration.toNumber(), expectedLastCompletedMigrationNumber);
        })

        it("should deploy set last completed migration to version 4", async () => {
            const anotherVersionToSetAsCompleted = 4;
            await migrationsInstance.restore(anotherVersionToSetAsCompleted)

            const migrationsContractDeployed = await ensContractsInstance.getMigrationsInstance();
            const last_completed_migration = await migrationsContractDeployed.last_completed_migration();

            assert.isDefined(last_completed_migration);
            assert.isNumber(last_completed_migration.toNumber());
            assert.equal(last_completed_migration.toNumber(), anotherVersionToSetAsCompleted);
        })
    })

    describe("loadAll()", () => {
        it("should load all contract artifacts properly", async () => {

            const deleteBuildFolderCommand = "npx del-cli build";
            const truffleCompileCommand = "npx truffle compile";

            await executeCommand(deleteBuildFolderCommand);
            await executeCommand(truffleCompileCommand);

            await migrationsInstance.loadAll();

            assert.isDefined(await KomgoMetaResolver.deployed());
            assert.isNotEmpty(await KomgoMetaResolver.deployed());
        })
    })

    describe("getInstance()", () => {
        it("should get an instance for Migration", async () => {
            const instance = migrationsInstance.getInstance(ContractType.Migration);

            assert.isDefined(instance);
        })

        it("should get an instance for PermissionChecker", async () => {
            const instance = migrationsInstance.getInstance(ContractType.PermissionChecker);

            assert.isDefined(instance);
        })

        it("should get an instance for KomgoMetaResolverProxy", async () => {
            const instance = migrationsInstance.getInstance(ContractType.KomgoMetaResolverProxy);

            assert.isDefined(instance);
        })

        it("should get an instance for ContractLibrary", async () => {
            const instance = migrationsInstance.getInstance(ContractType.ContractLibrary);

            assert.isDefined(instance);
        })

        it("should get an instance for DocumentRegistry", async () => {
            const instance = migrationsInstance.getInstance(ContractType.DocumentRegistry);

            assert.isDefined(instance);
        })

        it("should get an instance for ENSRegistry", async () => {
            const instance = migrationsInstance.getInstance(ContractType.ENSRegistry);

            assert.isDefined(instance);
        })

        it("should get an instance for KomgoMetaResolver", async () => {
            const instance = migrationsInstance.getInstance(ContractType.KomgoMetaResolver);

            assert.isDefined(instance);
        })

        it("should get an instance for KomgoRegistrar", async () => {
            const instance = migrationsInstance.getInstance(ContractType.KomgoRegistrar);

            assert.isDefined(instance);
        })

        it("should get an instance for KomgoResolver", async () => {
            const instance = migrationsInstance.getInstance(ContractType.KomgoResolver);

            assert.isDefined(instance);
        })
    })

    describe("getAddress()", () => {
        it("should get an address for Migration", async () => {
            const address = await migrationsInstance.getAddress(ContractType.Migration);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for PermissionChecker", async () => {
            const address = await migrationsInstance.getAddress(ContractType.PermissionChecker);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for KomgoMetaResolverProxy", async () => {
            const address = await migrationsInstance.getAddress(ContractType.KomgoMetaResolver);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for ContractLibrary", async () => {
            const address = await migrationsInstance.getAddress(ContractType.ContractLibrary);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for DocumentRegistry", async () => {
            const address = await migrationsInstance.getAddress(ContractType.DocumentRegistry);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for ENSRegistry", async () => {
            const address = await migrationsInstance.getAddress(ContractType.ENSRegistry);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for KomgoMetaResolver", async () => {
            const address = await migrationsInstance.getAddress(ContractType.KomgoMetaResolver);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for KomgoRegistrar", async () => {
            const address = await migrationsInstance.getAddress(ContractType.KomgoRegistrar);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })

        it("should get an address for KomgoResolver", async () => {
            const address = await migrationsInstance.getAddress(ContractType.KomgoResolver);

            assert.isDefined(address);
            assert.isNotEmpty(address);
        })
    })
})