import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { tenantStaticIdHeaderName, generateRandomCreateRoleRequests } from './utils/testData'

const iEnv = new IntegrationEnvironment()

jest.setTimeout(200e3)

describe('LMS Database Access', () => {
  beforeAll(async () => {
    process.env.IS_LMS_NODE = 'true'
    await iEnv.beforeAll()
  })

  afterAll(async () => {
    process.env.IS_LMS_NODE = 'true'
    await iEnv.afterAll()
  })

  it('should throw error 500 if X-Tenant-StaticID header is not set', async () => {
    const resp = iEnv.axios.get('/roles')
    await expect(resp).rejects.toHaveProperty('response.status', 500)
  })

  it('should return a successful response X-Tenant-StaticID header is set', async () => {
    const resp = await iEnv.axios.get('/roles', {
      headers: {
        [tenantStaticIdHeaderName]: '123-456'
      }
    })
    expect(resp.status).toBe(200)
  })

  it('should create roles in correct collections with 500 concurrent requests', async () => {
    const concurrentRequests = 500
    const generatedRequests = generateRandomCreateRoleRequests(concurrentRequests)
    const requests = generatedRequests.map(async reqData => {
      const resp = await iEnv.axios.post('/roles', reqData.data, {
        headers: reqData.headers,
        validateStatus: () => true
      })
      return {
        tenantId: reqData.tenantId,
        status: resp.status,
        data: resp.data
      }
    })

    const responses = await Promise.all(requests)

    responses.map((resp, i) => {
      expect(resp).toMatchObject({
        data: {
          label: generatedRequests[i].tenantId
        },
        status: 200,
        tenantId: generatedRequests[i].tenantId
      })
    })
  })
})
