import 'jest'
import 'reflect-metadata'
import { Web3Wrapper } from '@komgo/blockchain-access'

import { ICreateEthKeyRequest } from '../../src/service-layer/request/key-manage/ICreateEthKeyRequest'

import IntegrationEnvironment from './utils/IntegrationEnvironment'

// to allow time for RabbitMQ to start
jest.setTimeout(90000)

const ethereumAccount1 = {
  address: '0x581193BC609fC4a01DCD72c6Ab8300685200446E',
  privateKey: '0xe9b1863f941f2fce49979beb596edbc3153c2ad13a8f23f429920e758d471aaa',
  publicKey:
    '21430028ac8fbb828b5b5067b3954b890de428c20b92fff7f0775968b57aa1693b7fd3a3ae3c7d13c7d6c49200537b3443cf5947b35924515afe75bf11895600',
  publicKeyCompressed: '0221430028ac8fbb828b5b5067b3954b890de428c20b92fff7f0775968b57aa169'
}

const ethereumAccount2 = {
  address: '0x52284af2486573b37049c152e8e099456598E656',
  privateKey: '0x6034dd182adc717d806b144e2861b6e91fe4dec2bc9df60931d2b85d78573e16',
  publicKey:
    'cb3d3cdef106282f46d9918384e898423fcf6c5e07496105e9d5b79f1891fb780b7c812918f5abc67b1d4bd0647b5c16206dcc59a0b67532358d86673ecdfe5f',
  publicKeyCompressed: '03cb3d3cdef106282f46d9918384e898423fcf6c5e07496105e9d5b79f1891fb78'
}

// TODO: After having modified CompanyKeyProvider, rewrite these tests so they do not depend on previous state by deleting the DB
// betweem each test. At the moment CompanyKeyProvider stores the keys in memory, making it impossible to clear the state between states
// without restarting the entire server.

/**
 * This integration test uses RabbitMQ, MongoDB and Quorum real containers.
 */
