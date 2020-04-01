import { MockInstance } from 'jest'
import 'reflect-metadata'

import { IKeyDocument } from '../models/key'

const KeyType = 'SOME_TYPE'

const findOneMock: MockInstance<IKeyDocument> = jest.fn(async () => ({ type: KeyType }))
const keyModel = {
  findOne: findOneMock,
  create: jest.fn(),
  updateOne: jest.fn()
}

const existingKey = {
  _id: '5ba340c68a07080afc1a5dcc',
  type: 'ETH',
  validFrom: 1517443200000.0,
  active: true,
  data:
    '{"version":3,"id":"73e103ea-27f5-4f3e-918d-f358511dcdd4","address":"f8ce58a70cdc6e59ae4a395acd21f70489cac71e","crypto":{"ciphertext":"a37c2ee3edb52857b4990ed4676087816811afd630fec0381fbeede1e99a532c","cipherparams":{"iv":"707153d89785aec9cdeaea81e9ae53dd"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"16593573446eec28281fa83bcc6ebfb6d36434199a2d28d3afa1a9c6ed39fff8","n":8192,"r":8,"p":1},"mac":"a32152ff1464bef01939059b3de2a2a680fd23f2d50e2f849baab98221c25943"}}',
  modifiedAt: new Date(),
  createdAt: new Date(),
  __v: 0
}

jest.mock('../models/key', () => ({
  Key: keyModel
}))

import KeyDataAgent from './KeyDataAgent'
let agent: KeyDataAgent

describe('KeyDataAgent', () => {
  beforeEach(() => {
    agent = new KeyDataAgent()
  })
  it('loads active Key', async done => {
    const result = await agent.getActiveKey(KeyType)

    expect(result).toEqual({ type: KeyType })
    expect(findOneMock.mock.calls[0][0]).toEqual({ active: true, type: KeyType })
    done()
  })

  it('creates new key if no key present', async () => {
    findOneMock.mockImplementation(() => null)
    const result = await agent.addNewKey(KeyType, '{some data}')
    expect(findOneMock).toHaveBeenLastCalledWith({
      active: true,
      type: KeyType
    })

    const data = keyModel.create.mock.calls[0][0]
    expect(data.active).toBeTruthy()

    expect(keyModel.updateOne).not.toHaveBeenCalled()
  })

  it('creates new key and invalidate current if key present', async () => {
    findOneMock.mockImplementation(() => existingKey)
    const result = await agent.addNewKey(KeyType, '{some data}')
    expect(findOneMock).toHaveBeenLastCalledWith({
      active: true,
      type: KeyType
    })

    const id = keyModel.updateOne.mock.calls[0][0]
    const update = keyModel.updateOne.mock.calls[0][1]
    expect(id).toEqual({ _id: existingKey._id })
    expect(update).toMatchObject({ active: false })
    expect(update.validTo).toBeDefined()

    const newKeyData = keyModel.create.mock.calls[0][0]
    expect(newKeyData.active).toBeTruthy()
  })
})
