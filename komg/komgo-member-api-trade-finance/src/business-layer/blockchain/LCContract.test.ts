import { LCContract } from './LCContract'
import { hashMessageWithCallData } from '../common/HashFunctions'
import { ILCContract } from './ILCContract'
import { Web3Wrapper } from '@komgo/blockchain-access'
import { BlockchainTransactionException } from '../../exceptions'

const DUMMY_V = '27'
const DUMMY_R = '0x111111'
const DUMMY_S = '0x222222'

const web3Utils = require('web3-utils')

describe('LCContract', async () => {
  let lcContract: ILCContract

  beforeEach(() => {
    lcContract = new LCContract(Web3Wrapper.web3Instance)
  })

  describe('creation', () => {
    it('should create instance', () => {
      expect(lcContract).toBeDefined()
    })
  })

  describe('getCurrentState', () => {
    it('should get the current state', async () => {
      const instance = lcContract.instance()
      instance.methods.getCurrentStateId = jest.fn(() => {
        return { call: () => web3Utils.utf8ToHex('state1') }
      })

      const result = await lcContract.getCurrentState()

      expect(web3Utils.hexToAscii(result).replace(/\u0000/g, '')).toEqual('state1')
    })

    it('should crash when trying to get the current state', async () => {
      const instance = lcContract.instance()
      const originalErrorMessage = 'Error!'
      instance.methods.getCurrentStateId = jest.fn(() => {
        throw new Error(originalErrorMessage)
      })
      try {
        const result = await lcContract.getCurrentState()
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })

  describe('getEncodedABI', () => {
    it('should return the call data of the function', async () => {
      const result = lcContract.getEncodedABI('issue', '27', '0x111', '0x222', 'LC-1234', 'another')

      expect(result).toBeDefined()
    })

    it('should crash when trying to get the call data of an unexisting type', async () => {
      const type = 'nonexisting'
      try {
        const result = await lcContract.getEncodedABI(type as any, '27', '0x111', '0x222', 'data')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('getNonce', () => {
    it('should get the nonce from the blockchain', async () => {
      const instance = lcContract.instance()
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })

      const result = await lcContract.getNonce()

      expect(result).toEqual(10)
    })

    it('should crash when trying to get the nonce', async () => {
      const instance = lcContract.instance()
      const originalErrorMessage = 'Error!'
      instance.methods.nonce = jest.fn(() => {
        throw new Error(originalErrorMessage)
      })
      try {
        const result = await lcContract.getNonce()
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })

  describe('instance', () => {
    it('should return an instance of web3', () => {
      const result = lcContract.instance()

      expect(result).toBeDefined()
    })
  })

  describe('getEncodedDataFromSignatureFor', () => {
    it('should get the encoded data from a signature with comments', () => {
      const sampleSignature =
        '0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa4251c'
      const { v, r, s } = lcContract.getSignatureParameters(sampleSignature)
      const expectedEncodedCallData = lcContract
        .instance()
        .methods.issue(v, r, s, '0x0', '1234')
        .encodeABI()

      const result = lcContract.getEncodedDataFromSignatureFor('issue', sampleSignature, '0x0', '1234')

      expect(result).toEqual(expectedEncodedCallData)
    })
  })

  describe('getSignatureParameters', () => {
    it('should return get the signature parameters', () => {
      const sampleSignature =
        '0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa4251c'
      const { v, r, s } = lcContract.getSignatureParameters(sampleSignature)

      expect(v).toEqual(28)
      expect(r).toEqual('0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c')
      expect(s).toEqual('0x7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa425')
    })
  })

  describe('getHashedMessageWithCallDataFor', () => {
    it('should return the hashed message with call data for issue', async () => {
      const expectedNonceValue = 1
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const contract = lcContract.at(address)
      contract.methods.nonce = jest.fn(() => {
        return { call: () => expectedNonceValue }
      })
      const sampleCallData = lcContract
        .instance()
        .methods.issue(DUMMY_V, DUMMY_R, DUMMY_S, '0x0', 'LC-1234')
        .encodeABI()

      const expectedResult = hashMessageWithCallData(address, expectedNonceValue, sampleCallData)

      const result = await lcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234')

      expect(result).toEqual(expectedResult)
    })

    it('should return the hashed message with call data for issue with different signatures', async () => {
      const nonceValue = 1
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      lcContract.at(address)

      const sampleCallData = lcContract
        .instance()
        .methods.issue(DUMMY_V, DUMMY_R, DUMMY_S, '0x0', 'LC-1234')
        .encodeABI()

      const anotherSampleCallData = lcContract
        .instance()
        .methods.issue('28', '0x91919191919191919191919191', '0x76848484848484848484848', '0x0', 'LC-1234')
        .encodeABI()

      const expectedResult = hashMessageWithCallData(address, nonceValue, sampleCallData)
      const anotherExpectedResult = hashMessageWithCallData(address, nonceValue, anotherSampleCallData)

      const result = await lcContract.getHashedMessageWithCallDataFor('issue', nonceValue, '0x0', 'LC-1234')

      expect(result).toEqual(expectedResult)
      expect(result).toEqual(anotherExpectedResult)
      expect(expectedResult).toEqual(anotherExpectedResult)
    })

    it('should handle error correctly when getNonce crash', async () => {
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const instance = lcContract.at(address)
      instance.methods.nonce = jest.fn(() => {
        throw new Error('Whatever')
      })
      try {
        const result = await lcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234')
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })

    it('should get the nonce from the blockchain if nonce is undefined', async () => {
      const expectedNonceValue = 1
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const contract = lcContract.at(address)
      contract.methods.nonce = jest.fn(() => {
        return { call: () => expectedNonceValue }
      })
      const sampleCallData = lcContract
        .instance()
        .methods.issue(DUMMY_V, DUMMY_R, DUMMY_S, '0x0', 'LC-1234')
        .encodeABI()

      const expectedResult = hashMessageWithCallData(address, expectedNonceValue, sampleCallData)

      const result = await lcContract.getHashedMessageWithCallDataFor('issue', undefined, '0x0', 'LC-1234')

      expect(result).toEqual(expectedResult)
    })

    it('should handle error correctly when getEncodedABI crash', async () => {
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const instance = lcContract.at(address)
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })

      lcContract.getEncodedABI = jest.fn(() => {
        throw new Error('Whatever')
      })
      try {
        const result = await lcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234')
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })

    it('should handle error correctly when hashMessageWithCallData crash', async () => {
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const instance = lcContract.at(address)
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })
      lcContract.getEncodedABI = jest.fn(() => {
        return ''
      })
      try {
        const result = await lcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234')
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })
})
