import { Web3Wrapper } from '@komgo/blockchain-access'

import { hashMessageWithCallData } from '../../common/HashFunctions'
import { ISBLCContract } from './ISBLCContract'
import { SBLCContract } from './SBLCContract'
import { soliditySha3 } from '../../common/HashFunctions'
import { BlockchainTransactionException } from '../../../exceptions'

const DUMMY_V = '27'
const DUMMY_R = '0x111111'
const DUMMY_S = '0x222222'

describe('SBLCContract', () => {
  let sblcContract: ISBLCContract

  beforeEach(() => {
    sblcContract = new SBLCContract(Web3Wrapper.web3Instance)
  })

  describe('creation', () => {
    it('should create instance', () => {
      expect(sblcContract).toBeDefined()
    })
  })

  describe('getCurrentState', () => {
    it('should get the current state', async () => {
      const instance = sblcContract.instance()
      instance.methods.getCurrentStateId = jest.fn(() => {
        return { call: () => soliditySha3('state1') }
      })

      const result = await sblcContract.getCurrentState()

      expect(result).toEqual(soliditySha3('state1'))
    })

    it('should crash when trying to get the current state', async () => {
      const instance = sblcContract.instance()
      const originalErrorMessage = 'Error!'
      instance.methods.getCurrentStateId = jest.fn(() => {
        throw new Error(originalErrorMessage)
      })
      try {
        const result = await sblcContract.getCurrentState()
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })

  describe('getEncodedABI', () => {
    it('should return the call data of the function', async () => {
      const result = sblcContract.getEncodedABI('issue', '27', '0x111', '0x222', 'LC-1234', 'another', 'addr')

      expect(result).toBeDefined()
    })

    it('should crash when trying to get the call data of an unexisting type', async () => {
      const type = 'nonexisting'
      try {
        const result = await sblcContract.getEncodedABI(type as any, '27', '0x111', '0x222', 'data')
      } catch (error) {
        const message = `Couldn't get a proper handler for ${type} in getEncodedABI`
        expect(error.message).toEqual(message)
      }
    })
  })

  describe('getNonce', () => {
    it('should create get the nonce', async () => {
      const instance = sblcContract.instance()
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })

      const result = await sblcContract.getNonce()

      expect(result).toEqual(10)
    })

    it('should crash when trying to get the nonce', async () => {
      const instance = sblcContract.instance()
      const originalErrorMessage = 'Error!'
      instance.methods.nonce = jest.fn(() => {
        throw new Error(originalErrorMessage)
      })
      try {
        const result = await sblcContract.getNonce()
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })

  describe('instance', () => {
    it('should return an instance of web3', () => {
      const result = sblcContract.instance()

      expect(result).toBeDefined()
    })
  })

  describe('getEncodedDataFromSignatureFor', () => {
    it('should get the encoded data from a signature with comments', () => {
      const sampleSignature =
        '0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa4251c'
      const { v, r, s } = sblcContract.getSignatureParameters(sampleSignature)
      const expectedEncodedCallData = sblcContract
        .instance()
        .methods.issue(v, r, s, '0x0', '1234', 'addr')
        .encodeABI()

      const result = sblcContract.getEncodedDataFromSignatureFor('issue', sampleSignature, '0x0', '1234', 'addr')

      expect(result).toEqual(expectedEncodedCallData)
    })
  })

  describe('getSignatureParameters', () => {
    it('should return get the signature parameters', () => {
      const sampleSignature =
        '0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa4251c'
      const { v, r, s } = sblcContract.getSignatureParameters(sampleSignature)

      expect(v).toEqual(28)
      expect(r).toEqual('0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c')
      expect(s).toEqual('0x7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa425')
    })
  })

  describe('getHashedMessageWithCallDataFor', () => {
    it('should return the hashed message with call data for issue', async () => {
      const expectedNonceValue = 1
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const contract = sblcContract.at(address)
      contract.methods.nonce = jest.fn(() => {
        return { call: () => expectedNonceValue }
      })
      const sampleCallData = sblcContract
        .instance()
        .methods.issue(DUMMY_V, DUMMY_R, DUMMY_S, '0x0', 'LC-1234', 'addr')
        .encodeABI()

      const expectedResult = hashMessageWithCallData(address, expectedNonceValue, sampleCallData)

      const result = await sblcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234', 'addr')

      expect(result).toEqual(expectedResult)
    })

    it('should return the hashed message with call data for issue with different signatures', async () => {
      const expectedNonceValue = 1
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const contract = sblcContract.at(address)
      contract.methods.nonce = jest.fn(() => {
        return { call: () => expectedNonceValue }
      })
      const sampleCallData = sblcContract
        .instance()
        .methods.issue(DUMMY_V, DUMMY_R, DUMMY_S, '0x0', 'LC-1234', 'addr')
        .encodeABI()

      const anotherSampleCallData = sblcContract
        .instance()
        .methods.issue('28', '0x91919191919191919191919191', '0x76848484848484848484848', '0x0', 'LC-1234', 'addr')
        .encodeABI()

      const expectedResult = hashMessageWithCallData(address, expectedNonceValue, sampleCallData)
      const anotherExpectedResult = hashMessageWithCallData(address, expectedNonceValue, anotherSampleCallData)

      const result = await sblcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234', 'addr')

      expect(result).toEqual(expectedResult)
      expect(result).toEqual(anotherExpectedResult)
      expect(expectedResult).toEqual(anotherExpectedResult)
    })

    it('should handle error correctly when getNonce crash', async () => {
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const instance = sblcContract.at(address)
      instance.methods.nonce = jest.fn(() => {
        throw new Error('Whatever')
      })
      try {
        const result = await sblcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234', 'addr')
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })

    it('should handle error correctly when getEncodedABI crash', async () => {
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const instance = sblcContract.at(address)
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })

      sblcContract.getEncodedABI = jest.fn(() => {
        throw new Error('Whatever')
      })
      try {
        const result = await sblcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234')
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })

    it('should handle error correctly when hashMessageWithCallData crash', async () => {
      const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
      const instance = sblcContract.at(address)
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })
      sblcContract.getEncodedABI = jest.fn(() => {
        return ''
      })
      try {
        const result = await sblcContract.getHashedMessageWithCallDataFor('issue', 1, '0x0', 'LC-1234')
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })
})
