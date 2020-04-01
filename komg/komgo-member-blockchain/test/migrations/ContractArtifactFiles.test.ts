import { ENSRegistryArtifact, KomgoRegistrarArtifact, KomgoMetaResolverArtifact, KomgoResolverArtifact, DocumentRegistryArtifact, MigrationsArtifact, ContractLibraryArtifact } from "../../scripts/migrations/ContractArtifactFiles";

describe("ContractArtifactFiles", () => {
    describe("smart contract json artifacts", () => {
        it("should return the json artifacts", () => {
            assert.isDefined(ENSRegistryArtifact)
            assert.isDefined(KomgoRegistrarArtifact)
            assert.isDefined(KomgoMetaResolverArtifact)
            assert.isDefined(KomgoResolverArtifact)
            assert.isDefined(DocumentRegistryArtifact)
            assert.isDefined(ContractLibraryArtifact)
            assert.isDefined(MigrationsArtifact)
        })
    })
})