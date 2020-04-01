import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { NotificationManager } from '@komgo/notification-publisher'
import MessagePublisher from '@komgo/messaging-library/dist/MessagePublisher'
import { Status } from '@komgo/types'
import 'jest'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'

import { ENSCompanyOnboarder } from '../../business-layer/onboard-member-ens/ENSCompanyOnboarder'
import CompanyDataAgent from '../../data-layer/data-agent/CompanyDataAgent'
import { Company } from '../../data-layer/models/Company'
import CompanyRegistryService from '../../infrastructure/api-registry/CompanyRegistryService'
import UsersService from '../../infrastructure/api-users/UsersService'
import CommonMessagingService from '../../infrastructure/common-broker/CommonMessagingService'
import HarborService from '../../infrastructure/harbor/HarborService'

import { CompaniesController } from './CompaniesController'

function mock(classType) {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

const companyDataAgent = mock(CompanyDataAgent)
const harborService = mock(HarborService)
const usersService = mock(UsersService)
const commonMessagingService = mock(CommonMessagingService)
const companyRegistryService = mock(CompanyRegistryService)
const onboarder = mock(ENSCompanyOnboarder)
const notificationClientMock = mock(NotificationManager)
const messagePublisher = mock(MessagePublisher)

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
  isMember: false,
  isDeactivated: false,
  companyAdminEmail: 'test@test.com',
  memberType: ''
}
const harborCred = {
  harborUser: 'user',
  harborEmail: 'email',
  harborPassword: 'pass'
}
const memberDraft = {
  staticId: 'staticId',
  komgoMnid: 'komgoMnid',
  ...dummyCompany,
  companyAdminEmail: 'e@mail.com',
  isMember: true,
  memberType: 'SMS',
  status: Status.Draft
}
const memberReady = {
  staticId: 'staticId',
  komgoMnid: 'komgoMnid',
  ...dummyCompany,
  companyAdminEmail: 'e@mail.com',
  messagingPublicKey: {
    key: {
      kty: 'RSA',
      kid: 'kid',
      e: 'AQAB',
      n: 'n'
    },
    validFrom: '2019-07-10T09:26:37.375Z',
    validTo: '2020-07-09T09:26:37.375Z'
  },
  isMember: true,
  memberType: 'SMS',
  status: Status.Ready
}

jest.mock('../../utils/getUserId', () => ({
  default: jest.fn(() => 'u123')
}))

