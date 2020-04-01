import { ErrorCode as ErrCode } from '@komgo/error-utilities'
import { ErrorUtils as ErrUtils } from '@komgo/microservice-config'
import { IUserCreateRequest, IUserResponse, RequiredUserActions } from '@komgo/types'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'jest'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'

import KeycloakAdminService from '../../buisness-layer/keycloak/KeycloakAdminService'
import RolesClient from '../../infrastructure/roles/RolesClient'

import { UsersController } from './UsersController'

const mockUsers = [
  {
    id: '34fwed235v5b5',
    username: 'jbourne',
    firstName: 'Jason',
    lastName: 'Bourne',
    email: 'jbourne@corp.com',
    createdAt: 2347978234553
  },
  {
    id: 'g63576b455bv2',
    username: 'jadams',
    firstName: 'Julia',
    lastName: 'Adams',
    email: 'jadams@corp.com',
    createdAt: 2347978234553
  }
]

jest.mock('../../utils/decode', () => ({
  default: jest.fn().mockReturnValue({
    sub: 'user-id',
    preferred_username: 'user'
  })
}))

function mock(classType) {
  const t = jestMock.getMetadata(classType)
  const mockType = jestMock.generateFromMetadata(t)
  return new mockType()
}

const mockKeycloakAdminService = mock(KeycloakAdminService)

