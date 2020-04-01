import axios from 'axios'
import { ISignerClient } from '../../src/business-layer/common/ISignerClient'

export class SignerWrapperClient implements ISignerClient {
  async postTransaction(txn: any) {
    const deployViaSignerResult = await axios.post(`http://localhost:3112/v0/one-time-signer/transaction`, txn)
    return deployViaSignerResult.data
  }

  async getKey() {
    const oneTimeKey = await axios.get(`http://localhost:3112/v0/one-time-signer/key`)
    return oneTimeKey
  }

  async sign(hashedFunctionCallData: any) {
    const signedFunctionCallData = await axios.post(`http://localhost:3112/v0/signer/simple-sign`, {
      payload: hashedFunctionCallData
    })
    return signedFunctionCallData
  }
}
