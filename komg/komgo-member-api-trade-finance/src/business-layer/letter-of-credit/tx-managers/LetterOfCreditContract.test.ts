import { Web3Wrapper } from '@komgo/blockchain-access'

import { soliditySha3 } from '../../common/HashFunctions'

import { ILetterOfCreditContract } from './ILetterOfCreditContract'
import { LetterOfCreditContract } from './LetterOfCreditContract'

import { BlockchainTransactionException } from '../../../exceptions'

const DUMMY_V = '27'
const DUMMY_R = '0x111111'
const DUMMY_S = '0x222222'

describe('LetterOfCreditContract', () => {
  let letterOfCreditContract: ILetterOfCreditContract

  beforeEach(() => {
    letterOfCreditContract = new LetterOfCreditContract(Web3Wrapper.web3Instance)
  })

  describe('creation', () => {
    it('should create instance', () => {
      expect(letterOfCreditContract).toBeDefined()
    })
  })

  describe('getCurrentState', () => {
    it('should get the current state', async () => {
      const instance = letterOfCreditContract.instance()
      instance.methods.getCurrentStateId = jest.fn(() => {
        return { call: () => soliditySha3('state1') }
      })

      const result = await letterOfCreditContract.getCurrentState()

      expect(result).toEqual(soliditySha3('state1'))
    })

    it('should crash when trying to get the current state', async () => {
      const instance = letterOfCreditContract.instance()
      const originalErrorMessage = 'Error!'
      instance.methods.getCurrentStateId = jest.fn(() => {
        throw new Error(originalErrorMessage)
      })
      try {
        const result = await letterOfCreditContract.getCurrentState()
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })

  describe('getEncodedABI', () => {
    // it('should return the call data of the function', async () => {
    //   const result = letterOfCreditContract.getEncodedABI('issue', '27', '0x111', '0x222', 'LC-1234', 'another', 'addr')

    //   expect(result).toBeDefined()
    // })

    it('should crash when trying to get the call data of an unexisting type', async () => {
      const type = 'nonexisting'
      try {
        const result = await letterOfCreditContract.getEncodedABI(type as any, '27', '0x111', '0x222', 'data')
      } catch (error) {
        const message = `Couldn't get a proper handler for ${type} in getEncodedABI`
        expect(error.message).toEqual(message)
      }
    })
  })

  describe('getNonce', () => {
    it('should create get the nonce', async () => {
      const instance = letterOfCreditContract.instance()
      instance.methods.nonce = jest.fn(() => {
        return { call: () => 10 }
      })

      const result = await letterOfCreditContract.getNonce()

      expect(result).toEqual(10)
    })

    it('should crash when trying to get the nonce', async () => {
      const instance = letterOfCreditContract.instance()
      const originalErrorMessage = 'Error!'
      instance.methods.nonce = jest.fn(() => {
        throw new Error(originalErrorMessage)
      })
      try {
        const result = await letterOfCreditContract.getNonce()
      } catch (error) {
        expect(error).toBeInstanceOf(BlockchainTransactionException)
      }
    })
  })

  describe('instance', () => {
    it('should return an instance of web3', () => {
      const result = letterOfCreditContract.instance()

      expect(result).toBeDefined()
    })
  })

  describe('getSignatureParameters', () => {
    it('should return get the signature parameters', () => {
      const sampleSignature =
        '0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa4251c'
      const { v, r, s } = letterOfCreditContract.getSignatureParameters(sampleSignature)

      expect(v).toEqual(28)
      expect(r).toEqual('0x071b5b1c8f5fdc2ac3eb00b84b0371178b3f808e4b3cd89891a289f939060b3c')
      expect(s).toEqual('0x7dcbeaec3a4dae89dd10b94e91e7348fdd1706c89f00da5a79c7787680bfa425')
    })
  })
})
