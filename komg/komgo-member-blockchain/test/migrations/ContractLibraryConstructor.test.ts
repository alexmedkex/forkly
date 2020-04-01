import { sha3 } from "web3-utils"
import { ENSContracts } from "../../scripts/migrations/ENSContracts"
import { ContractLibraryInstance, ENSRegistryInstance } from "../../types/contracts"

const ENSRegistry = artifacts.require("ENSRegistry")
const CAST_EVENT_SIGNATURE = "CastEvent(string,address,int8)"

contract("ENSContracts", (accounts: string[]) => {
  let ens: ENSRegistryInstance
  let ensContractsInstance: ENSContracts
  let contractLibrary: ContractLibraryInstance

  beforeEach(async () => {
    ens = await ENSRegistry.deployed()
    ensContractsInstance = new ENSContracts(ens.address)
    contractLibrary = await ensContractsInstance.getContractLibraryInstance()
  })

  describe("contractLibraryInstance", () => {
    it("should return the correct cast event signature hash", async () => {
      const castEventSigHash = await contractLibrary.getCastEventSigHash({ from: accounts[0] })

      assert.equal(castEventSigHash, sha3(CAST_EVENT_SIGNATURE))
    })
  })
})
