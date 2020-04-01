import 'reflect-metadata'
import { IEthPubKeyAgent } from '../../data-layer/data-agents/IEthPubKeyAgent'
import { ITransactionSigner } from '../transaction-signer/ITransactionSigner'
import EthPubKeyUseCase from './EthPubKeyUseCase'
import { NewEthPubKey } from '../../data-layer/models/NewEthPubKey'
import { TransactionData } from '../../data-layer/models/TransactionData'

const ADD_KEY_DATA = '0x000'
const REVOKE_KEY_DATA = '0x001'
const TX_DATA = '0x003'
const CONTRACT_ADDRESS = '0x123456'
const genericError = new Error('Error: something went wrong')

const getAddEthPubKeyTxDataMock: MockInstance = jest.fn(() => {
  return Promise.resolve(new TransactionData(CONTRACT_ADDRESS, ADD_KEY_DATA))
})
const getRevokeEthPubKeyTxDataMock: MockInstance = jest.fn(() => {
  return Promise.resolve(new TransactionData(CONTRACT_ADDRESS, REVOKE_KEY_DATA))
})
const sendTransactionMock: MockInstance = jest.fn(() => {
  return Promise.resolve({ transactionHash: TX_DATA })
})

const mockEthPubKeyAgent: IEthPubKeyAgent = {
  getAddEthPubKeyTxData: getAddEthPubKeyTxDataMock,
  getRevokeEthPubKeyTxData: getRevokeEthPubKeyTxDataMock,
  getEthPubKey: undefined
}

const mockTransactionSigner: ITransactionSigner = {
  sendTransaction: sendTransactionMock
}

describe('Execute transaction', () => {
  let ethPubKeyUseCase
  let newEthPubKey

  beforeEach(() => {
    ethPubKeyUseCase = new EthPubKeyUseCase(mockEthPubKeyAgent, mockTransactionSigner)
    newEthPubKey = new NewEthPubKey('low', 'high', 100)
  })

  it('should successfully add ethereum public key', async () => {
    const data = await ethPubKeyUseCase.addEthPubKey('com.komgo', newEthPubKey)

    expect(sendTransactionMock).toHaveBeenCalledWith({ to: CONTRACT_ADDRESS, data: ADD_KEY_DATA })
    expect(data).toEqual(TX_DATA)
  })

  it('should successfully revoke ethereum public key', async () => {
    const data = await ethPubKeyUseCase.revokeEthPubKey('com.komgo', newEthPubKey)

    expect(sendTransactionMock).toHaveBeenCalledWith({ to: CONTRACT_ADDRESS, data: REVOKE_KEY_DATA })
    expect(data).toEqual(TX_DATA)
  })

  it('should fail when adding ethereum public key if getting the payload data fails', async () => {
    getAddEthPubKeyTxDataMock.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyUseCase.addEthPubKey('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toEqual(genericError)
  })

  it('should fail when revoking ethereum public key if getting the payload data fails', async () => {
    getRevokeEthPubKeyTxDataMock.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyUseCase.revokeEthPubKey('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toEqual(genericError)
  })

  it('should fail when adding ethereum public key if fails to send the transaction', async () => {
    getAddEthPubKeyTxDataMock.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyUseCase.addEthPubKey('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toEqual(genericError)
  })

  it('should fail when revoking ethereum public key if fails to send the transaction', async () => {
    getRevokeEthPubKeyTxDataMock.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyUseCase.revokeEthPubKey('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toEqual(genericError)
  })
})