describe('CompaniesController', () => {
  const companiesController = new CompaniesController(
    companyDataAgent,
    harborService,
    usersService,
    commonMessagingService,
    companyRegistryService,
    notificationClientMock,
    onboarder,
    messagePublisher
  )

  beforeEach(() => {
    usersService.createMemberNodeAccount = jest.fn().mockResolvedValue({ id: 'user-id' })
  })

  describe('createCompany', () => {
    it('should add company', async () => {
      companyDataAgent.createCompany.mockReturnValue(dummyCompany)
      const result = await companiesController.createCompany(dummyCompany)
      expect(result).toEqual(dummyCompany)
    })
    it('should throw error when adding FMS company', async () => {
      const result = companiesController.createCompany({ ...dummyCompany, memberType: 'FMS' })
      await expect(result).rejects.toEqual(
        ErrorUtils.notImplementedException(
          ErrorCode.ValidationInvalidOperation,
          'Onboarding of FMS, LMS nodes is not implemented'
        )
      )
    })
  })

  describe('getCompanies', () => {
    it('should return companies', async () => {
      companyDataAgent.getCompanies.mockReturnValue([dummyCompany])
      const result = await companiesController.getCompanies()
      expect(result).toEqual([dummyCompany])
    })

    it('should filter out deactivated companies', async () => {
      companyDataAgent.getCompanies.mockReturnValue([])
      await companiesController.getCompanies()
      expect(companyDataAgent.getCompanies).toHaveBeenCalledWith({ isDeactivated: { $ne: true } })
    })
  })

  describe('getCompany', () => {
    it('should return a company', async () => {
      companyDataAgent.getCompany.mockReturnValue(dummyCompany)
      const result = await companiesController.getCompany('company-static-id')
      expect(result).toEqual(dummyCompany)
    })
  })

  describe('generateMemberPackage', () => {
    it('throws error if company is not a member', async () => {
      companyDataAgent.getCompany.mockReturnValue({ ...dummyCompany, isMember: false })
      await expect(companiesController.generateMemberPackage('company-id')).rejects.toEqual(
        ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, `Company "O" is not a member`, null)
      )
    })

    it('throws error if company status is not Draft', async () => {
      companyDataAgent.getCompany.mockReturnValue({ ...dummyCompany, isMember: true, status: 'Pending' })
      await expect(companiesController.generateMemberPackage('company-id')).rejects.toEqual(
        ErrorUtils.badRequestException(
          ErrorCode.ValidationHttpContent,
          'This operation is not allowed. Company status: Pending. Expected status: Draft',
          null
        )
      )
    })
    it('should generate and add extra data to member', async () => {
      companyDataAgent.getCompany.mockReturnValue(memberDraft)
      harborService.createUser.mockReturnValue(harborCred)
      companyDataAgent.update.mockReturnValue({ ...memberDraft, ...harborCred })
      const result = await companiesController.generateMemberPackage('company-id')
      expect(result).toEqual({ ...memberDraft, ...harborCred })
    })

    it('should throw error if company admin email is not a valid email', async () => {
      companyDataAgent.getCompany.mockReturnValue({
        ...memberDraft,
        companyAdminEmail: 'invalid email',
        status: Status.Draft
      })

      const result = companiesController.generateMemberPackage('company-id')

      await expect(result).rejects.toEqual(
        ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, 'Invalid company admin email', {
          companyAdminEmail: ['Invalid company admin email']
        })
      )
    })
  })

  describe('addCompanyToENS', () => {
    it('should add company to ENS', async () => {
      expect.assertions = 1
      const company = new Company(memberReady)
      companyDataAgent.getCompany.mockReturnValue(company)
      companyDataAgent.update.mockReturnValue(company)
      await companiesController.addCompanyToENS('token', 'company-id', {
        bottomsheetId: 'bottomsheetId'
      })
      setTimeout(() => {
        expect(messagePublisher.publish).toHaveBeenCalledWith(
          'INTERNAL.WS.action',
          {
            payload: { displayStatus: 'onboarded', id: 'bottomsheetId', name: 'company-id', state: 'REGISTERED' },
            recipient: 'u123',
            type: '@@btsh/UPDATE_BOTTOMSHEET_ITEM',
            version: '1'
          },
          { requestId: undefined }
        )
      }, 0)
    })
  })

  describe('configureMQRoute', () => {
    it('should configure Common MQ', async () => {
      const company = new Company(memberReady)
      companyDataAgent.getCompany.mockReturnValue(company)
      commonMessagingService.configure = jest.fn()
      companyDataAgent.update.mockReturnValue(company)
      const result = await companiesController.configureMQRoute('token', 'test-id', { bottomsheetId: 'bottomsheetId' })
      expect(messagePublisher.publish).toHaveBeenCalledWith(
        'INTERNAL.WS.action',
        {
          payload: { displayStatus: 'onboarded', id: 'bottomsheetId', name: 'company-id', state: 'REGISTERED' },
          recipient: 'u123',
          type: '@@btsh/UPDATE_BOTTOMSHEET_ITEM',
          version: '1'
        },
        { requestId: undefined }
      )
    })
  })

  describe('deleteCompany', () => {
    it('should delete company from the DB', async () => {
      const company = new Company(memberDraft)
      companyDataAgent.getCompany.mockReturnValue(company)
      companyDataAgent.deleteCompany.mockReturnValue(undefined)

      await companiesController.deleteCompany('test-id')

      expect(companyDataAgent.deleteCompany).toHaveBeenCalledWith('test-id')
    })

    it('should throw error if when company has status Pending', async () => {
      const company = new Company({
        ...memberReady,
        harborUser: 'abc',
        memberType: ''
      })
      companyDataAgent.getCompany.mockReturnValue(company)
      companyDataAgent.deleteCompany.mockReturnValue(undefined)

      const result = companiesController.deleteCompany('test-id')

      await expect(result).rejects.toEqual(
        ErrorUtils.badRequestException(
          ErrorCode.ValidationHttpContent,
          'Only members with status Draft or non-members with status Ready can be deleted',
          null
        )
      )
    })
  })

  describe('updateCompany', () => {
    it('throws an error if email is invalid', async () => {
      const company = new Company(memberReady)
      companyDataAgent.getCompany.mockReturnValue(company)

      const result = companiesController.updateCompany('token', 'test-id', {
        ...memberReady,
        companyAdminEmail: 'invalid',
        bottomsheetId: 'bottomsheetId'
      })

      await expect(result).rejects.toHaveProperty('errors', {
        companyAdminEmail: expect.any(Object)
      })
    })

    it('calls ensOnboarder.update()', async () => {
      const notFoundResp = { status: 404 }
      companyDataAgent.getCompany.mockRejectedValue(notFoundResp)
      companyRegistryService.getCompany.mockResolvedValue(memberReady)

      await companiesController.updateCompany('token', 'test-id', {
        ...memberReady,
        bottomsheetId: 'bottomsheetId'
      })

      expect(onboarder.update).toHaveBeenCalledWith(
        {
          ...memberReady,
          x500Name: {
            ...memberReady.x500Name,
            CN: memberReady.x500Name.O
          }
        },
        memberReady
      )
    })

    it('throws error if company does not exist', async () => {
      const notFoundResp = { status: 404 }
      companyRegistryService.getCompany.mockRejectedValue(notFoundResp)
      companyDataAgent.getCompany.mockRejectedValue(notFoundResp)

      const result = companiesController.updateCompany('token', 'test-id', {
        ...memberReady,
        bottomsheetId: 'bottomsheetId'
      })

      await expect(result).rejects.toEqual(
        ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Company not found')
      )
    })

    it('should publish a websocket event when company is updated', async () => {
      companyRegistryService.getCompany.mockResolvedValue(memberReady)
      companyDataAgent.getCompany.mockReturnValue({
        toJSON: () => memberReady
      })

      await companiesController.updateCompany('token', 'test-id', {
        ...memberReady,
        bottomsheetId: 'bottomsheetId'
      })

      expect(messagePublisher.publish).toHaveBeenCalledWith(
        'INTERNAL.WS.action',
        {
          payload: {
            ...memberReady,
            addedToENS: false,
            addedToMQ: false,
            x500Name: { ...memberReady.x500Name, CN: memberReady.x500Name.O }
          },
          recipient: 'u123',
          type: '@@addressBook/UPDATE_COMPANY_SUCCESS',
          version: '1'
        },
        { requestId: undefined }
      )
    })

    it('throws error if isMember is changed', async () => {
      companyRegistryService.getCompany.mockResolvedValue(memberReady)
      companyDataAgent.getCompany.mockReturnValue({
        toJSON: () => memberReady
      })

      const result = companiesController.updateCompany('token', 'test-id', {
        ...memberReady,
        isMember: false,
        bottomsheetId: 'bottomsheetId'
      })

      await expect(result).rejects.toEqual(
        ErrorUtils.notImplementedException(
          ErrorCode.ValidationInvalidOperation,
          'Changing membership for a registered company is not supported'
        )
      )
    })
  })

  describe('activateCompany', () => {
    beforeEach(() => {
      companyRegistryService.getCompany.mockReset()
    })
    it('should deactivate company', async () => {
      companyRegistryService.getCompany.mockResolvedValue(memberReady)
      await companiesController.activateCompany('test-id', { active: false })
      expect(onboarder.setDeactivated).toBeCalledWith('test-id', false)
    })

    it('should update isDeactivated in the DB', async () => {
      companyDataAgent.getCompany.mockReturnValue(new Company(memberDraft))
      companyRegistryService.getCompany.mockResolvedValue(memberReady)
      await companiesController.activateCompany('test-id', { active: false })
      expect(companyDataAgent.update).toBeCalledWith('test-id', { isDeactivated: true })
    })

    it('should fail to deactivate unknown company', async () => {
      companyRegistryService.getCompany.mockResolvedValue(null)
      await expect(companiesController.activateCompany('test-id', { active: false })).rejects.toEqual(
        ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Company not found')
      )
    })
  })
})
