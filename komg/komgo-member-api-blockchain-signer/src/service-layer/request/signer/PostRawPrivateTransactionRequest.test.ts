import 'jest'
import 'reflect-metadata'

import { validateObject } from '@komgo/microservice-config'
import { PostRawPrivateTransactionRequest } from './PostRawPrivateTransactionRequest'
import { TX_ID } from '../../../utils/test-data'

describe('PostRawPrivateTransactionRequest', () => {
  it('validate correct object without an id', async () => {
    const res = await validateObject(PostRawPrivateTransactionRequest, {
      data: '0x0',
      privateFor: ['0x0'],
      context: {}
    })

    expect(res.hasErrors()).toEqual(false)
  })

  it('validate correct object with an id', async () => {
    const res = await validateObject(PostRawPrivateTransactionRequest, {
      id: TX_ID,
      data: '0x0',
      privateFor: ['0x0'],
      context: {}
    })

    expect(res.hasErrors()).toEqual(false)
  })

  it('validate invalid object', async () => {
    const res = await validateObject(PostRawPrivateTransactionRequest, {
      id: '123',
      data: '0x0',
      privateFor: ['0x0'],
      context: 'str'
    })

    expect(res.hasErrors()).toEqual(true)
    expect(res.getValidationErrors()).toEqual({
      context: ['context is not an object'],
      id: ['id must be a mongodb id']
    })
  })
})