describe('UsersController', () => {
  let controller: UsersController
  let axiosMock: MockAdapter
  beforeEach(() => {
    axiosMock = new MockAdapter(axios)
    axiosMock.onGet(/.*/).reply(200, ['firstData', 'secondData1'])
    axiosMock.onPost(/.*/).reply(200)
    controller = new UsersController('KOMGO', mockKeycloakAdminService, 'keycloakAuthUrl', 'rolesBaseUrl')
  })

  describe('GetUsers()', () => {
    it('should return UserModel[] instance', async () => {
      mockKeycloakAdminService.findUsers.mockResolvedValue(
        mockUsers.map(item => ({ ...item, createdTimestamp: item.createdAt }))
      )
      const result: IUserResponse[] = await controller.GetUsers()
      expect(result).toEqual(mockUsers)
    })

    it('should throw an error 400 status', async () => {
      let status
      try {
        await controller.GetUsers(undefined, 'manageUsers')
      } catch (e) {
        status = e.status
      }
      expect(status).toEqual(400)
    })

    it('should return UserModel[] instance with filter by productId, actionId', async () => {
      mockKeycloakAdminService.findUsersByRole.mockResolvedValue(
        mockUsers.map(item => ({ ...item, createdTimestamp: item.createdAt }))
      )
      const result: IUserResponse[] = await controller.GetUsers('someProdId', 'someActionId')
      expect(result).toEqual(mockUsers)
    })

    it('should return UserModel[] instance with roles', async () => {
      mockKeycloakAdminService.listRoleMappings.mockResolvedValue({
        realmMappings: [{ name: 'kycAnalyst' }, { name: 'complianceOfficer' }],
        clientMappings: {
          account: {
            mappings: []
          }
        }
      })
      mockKeycloakAdminService.findUsers.mockResolvedValue(
        mockUsers.map(item => ({ ...item, createdTimestamp: item.createdAt }))
      )
      const result: IUserResponse[] = await controller.GetUsers(undefined, undefined, true)
      expect(result).toEqual(mockUsers.map(obj => ({ ...obj, roles: ['kycAnalyst', 'complianceOfficer'] })))
    })

    it('should throw an error', async () => {
      mockKeycloakAdminService.findUsers.mockResolvedValue(null)

      await expect(controller.GetUsers()).rejects.toThrow()
    })

    it('should throw an error when role not found', async () => {
      axiosMock.onGet(/.*/).reply(200, [])
      await controller.GetUsers('1', '1').catch(err => {
        expect(err.status).toBe(404)
      })
    })
  })

  describe('GetUserById()', () => {
    it('should return UserModel instance', async () => {
      mockKeycloakAdminService.findUser.mockResolvedValue({ ...mockUsers[0], createdTimestamp: mockUsers[0].createdAt })
      const result: IUserResponse = await controller.GetUserById(mockUsers[0].id)

      expect(result).toEqual(mockUsers[0])
    })

    it('should throw an error', async () => {
      mockKeycloakAdminService.findUser.mockReset()

      await expect(controller.GetUserById(mockUsers[0].id)).rejects.toThrow()
    })
  })

  describe('RegisterNewUser()', () => {
    it('should return UserModel instance', async () => {
      mockKeycloakAdminService.createUser.mockResolvedValue({
        ...mockUsers[0],
        createdTimestamp: mockUsers[0].createdAt
      })
      const result: IUserResponse = await controller.RegisterNewUser(mockUsers[0] as IUserCreateRequest)

      expect(result).toEqual(mockUsers[0])
    })

    it('should call executeActionsEmail if requiredActions are exists in request', async () => {
      mockKeycloakAdminService.createUser.mockResolvedValue({
        ...mockUsers[0],
        createdTimestamp: mockUsers[0].createdAt
      })
      await controller.RegisterNewUser({
        ...mockUsers[0],
        requiredActions: [RequiredUserActions.UPDATE_PASSWORD, RequiredUserActions.VERIFY_EMAIL]
      } as IUserCreateRequest)

      expect(mockKeycloakAdminService.executeActionsEmail).toHaveBeenCalledWith('KOMGO', mockUsers[0].id, [
        RequiredUserActions.VERIFY_EMAIL,
        RequiredUserActions.UPDATE_PASSWORD
      ])
    })

    it('should throw an error', async () => {
      mockKeycloakAdminService.createUser.mockResolvedValue(null)

      await expect(controller.RegisterNewUser(mockUsers[0] as IUserCreateRequest)).rejects.toMatchObject({
        errorObject: {
          errorCode: 'EVAL01',
          fields: {},
          message: undefined,
          origin: process.env.CONTAINER_HOSTNAME || '<unknown-origin>'
        },
        message: undefined,
        name: '',
        status: 400
      })
    })
  })

  describe('ResetPassword', () => {
    it('should reset password for user', async () => {
      await controller.ResetPassword('jwt string', 'user-id', {
        currentPassword: 'string',
        newPassword: 'new-string',
        confirmNewPassword: 'new-string'
      })
      expect(mockKeycloakAdminService.resetUserPassword).toBeCalled()
    })

    it('should fail on wrong userid', async () => {
      await expect(
        controller.ResetPassword('jwt string', 'user-id1', {
          currentPassword: 'string',
          newPassword: 'new-string',
          confirmNewPassword: 'new-string'
        })
      ).rejects.toMatchObject(
        ErrUtils.unauthorizedException(ErrCode.Authorization, `Modifying other user profile forbidden.`)
      )
    })

    it('should fail on wrong new password mismatch', async () => {
      await expect(
        controller.ResetPassword('jwt string', 'user-id', {
          currentPassword: 'string',
          newPassword: 'new-string1',
          confirmNewPassword: 'new-string'
        })
      ).rejects.toMatchObject(
        ErrUtils.unprocessableEntityException(ErrCode.ValidationHttpContent, `Password missmatch.`, {
          data: { confirmNewPassword: ['Password missmatch.'] }
        })
      )
    })

    it('should fail on wrong current password', async () => {
      axiosMock.onPost().reply(500)
      await expect(
        controller.ResetPassword('jwt string', 'user-id', {
          currentPassword: 'string',
          newPassword: 'new-string',
          confirmNewPassword: 'new-string'
        })
      ).rejects.toMatchObject(
        ErrUtils.unprocessableEntityException(ErrCode.Authorization, `Wrong current password.`, {
          data: { currentPassword: ['Wrong current password.'] }
        })
      )
    })
  })
})