describe('KeyManageController integration test', () => {
  let iEnv: IntegrationEnvironment
  const quorumHost = 'localhost'
  const quorumNode1Port = '22001'

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.beforeAll()
  })

  beforeEach(async () => {
    const web3Wrapper = new Web3Wrapper(quorumHost, quorumNode1Port)
    await iEnv.beforeEach(web3Wrapper.web3Instance)
    // Set this AFTER starting the server otherwise it won't start.
    process.env.ETH_KEYSTORE_PASSPHRASE = 'eth_passphrase'
  })

  /**
   * Given:
   * No payload is sent to eth endpoint
   *
   * When:
   * ethereum keysare not defined, but the ENV variable for passphrase is
   *
   * Then:
   * random keys are created
   */
  it('should create a new eth key successfully if ALL optional flags are missing (overwrite, key and passphrase)', async () => {
    const { data } = await iEnv.postAPISigner('key-manage/eth')

    expect(data.address).toBeDefined()
    expect(data.publicKey).toBeDefined()
    expect(data.publicKeyCompressed).toBeDefined()
  })

  /**
   * Given:
   * A private key, overwrite flag of false and passphrase is sent to the postApiSigner
   *
   * When:
   * no keys have been set yet
   *
   * Then:
   * the address, publickey and publickeycompressed match expected account based on on the privatekey
   */
  it('should create a new eth key successfully if all optional flags are set', async () => {
    const ethKey: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase2',
      key: ethereumAccount1.privateKey,
      overwrite: false
    }

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey)

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  /**
   * Given:
   * A private key and overwrite flag of false is sent to the postApiSigner
   *
   * When:
   * no keys have been set yet, but the ENV variable for passphrase is
   *
   * Then:
   * the address, publickey and publickeycompressed match expected account based on on the privatekey
   */
  it('should create a new eth key successfully if optional flag is missing (passphrase)', async () => {
    const ethKey: ICreateEthKeyRequest = {
      key: ethereumAccount1.privateKey,
      overwrite: false
    }

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey)

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  /**
   * Given:
   * A private key and overwrite flag of false is sent to the postApiSigner
   *
   * When:
   * no keys have been set yet
   *
   * Then:
   * the address, publickey and publickeycompressed match expected account based on on the privatekey
   */
  it('should create a new eth key successfully if optional flag is missing (overwrite)', async () => {
    const ethKey: ICreateEthKeyRequest = {
      key: ethereumAccount1.privateKey,
      passphrase: 'eth_passphrase2'
    }

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey)

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  /**
   * Given:
   * A private key and overwrite flag of true is sent to the postApiSigner
   *
   * When:
   * no keys have been set yet, but the ENV variable for passphrase is
   *
   * Then:
   * the address, publickey and publickeycompressed match expected account based on on the privatekey
   */
  it('should create a new eth key successfully if optional flags are missing (overwrite and passphrase)', async () => {
    const ethKey: ICreateEthKeyRequest = {
      key: ethereumAccount1.privateKey
    }

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey)

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  /**
   * Given:
   * An ethereum key is set
   *
   * When:
   * the overwrite flag is set
   *
   * Then:
   * the address, publickey and publickeycompressed are overwritten successfuly
   */
  it('should overwrite the ethereum account successfully', async () => {
    const ethKey1: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase2',
      key: ethereumAccount1.privateKey,
      overwrite: false
    }

    await iEnv.postAPISigner('key-manage/eth', ethKey1)

    const ethKey2: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase5',
      key: ethereumAccount2.privateKey,
      overwrite: true
    }

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey2)

    expect(data.address).toEqual(ethereumAccount2.address)
    expect(data.publicKey).toEqual(ethereumAccount2.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount2.publicKeyCompressed)
  })

  /**
   * Given:
   * An ethereum key is set
   *
   * When:
   * the overwrite flag is not set
   *
   * Then:
   * the address, publickey and publickeycompressed are not overwritten and the first account is returned
   */
  it('should not overwrite the ethereum account', async () => {
    const ethKey1: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase2',
      key: ethereumAccount1.privateKey,
      overwrite: false
    }

    await iEnv.postAPISigner('key-manage/eth', ethKey1)

    const ethKey2: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase5',
      key: ethereumAccount2.privateKey,
      overwrite: false
    }

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey2)

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  /**
   * Given:
   * An ethereum key is set
   *
   * When:
   * the overwrite flag is set to false and the same account added again
   *
   * Then:
   * the endpoint should return the ethereumAccount1
   */
  it('should return account if the same ethereum account added twice', async () => {
    const ethKey1: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase2',
      key: ethereumAccount1.privateKey,
      overwrite: false
    }

    await iEnv.postAPISigner('key-manage/eth', ethKey1)

    const { data } = await iEnv.postAPISigner('key-manage/eth', ethKey1)

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  /**
   * Given:
   * No ethereum key has been set
   *
   * When:
   * eth/public-key is called
   *
   * Then:
   * it should return a 404 error with sensible message
   */
  it('should return 404 if no eth key is set', async () => {
    let errorResponse = null

    try {
      await iEnv.getAPISigner('key-manage/eth/public-key')
    } catch (error) {
      errorResponse = error.response
    }

    expect(errorResponse.data.message).toEqual('ETH key missing')
    expect(errorResponse.status).toEqual(404)
  })

  /**
   * Given:
   * An ethereum key has been set
   *
   * When:
   * eth/public-key is called
   *
   * Then:
   * it should return that key
   */
  it('should return public key if one is set', async () => {
    const ethKey: ICreateEthKeyRequest = {
      passphrase: 'eth_passphrase2',
      key: ethereumAccount1.privateKey,
      overwrite: false
    }

    await iEnv.postAPISigner('key-manage/eth', ethKey)

    const { data } = await iEnv.getAPISigner('key-manage/eth/public-key')

    expect(data.address).toEqual(ethereumAccount1.address)
    expect(data.publicKey).toEqual(ethereumAccount1.publicKey)
    expect(data.publicKeyCompressed).toEqual(ethereumAccount1.publicKeyCompressed)
  })

  // TODO: MM - Write integration tests for the following:
  // POST /key-manage/rsa route tests
  // GET /key-manage/rsa/public-key route tests
  // eth - Handle expected error when no passphrase is set (not even ENV)?

  afterEach(async () => {
    // Drop collections
    await iEnv.cleanKeyDataCollection()
    await iEnv.afterEach()
    delete process.env.ETH_KEYSTORE_PASSPHRASE
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })
})
