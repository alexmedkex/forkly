import { ENSRegistryContract, KomgoRegistrarContract, KomgoMetaResolverContract, PermissionCheckerContract, KomgoResolverContract, DocumentRegistryContract, ContractLibraryContract, MigrationsContract } from "../../scripts/migrations/ContractArtifacts";

describe("ContractArtifact", () => {
    describe("smart contract contract instances", () => {
        it("should get truffle contract instances", () => {
            assert.isDefined(ENSRegistryContract)
            assert.isDefined(KomgoRegistrarContract)
            assert.isDefined(KomgoMetaResolverContract)
            assert.isDefined(PermissionCheckerContract)
            assert.isDefined(KomgoResolverContract)
            assert.isDefined(DocumentRegistryContract)
            assert.isDefined(ContractLibraryContract)
            assert.isDefined(MigrationsContract)
        })
    })
})