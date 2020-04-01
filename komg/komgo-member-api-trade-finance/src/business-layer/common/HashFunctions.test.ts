import { hashMessageWithCallData, hashMessageWithNonce, numberToHex, soliditySha3 } from './HashFunctions'

describe('HashFunctions', async () => {
  const nonce = 1
  const address = '0x8304cb99e989ee34af465db1cf15e369d8402870'
  const message = 'helloworld'
  const messageHashed = soliditySha3(message)

  describe('hashMessageWithNonce', () => {
    it('should hash a message with the concatenation of address, nonce and sample data', () => {
      let messageWithout0x: string
      if (messageHashed.startsWith('0x')) {
        messageWithout0x = messageHashed.slice(2)
      }

      const messageToHash = `${address}${numberToHex(1)}${messageWithout0x}`
      const expectedResult = soliditySha3(messageToHash)

      const result = hashMessageWithNonce(address, nonce, message)

      expect(result).toEqual(expectedResult)
    })

    it('should verify the address provided is correct', () => {
      const result = () => hashMessageWithNonce('', nonce, messageHashed)

      expect(result).toThrowError('Invalid address length')
    })

    it('should verify the nonce provided is correct', () => {
      const result = () => hashMessageWithNonce(address, 0, messageHashed)

      expect(result).toThrowError('Invalid nonce')
    })

    it('should verify the message provided is correct', () => {
      const result = () => hashMessageWithNonce(address, nonce, '')

      expect(result).toThrowError('Invalid message length')
    })
  })

  describe('hashMessageWithCallData', () => {
    it('should hash a message with the concatenation of address, nonce and call data', () => {
      const sampleCallData =
        '0x47b82e9b000000000000000000000000000000000000000000000000000000000000001b11111100000000000000000000000000000000000000000000000000000000002222220000000000000000000000000000000000000000000000000000000000'
      const callDataOnlySelectorWithoutOx = soliditySha3('0x47b82e9b').slice(2)
      const messageToHash = `${address}${numberToHex(1)}${callDataOnlySelectorWithoutOx}`
      const expectedResult = soliditySha3(messageToHash)
      const result = hashMessageWithCallData(address, nonce, sampleCallData)
      expect(result).toEqual(expectedResult)
    })

    it('should verify the callData provided is correct', () => {
      const result = () => hashMessageWithCallData(address, nonce, '')

      expect(result).toThrowError('Invalid calldata length')
    })
  })

  describe('numberToHex', () => {
    it('should transform a number to hex without 0x', () => {
      const result = numberToHex(1)

      expect(result).toEqual('01')
    })
  })
})
