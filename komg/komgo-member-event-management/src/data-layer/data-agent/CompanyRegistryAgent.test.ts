import * as moxios from 'moxios'
import 'reflect-metadata'
const namehash = require('eth-ens-namehash')
import CompanyRegistryAgent from './CompanyRegistryAgent'
import { ICompanyRegistryAgent } from './ICompanyRegistryAgent'
import { RequestIdHandler } from '../../util/RequestIdHandler'
import { createMockInstance } from 'jest-create-mock-instance'

const STATIC_ID = 'staticId'

let mockRequestIdHandler: jest.Mocked<RequestIdHandler>

describe('CompanyRegistryAgent', () => {
  let service: ICompanyRegistryAgent

  beforeEach(() => {
    moxios.install()
    mockRequestIdHandler = createMockInstance(RequestIdHandler)
    service = new CompanyRegistryAgent('http://api-registry', mockRequestIdHandler)
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('getEntryFromStaticId', async done => {
    const node = namehash.hash(`${STATIC_ID}.meta.komgo`)
    const query = `{"node" : "${node}" }`
    moxios.stubRequest(`http://api-registry/v0/registry/cache/?companyData=${encodeURIComponent(query)}`, {
      status: 200,
      response: [{ testPassed: 'true' }]
    })
    const resultPromise = service.getEntryFromStaticId(STATIC_ID)
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual({ testPassed: 'true' })
      done()
    })
  })

  it('getMnidFromStaticId', async done => {
    const node = namehash.hash(`${STATIC_ID}.meta.komgo`)
    const query = `{"node" : "${node}" }`
    moxios.stubRequest(`http://api-registry/v0/registry/cache/?companyData=${encodeURIComponent(query)}`, {
      status: 200,
      response: [{ komgoMnid: 'mnid' }]
    })
    const resultPromise = service.getMnidFromStaticId(STATIC_ID)
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual('mnid')
      done()
    })
  })

  it('getPropertyFromMnid', async done => {
    const node = namehash.hash(`${STATIC_ID}.meta.komgo`)
    const query = `{"mnidKey" : "mnidValue" }`
    moxios.stubRequest(`http://api-registry/v0/registry/cache/?companyData=${encodeURIComponent(query)}`, {
      status: 200,
      response: [{ property: 'property' }]
    })
    const resultPromise = service.getPropertyFromMnid('mnidKey', 'mnidValue', 'property')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual('property')
      done()
    })
  })
})
