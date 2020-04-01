import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { NotificationManager } from '@komgo/notification-publisher'
import 'jest'
import createMockInstance from 'jest-create-mock-instance'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'

import CompanyDataAgent from '../../data-layer/data-agent/CompanyDataAgent'
import { Company } from '../../data-layer/models/Company'
import { IMemberPackage } from '../../interfaces'

jest.mock('../../utils/getUserId', () => ({
  default: () => 'u123'
}))

import { MembersController } from './MembersController'

let notificationClientMock: jest.Mocked<NotificationManager>
notificationClientMock = createMockInstance(NotificationManager)

function mock(classType) {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

const companyDataAgent = mock(CompanyDataAgent)

const dummyCompany = {
  x500Name: {
    O: 'O',
    C: 'C',
    L: 'L',
    STREET: 'STREET',
    PC: 'PC'
  },
  hasSWIFTKey: true,
  isFinancialInstitution: true,
  isMember: true,
  companyAdminEmail: 'test@test.com',
  memberType: 'SMS'
}
const memberWithIds = {
  ...dummyCompany,
  isMember: true,
  memberType: 'SMS',
  staticId: 'staticId',
  komgoMnid: 'komgoMnid'
}
const harborCred = {
  harborUser: 'user',
  harborEmail: 'email',
  harborPassword: 'pass'
}
const pendingMember = {
  ...memberWithIds,
  ...harborCred,
  keycloakUserId: 'u123',
  status: 'Pending',
  rabbitMQCommonUser: 'rabbitMQCommonUser',
  rabbitMQCommonPassword: 'rabbitMQCommonPassword'
}
const onboardedMember = {
  ...pendingMember,
  addedToENS: true,
  addedToMQ: true
}

describe('MembersController', () => {
  const membersController = new MembersController(companyDataAgent, notificationClientMock)

  describe('downloadMemberPackage', () => {
    it('returns member package', async () => {
      companyDataAgent.getMemberByKeycloakUserId.mockReturnValue(new Company(pendingMember))
      process.env.ENS_REGISTRY_CONTRACT_ADDRESS = 'ENS_REGISTRY_CONTRACT_ADDRESS'
      const result = await membersController.downloadMemberPackage('company-id')

      const memberPackage: IMemberPackage = {
        ensAddress: 'ENS_REGISTRY_CONTRACT_ADDRESS',
        harborEmail: 'email',
        harborPassword: 'pass',
        harborUser: 'user',
        komgoMnid: 'komgoMnid',
        rabbitMQCommonPassword: 'rabbitMQCommonPassword',
        rabbitMQCommonUser: 'rabbitMQCommonUser',
        staticId: 'staticId'
      }
      expect(result).toMatchObject(memberPackage)
    })
  })

  describe('addPublicKeys', () => {
    it('should create a notification when public keys are added', async () => {
      companyDataAgent.getMemberByKeycloakUserId.mockReturnValue(new Company(pendingMember))
      companyDataAgent.update.mockReturnValue(new Company(pendingMember))

      await membersController.addPublicKeys('company-id', {})

      expect(notificationClientMock.createNotification).toHaveBeenCalledWith({
        context: { requestId: expect.any(String), type: 'setPublicKey' },
        level: 'info',
        message: 'O has added public keys',
        productId: 'administration',
        requiredPermission: { actionId: 'onboard', productId: 'administration' },
        type: 'Administration.info'
      })
    })

    it('should throw error if company is already onboarded', async () => {
      companyDataAgent.getMemberByKeycloakUserId.mockReturnValue(new Company(onboardedMember))

      await expect(membersController.addPublicKeys('company-id', {})).rejects.toEqual(
        ErrorUtils.badRequestException(
          ErrorCode.ValidationHttpContent,
          `Public keys has already been added to blockchain ENS registry. You cannot update them`,
          null
        )
      )
    })
  })
})
