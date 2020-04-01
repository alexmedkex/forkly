import SmartContractsInfo from '@komgo/smart-contracts'
import { LCApplicationContract } from './library/LCApplication_1'
import { ContracType } from './library/ContractType'

export const validSmartContracts = [
  {
    name: ContracType.LC,
    contracts: [
      {
        version: 1,
        abi: LCApplicationContract.ABI,
        bytecode: LCApplicationContract.ByteCode,
        activated: true
      },
      {
        version: 2,
        abi: SmartContractsInfo.LC.ABI,
        bytecode: SmartContractsInfo.LC.ByteCode
      }
    ]
  },
  {
    name: ContracType.LCPresentation,
    contracts: [
      {
        version: 1,
        abi: SmartContractsInfo.LCPresentation.ABI,
        bytecode: SmartContractsInfo.LCPresentation.ByteCode,
        activated: true
      }
    ]
  },
  {
    name: ContracType.LCAmendment,
    contracts: [
      {
        version: 1,
        abi: SmartContractsInfo.LCAmendment.ABI,
        bytecode: SmartContractsInfo.LCAmendment.ByteCode,
        activated: true
      }
    ]
  },
  {
    name: ContracType.SBLC,
    contracts: [
      {
        version: 1,
        abi: SmartContractsInfo.SBLC.ABI,
        bytecode: SmartContractsInfo.SBLC.ByteCode,
        activated: true
      }
    ]
  },
  {
    name: ContracType.LetterOfCredit,
    contracts: [
      {
        version: 1,
        abi: SmartContractsInfo.LetterOfCredit.ABI,
        bytecode: SmartContractsInfo.LetterOfCredit.ByteCode,
        activated: true
      }
    ]
  }
]
