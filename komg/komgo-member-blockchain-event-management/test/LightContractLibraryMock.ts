import { keccak256 } from 'web3-utils'

import { extractCompiledBytecode } from '../src/util/extractCompiledBytecode'

import DeactivatedContract from './contracts/TestContract.json'
import ParamsContract from './contracts/TestContract3.json'
import TestContract from './contracts/TestContract4.json'
import ContractCastContract from './contracts/TestContract5.json'

export const TEST_CONTRACT_NAME = 'TestContract'
const DEACTIVATED_CONTRACT_NAME = 'DeactivatedContract'
const PARAMS_CONTRACT_NAME = 'ParamsContract'
const CONTRACT_CAST_CONTRACT_NAME = 'ContractCastContract'

const TEST_CONTRACT_CREATE_EVENT_SIG = 'ContractCreated(address)'

// soliditySha3 is used inside of solidity code and keccak256 is used outside (like hashing the bytecode)
const DeactivatedContractBytecode = extractCompiledBytecode(DeactivatedContract.bytecode)
const DeactivatedContractBytecodeHash = keccak256(DeactivatedContractBytecode)

const TestContractBytecode = extractCompiledBytecode(TestContract.bytecode)
const TestContractBytecodeHash = keccak256(TestContractBytecode)

const ParamsContractBytecode = extractCompiledBytecode(ParamsContract.bytecode)
const ParamsContractBytecodeHash = keccak256(ParamsContractBytecode)

const ContractCastContractBytecode = extractCompiledBytecode(ContractCastContract.bytecode)
const ContractCastContractBytecodeHash = keccak256(ContractCastContractBytecode)

export default {
  byName: {
    [TEST_CONTRACT_NAME]: {
      defaultVersion: 0,
      versions: {
        0: TestContractBytecodeHash
      }
    },
    [DEACTIVATED_CONTRACT_NAME]: {
      defaultVersion: 0,
      versions: {
        0: DeactivatedContractBytecodeHash
      }
    },
    [PARAMS_CONTRACT_NAME]: {
      defaultVersion: 0,
      versions: {
        0: ParamsContractBytecodeHash
      }
    },
    [CONTRACT_CAST_CONTRACT_NAME]: {
      defaultVersion: 0,
      versions: {
        0: ContractCastContractBytecodeHash
      }
    }
  },
  byBytecodeHash: {
    [TestContractBytecodeHash]: {
      name: TEST_CONTRACT_NAME,
      version: 0,
      abi: TestContract.abi,
      bytecode: TestContractBytecode,
      createEventSigHash: keccak256(TEST_CONTRACT_CREATE_EVENT_SIG),
      activated: true // Contract to test success cases
    },
    [DeactivatedContractBytecodeHash]: {
      name: DEACTIVATED_CONTRACT_NAME,
      version: 0,
      abi: DeactivatedContract.abi,
      bytecode: DeactivatedContractBytecode,
      createEventSigHash: keccak256(TEST_CONTRACT_CREATE_EVENT_SIG),
      activated: false // Contract to test failure cases
    },
    [ParamsContractBytecodeHash]: {
      name: PARAMS_CONTRACT_NAME,
      version: 0,
      abi: ParamsContract.abi,
      bytecode: ParamsContractBytecode,
      createEventSigHash: keccak256(TEST_CONTRACT_CREATE_EVENT_SIG),
      activated: true // Contract to test success cases with params
    },
    [ContractCastContractBytecodeHash]: {
      name: CONTRACT_CAST_CONTRACT_NAME,
      version: 0,
      abi: ContractCastContract.abi,
      bytecode: ContractCastContractBytecode,
      createEventSigHash: keccak256(TEST_CONTRACT_CREATE_EVENT_SIG),
      activated: true // Contract to test contract cast events
    }
  },
  castEventSigHash: keccak256('CastEvent(string,address,int8)')
}
