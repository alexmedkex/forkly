import 'reflect-metadata'

import axios from 'axios'
import * as AxiosMockAdapter from 'axios-mock-adapter'
import * as namehash from 'eth-ens-namehash'

import { COMPANY_ID, COMPANY_MNID, COMPANY_NAME } from '../../data-layer/models/test-entities'

import { CompaniesRegistryClient } from './CompaniesRegistryClient'
import RegistryError from './RegistryError'

const axiosMock = new AxiosMockAdapter(axios)
const REGISTRY_URL = 'registry-url'

describe('CompaniesRegistryClient', () => {
  let registryClient

  beforeEach(() => {
    jest.resetAllMocks()
    axiosMock.reset()

    registryClient = new CompaniesRegistryClient(REGISTRY_URL, 0)

    httpReturn().reply(200, [
      {
        x500Name: { CN: COMPANY_NAME },
        komgoMnid: COMPANY_MNID
      }
    ])
  })

  it('gets name of a company by static company id', async () => {
    const companyName = await registryClient.getCompanyNameByStaticId(COMPANY_ID)

    expect(companyName).toEqual(COMPANY_NAME)
  })

  it('throws CompanyNotFound if reply contains no records', async () => {
    httpReturn().reply(200)

    const call = registryClient.getCompanyInfoById(COMPANY_ID)
    await expect(call).rejects.toThrow(new RegistryError(`api-registry returned no data for company ${COMPANY_ID}`))
  })

  it('throws CompanyNotFound if api-registry returned an error', async () => {
    httpReturn().reply(400)

    const call = registryClient.getCompanyInfoById(COMPANY_ID)
    await expect(call).rejects.toThrow(new RegistryError(`Request to api-registry failed for company ${COMPANY_ID}`))
  })
})

function httpReturn() {
  const node = namehash.hash(`${COMPANY_ID}.meta.komgo`)
  const query = `{"node" : "${node}" }`
  const encodedQuery = encodeURIComponent(query)
  const url = `${REGISTRY_URL}/v0/registry/cache?companyData=${encodedQuery}`

  return axiosMock.onGet(url)
}
