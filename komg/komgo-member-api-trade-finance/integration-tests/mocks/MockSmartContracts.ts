import { abi, bytecode } from '../sampledata/lcSmartContractData'
import { amendmentsAbi, amendmentsBytecode } from '../sampledata/lcAmendmentSmartContractData'
import { lcPresentationSmartContract } from '../sampledata/lcPresentationSmartContract'

export default class SmartContractInfo {
  static LC = {
    ABI: abi,
    ByteCode: bytecode
  }

  static LCAmendment = {
    ABI: amendmentsAbi,
    ByteCode: amendmentsBytecode
  }

  static LCPresentation = lcPresentationSmartContract
}
