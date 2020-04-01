import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'jest'
import 'reflect-metadata'

const companyName = 'My Company Name'
const staticId = '123456'
const generatedName = 'SMS-3456-myCompanyN'
jest.mock('../../utils/generatePw', () => ({
  default: () => 'test-password'
}))

import HarborService, { IHarborService } from './HarborService'

const harborUrl = 'http://localhost:9001'
const harborPass = 'pass'
const harborName = 'name'
const harborProjectId = '2'

const axiosMock = new MockAdapter(axios)

describe('HarborService', () => {
  describe('HarborService main functionality', () => {
    let harborService: IHarborService
    let MonitoringDevEnv

    beforeAll(function() {
      axiosMock.reset()

      postReply(harborUrl, '/api/users', 200, null)
      getReply(harborUrl, `/api/users?username=${generatedName}`, 200, [{ user_id: 123 }])
      getReply(harborUrl, `/api/projects/${harborProjectId}`, 200, { name: 'created_name' })
      postReply(harborUrl, `/api/projects/${harborProjectId}/members`, 200, null)
    })

    beforeEach(function() {
      harborService = new HarborService(harborPass, harborName, harborProjectId, harborUrl, MonitoringDevEnv)
    })

    it('creates user', async () => {
      const getLocationMock = () => {
        return {
          headers: { location: '/api/users/123' },
          data: { name: 'created_name' }
        }
      }

      Object.defineProperty(harborService, 'harborRequest', { value: jest.fn(getLocationMock) })

      const result = await harborService.createUser('test@test.com', companyName, staticId)
      expect(result).toEqual({
        harborUser: generatedName,
        harborEmail: 'SMS-3456-myCompanyN@komgo.io',
        harborPassword: 'test-password'
      })
      expect(harborService.harborRequest).toHaveBeenNthCalledWith(1, 'POST', '/api/users', {
        Username: generatedName,
        Email: 'SMS-3456-myCompanyN@komgo.io',
        Password: 'test-password',
        RealName: companyName,
        Comment: 'N/A'
      })
      expect(harborService.harborRequest).toHaveBeenNthCalledWith(
        3,
        'POST',
        `/api/projects/${harborProjectId}/members`,
        {
          role_id: 3,
          member_user: {
            user_id: 123,
            username: generatedName
          },
          member_group: {
            id: parseInt(harborProjectId, 10),
            group_name: 'created_name'
          }
        }
      )
    })

    it('throws error when harbor request fails', async () => {
      postReply(harborUrl, '/api/users', 500, 'Oops')

      const result = harborService.createUser('SMS-3456-myCompanyN@komgo.io', companyName, staticId)
      await expect(result).rejects.toEqual(
        ErrorUtils.internalServerException(ErrorCode.Connection, 'Harbor request error')
      )
    })
  })

  describe('HarborService environment functionality', () => {
    let harborService: IHarborService
    const MonitoringDevEnv = 'test-env'

    beforeAll(function() {
      axiosMock.reset()

      postReply(harborUrl, '/api/users', 200, null)
      getReply(harborUrl, `/api/users?username=${generatedName}`, 200, [{ user_id: 'user_id' }])
      getReply(harborUrl, `/api/projects/${harborProjectId}`, 200, { name: 'created_name' })
      postReply(harborUrl, `/api/projects/${harborProjectId}/members`, 200, null)
    })

    beforeEach(function() {
      harborService = new HarborService(harborPass, harborName, harborProjectId, harborUrl, MonitoringDevEnv)
    })

    it('creates user with env name in userName', async () => {
      const harborNameWithEnv = 'SMS-test-env-3456-myCompanyN'
      getReply(harborUrl, `/api/users?username=${harborNameWithEnv}`, 200, [
        {
          headers: { location: '/api/users/user_id' },
          data: { user_id: 'user_id' }
        }
      ])

      const getLocationMock = () => {
        return {
          headers: { location: '/api/users/user_id' },
          data: { name: 'created_name' }
        }
      }

      Object.defineProperty(harborService, 'harborRequest', { value: jest.fn(getLocationMock) })

      const result = await harborService.createUser('SMS-3456-myCompanyN@komgo.io', companyName, staticId)
      expect(result.harborUser).toEqual(harborNameWithEnv)
    })
  })

  function postReply(server, path, status, body) {
    axiosMock.onPost(`${server}${path}`).reply(status, JSON.stringify(body))
  }

  function getReply(server, path, status, body) {
    axiosMock.onGet(`${server}${path}`).reply(status, body)
  }
})
