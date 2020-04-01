import 'reflect-metadata'
import { MockInstance } from 'jest'
import AttributeRequest from '../requests/AttributeRequest'
import { AttributeController } from './AttributeController'
import { HttpException } from '@komgo/microservice-config'
const VALID_TX_HASH = 'txHash'

const addAttributeValid: MockInstance = jest.fn(() => {
  return VALID_TX_HASH
})

const addAttributeInvalid: MockInstance = jest.fn(() => {
  throw new Error()
})

const mockRequest: AttributeRequest = {
  node: 'test',
  key: 'ab',
  value: 'cd'
}

describe('addAttribute()', () => {
  it('should return a valid transaction.', async () => {
    const controller = new AttributeController({
      addAttribute: addAttributeValid
    })

    const result = await controller.addAttribute(mockRequest)

    expect(result.txHash).toEqual(VALID_TX_HASH)
  })

  it('should throw an error if use case returns undefined.', async () => {
    const controller = new AttributeController({
      addAttribute: addAttributeInvalid
    })

    await expect(controller.addAttribute(mockRequest)).rejects.toBeInstanceOf(HttpException)
  })
})
