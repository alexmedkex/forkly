import mockAxios from 'axios'
import 'reflect-metadata'

const MEMBERS = [
  {
    _id: '5bb52822f853305676e16edb',
    node: '0xf0d8cd2fee73db6a45aeba3b71655e5ee16c0bd5dae5554ae1fb6be9801a0eed',
    parentNode: '0x74a2f38723f057bfe74f65dbade9818d7c9f871ca1e4a69b9db00eea2c6af01f',
    label: '0x7f6dd79f0020bee2024a097aaa5d32ab7ca31126fa375538de047e7475fa8572',
    owner: '0x8304cB99e989EE34af465Db1CF15E369D8402870',
    ethPubKeys: [],
    komgoMessagingPubKeys: [],
    vaktMessagingPubKeys: [],
    komgoMnid: 'mnid'
  }
]

import { MemberClient } from './MemberClient'

let subjet: MemberClient

describe('MemberClient', () => {
  beforeAll(() => {
    subjet = new MemberClient()
  })

  it('s defined', () => {
    expect(new MemberClient()).toBeDefined()
  })

  describe('constructor', () => {
    it('builds a client with defaults', () => {
      expect(new MemberClient()).toBeDefined()
      // expect(mockAxios.create).toBeCalledWith({ baseURL: 'http://api-registry' })
    })

    it('builds a client with custom props', () => {
      const options = { baseURL: 'http://foo', otherParam: 'foo' }
      expect(new MemberClient(options)).toBeDefined()
      expect(mockAxios.create).toBeCalledWith(options)
    })
  })

  describe('find', () => {
    it('fetches all members', async () => {
      mockAxios.get = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: MEMBERS
        })
      )
      const members = await subjet.find()
      expect(members).toMatchObject(MEMBERS)
      expect(mockAxios.get).toBeCalledWith(`/v0/registry/cache?companyData=${encodeURIComponent(JSON.stringify({}))}`)
    })

    it('fetches members by node', async () => {
      const query = { node: '0x000001' }
      mockAxios.get = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: []
        })
      )
      await subjet.find(query)
      expect(mockAxios.get).toBeCalledWith(
        `/v0/registry/cache?companyData=${encodeURIComponent(JSON.stringify(query))}`
      )
    })
  })
})
