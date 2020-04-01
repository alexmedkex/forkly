import { IWeb3Instance } from '@komgo/blockchain-access'
import 'reflect-metadata'
import TransactionSigner from './TransactionSigner'

const dummyAccount = '0x123'
const dummyData = 'hi'

const sendTxResult = { transactionHash: 'myTransactionHash' }
const web3Instance: IWeb3Instance = {
  eth: {
    sendTransaction: jest.fn(async () => sendTxResult),
    getAccounts: jest.fn(async () => [dummyAccount])
  }
}

describe('The mock transaction signer', () => {
  let signer
  let result
  beforeEach(async () => {
    signer = new TransactionSigner(web3Instance)
    signer.fromAddress = dummyAccount
    result = await signer.sendTransaction({ data: dummyData })
  })
  it('calls sendTransaction', async () => {
    expect(web3Instance.eth.sendTransaction).toHaveBeenCalled()
  })
  it('calls getAccounts', async () => {
    expect(web3Instance.eth.getAccounts).toHaveBeenCalled()
  })

  it('calls sendTransaction with the correct object', async () => {
    expect(web3Instance.eth.sendTransaction).toHaveBeenCalledWith({
      data: dummyData,
      from: dummyAccount,
      gas: 1000000
    })
  })
  it('returns the result from sendRawTransaction', async () => {
    expect(result).toEqual({ txHash: sendTxResult.transactionHash })
  })
})
