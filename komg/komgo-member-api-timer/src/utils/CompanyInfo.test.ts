const getMock = jest.fn(() => Promise.resolve(null))

process.env.API_REGISTRY_BASE_URL = 'http://api-registry:8080'
const staticId = '1ce31c12-de20-4210-8d48-9cf5059f09aa'

const apiRegistryURL =
  'http://api-registry:8080/v0/registry/cache?companyData=%7B%22staticId%22%20%3A%20%221ce31c12-de20-4210-8d48-9cf5059f09aa%22%20%7D'

jest.mock('axios', () => ({ default: { get: getMock } }))

import { getApiRegistryUrlByStaticId, getCompanyInfoById, getCompanyNameByStaticId } from './CompanyInfo'

describe('CompanyInfo test', () => {
  it('should return url by staticId from getApiRegistryUrlByStaticId', async () => {
    const result = getApiRegistryUrlByStaticId(staticId)

    expect(result).toEqual(apiRegistryURL)
  })

  it('should return company information by staticId from getCompanyInfoById', async () => {
    getMock.mockImplementation(() => Promise.resolve({ data: [{ x500Name: { O: 'test name' } }], status: 200 }))
    const result = await getCompanyInfoById(staticId)

    expect(result).toEqual({ x500Name: { O: 'test name' } })
  })

  it('should return empty company info if api-registry returned an error for getCompanyInfoById', async () => {
    getMock.mockImplementation(() => Promise.reject(new Error('Oops!')))
    const result = await getCompanyInfoById(staticId)

    expect(result).toEqual('')
  })

  it('should return company name by staticId from getCompanyNameByStaticId', async () => {
    getMock.mockImplementation(() => Promise.resolve({ data: [{ x500Name: { O: 'test name' } }], status: 200 }))
    const result = await getCompanyNameByStaticId(staticId)

    expect(result).toEqual('test name')
  })

  it('should return empty company name if api-registry returned an error for getCompanyNameByStaticId', async () => {
    getMock.mockImplementation(() => Promise.reject(new Error('Oops!')))
    const result = await getCompanyNameByStaticId(staticId)

    expect(result).toEqual('')
  })
})
