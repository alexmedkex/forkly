import 'reflect-metadata'
import { MockInstance } from 'jest'
import { EthPubKeyController } from './EthPubKeyController'
import { AddEthPubKeyRequest } from '../requests/AddEthPubKeyRequest'
import { RevokeEthPubKeyRequest } from '../requests/RevokeEthPubKeyRequest'
import { IEthPubKeyUseCase } from '../../business-layer/ethpubkey/IEthPubKeyUseCase'
import { NewEthPubKey } from '../../data-layer/models/NewEthPubKey'
import { HttpException } from '@komgo/microservice-config'

const ADD_VALID_TX_HASH = '0xTxHashAdd'
const REVOKE_VALID_TX_HASH = '0xTxHashRevoke'
const genericError = new Error('Error: something went wrong')

const KEY_INDEX = 1

const addEthPubKeyMock: MockInstance = jest.fn(() => {
  return Promise.resolve(ADD_VALID_TX_HASH)
})
const revokeEthPubKeyMock: MockInstance = jest.fn(() => {
  return Promise.resolve(REVOKE_VALID_TX_HASH)
})

const mockAddKeyRequest: AddEthPubKeyRequest = {
  companyEnsDomain: 'company.komgo',
  lowPublicKey: 'ab',
  highPublicKey: 'cd',
  termDate: 1234
}

const mockRevokeKeyRequest: RevokeEthPubKeyRequest = {
  companyEnsDomain: 'companyRevoked.komgo'
}

const mockEthPubKeyUseCase: IEthPubKeyUseCase = {
  addEthPubKey: addEthPubKeyMock,
  revokeEthPubKey: revokeEthPubKeyMock
}

describe('Handling request for adding a new ethereum public key', () => {
  let ethPubKeyController

  beforeEach(() => {
    ethPubKeyController = new EthPubKeyController(mockEthPubKeyUseCase)
  })

  it('should return valid tx', async () => {
    const result = await ethPubKeyController.addEthPubKey(mockAddKeyRequest)

    expect(result.txHash).toEqual(ADD_VALID_TX_HASH)
  })

  it('should throw invalid tx', async () => {
    addEthPubKeyMock.mockImplementation(() => {
      throw genericError
    })

    const result = ethPubKeyController.addEthPubKey(mockAddKeyRequest)

    await result.catch(e => {
      expect(e).toBeInstanceOf(HttpException)
    })
    expect(addEthPubKeyMock).toHaveBeenCalledWith(mockAddKeyRequest.companyEnsDomain, expect.any(NewEthPubKey))
  })
})

describe('Handling request for revoking an ethereum public key', () => {
  let ethPubKeyController

  beforeEach(async () => {
    ethPubKeyController = new EthPubKeyController(mockEthPubKeyUseCase)
  })

  it('should return valid tx', async () => {
    const result = await ethPubKeyController.revokeEthPubKey(KEY_INDEX, mockRevokeKeyRequest)

    expect(result.txHash).toEqual(REVOKE_VALID_TX_HASH)
  })

  it('should throw invalid tx', async () => {
    addEthPubKeyMock.mockImplementation(() => {
      throw genericError
    })

    const result = ethPubKeyController.revokeEthPubKey(KEY_INDEX, mockRevokeKeyRequest)

    await result.catch(e => {
      expect(e).toBeInstanceOf(HttpException)
    })
    expect(revokeEthPubKeyMock).toHaveBeenCalledWith(mockRevokeKeyRequest.companyEnsDomain, KEY_INDEX)
  })
})
