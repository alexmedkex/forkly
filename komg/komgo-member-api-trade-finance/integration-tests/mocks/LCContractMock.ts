import { ILCContract } from '../../src/business-layer/blockchain/ILCContract'
import { LCContract } from '../../src/business-layer/blockchain/LCContract'
import { LCActionType } from '../../src/business-layer/blockchain/LCActionType'

export class LCContractMock extends LCContract {
  getEncodedDataFromSignatureFor(type: LCActionType, signature, ...data: string[]) {
    return 'Encoded_data from Signature'
  }

  getEncodedABI(type: LCActionType, v: string, r: string, s: string, ...data: string[]) {
    return 'Encoded ABI Data'
  }
  async getHashedMessageWithCallDataFor(type: LCActionType, ...data: string[]) {
    return 'HASHED_MESSAGE'
  }
}
