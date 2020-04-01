import 'reflect-metadata'

import IntegrationEnvironment from './utils/IntegrationEnvironment'

jest.setTimeout(90000)
// TODO: After having modified CompanyKeyProvider, rewrite these tests so they do not depend on previous state by deleting the DB
// between each test. At the moment CompanyKeyProvider stores the keys in memory, making it impossible to clear the state between states
// without restarting the entire server.

/**
 * This integration test uses MongoDB real containers.
 */
describe('KeyManageController integration test', () => {
  let iEnv: IntegrationEnvironment

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.beforeAll()
  })

  beforeEach(async () => {
    await iEnv.beforeEach()
  })

  /**
   * Given:
   * No rsa key has been set
   *
   * When:
   * rsa/public-key is called
   *
   * Then:
   * it should return a 404 error with sensible message
   */
  it('should return 404 if no rsa key is set', async () => {
    try {
      await iEnv.getAPISigner('key-manage/rsa/public-key')
      fail('Expected an exception')
    } catch (error) {
      expect(error.response.data.message).toEqual('RSA key missing')
      expect(error.response.status).toEqual(404)
    }
    console.log('Test finished')
    // done()
  })

  // TODO: MM - Write integration tests for the following:
  // POST /key-manage/rsa route tests
  // GET /key-manage/rsa/public-key route tests
  // eth - Handle expected error when no passphrase is set (not even ENV)?

  afterEach(async () => {
    // Drop collections
    await iEnv.cleanKeyDataCollection()
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })
})
