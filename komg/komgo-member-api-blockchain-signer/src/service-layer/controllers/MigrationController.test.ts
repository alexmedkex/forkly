import 'jest'
import 'reflect-metadata'
import VaultClient from '../../infrastructure/vault/VaultClient'
import { MigrationController } from '../controllers/MigrationController'
import OneTimeSigner from '../../business-layer/one-time-key/OneTimeSigner'
import Web3Utils from '../../business-layer/transactions/Web3Utils'
import AddrIndexDataAgent from '../../data-layer/data-agents/AddrIndexDataAgent'
import KeyMigration from '../../business-layer/migration/KeyMigration'

const mockWeb3 = {
  utils: {
    toBN: jest.fn(),
    toWei: jest.fn(),
    sha3: jest.fn()
  },
  eth: {
    personal: {
      importRawKey: jest.fn(),
      unlockAccount: jest.fn()
    },
    getBlock: jest.fn(),
    getBalance: jest.fn(),
    sendTransaction: jest.fn(),
    getAccounts: jest.fn().mockReturnValue([])
  }
}

const vaultClient: VaultClient = jest.genMockFromModule('../../infrastructure/vault/VaultClient')
const keyMigration: KeyMigration = jest.genMockFromModule('../../business-layer/migration/KeyMigration')

let mockWeb3Utils: jest.Mocked<Web3Utils>
let mockAddrIndexDataAgent: jest.Mocked<AddrIndexDataAgent>

const mnemonic: string = 'river click crumble creek pluck trash clip hunt elite worth sugar grid above ripple moon'

describe('MigrationController', () => {
  let controller: MigrationController

  beforeEach(async () => {
    const oneTimeSigner: OneTimeSigner = new OneTimeSigner(
      mockWeb3 as any,
      mockWeb3Utils as any,
      mockAddrIndexDataAgent as any,
      vaultClient,
      undefined
    )
    controller = new MigrationController(oneTimeSigner, vaultClient, keyMigration)
  })

  it('move mnemonic to vault', async () => {
    vaultClient.writeKVSecret = jest.fn()
    expect(controller.migrate()).resolves.toBeDefined()
  })

  it('throws internal exception if fails to move into vault', async () => {
    vaultClient.writeKVSecret = jest.fn(() => {
      throw new Error()
    })

    expect(controller.migrate()).rejects.toThrow()
  })
})
