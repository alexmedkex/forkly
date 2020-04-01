import { TruffleContract } from "../../scripts/migrations/TruffleContract";
import { ENSRegistryArtifact } from "../../scripts/migrations/ContractArtifactFiles";

describe("Truffle contract", () => {
    describe("Initial call", () => {
        it("should initialise truffle contract properly", () => {
            const instance = TruffleContract(ENSRegistryArtifact)

            assert.isDefined(instance)
        })
    })
})