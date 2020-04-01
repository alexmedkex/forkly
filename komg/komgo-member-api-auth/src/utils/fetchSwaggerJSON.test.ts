const axiosGetMock = jest.fn()
jest.mock('axios', () => ({
  default: {
    get: axiosGetMock
  }
}))

import { fetchSwaggerJSON, fetchCachedSwaggerJSON } from './fetchSwaggerJSON'

const swaggerJSON = {
  basePath: '',
  paths: { path1: { method1: { security: [{ signedIn: [] }] } } }
}

describe('fetchSwaggerJSON()', () => {
  beforeEach(() => {
    axiosGetMock.mockImplementationOnce(async () => ({
      data: swaggerJSON
    }))
  })

  it('should call axios.get with correct arguments', async () => {
    await fetchSwaggerJSON('http://baseUrl')

    expect(axiosGetMock).toHaveBeenCalledWith('http://baseUrl/swagger.json', {
      responseType: 'json'
    })
  })

  it('should return response.data', async () => {
    const resp = await fetchSwaggerJSON('http://baseUrl')

    expect(resp).toEqual(swaggerJSON)
  })
})

describe('fetchCachedSwaggerJSON()', () => {
  const originalSwaggerCacheIntervalEnv = process.env.SWAGGER_CACHE_INTERVAL

  beforeEach(() => {
    axiosGetMock.mockImplementation(async () => ({
      data: swaggerJSON
    }))
  })

  afterEach(() => {
    process.env.SWAGGER_CACHE_INTERVAL = originalSwaggerCacheIntervalEnv
  })

  it('should cache for 1 second', async () => {
    process.env.SWAGGER_CACHE_INTERVAL = '1'
    await fetchCachedSwaggerJSON('http://baseUrl')
    await fetchCachedSwaggerJSON('http://baseUrl')
    await fetchCachedSwaggerJSON('http://baseUrl')
    await sleep(1000)
    await fetchCachedSwaggerJSON('http://baseUrl')
    await fetchCachedSwaggerJSON('http://baseUrl')

    expect(axiosGetMock).toHaveBeenCalledTimes(2)
  })

  it('should cache forever', async () => {
    process.env.SWAGGER_CACHE_INTERVAL = '-1'
    await fetchCachedSwaggerJSON('http://baseUrl2')
    await fetchCachedSwaggerJSON('http://baseUrl2')
    await fetchCachedSwaggerJSON('http://baseUrl2')
    await sleep(200)
    await fetchCachedSwaggerJSON('http://baseUrl2')
    await fetchCachedSwaggerJSON('http://baseUrl2')

    expect(axiosGetMock).toHaveBeenCalledTimes(1)
  })

  it('should never cache the response', async () => {
    process.env.SWAGGER_CACHE_INTERVAL = '0'
    await fetchCachedSwaggerJSON('http://baseUrl3')
    await fetchCachedSwaggerJSON('http://baseUrl3')
    await fetchCachedSwaggerJSON('http://baseUrl3')
    await fetchCachedSwaggerJSON('http://baseUrl3')
    await fetchCachedSwaggerJSON('http://baseUrl3')

    expect(axiosGetMock).toHaveBeenCalledTimes(5)
  })
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
