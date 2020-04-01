import 'reflect-metadata'
import { LC_STATE } from '../events/LC/LCStates'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import { LC_TASK_TYPE } from './LCTaskType'

const mockStates = LC_STATE
const mockRoles = COMPANY_LC_ROLE
const mockTaskType = LC_TASK_TYPE

jest.mock('./LCTasksConfig', () => ({
  getTasksConfigs: () => [
    {
      key: {
        lcStatus: mockStates.ISSUED,
        role: mockRoles.IssuingBank
      },
      resolveTask: {
        taskType: mockTaskType.ReviewLCApplication,
        outcome: true
      }
    },
    {
      key: {
        lcStatus: mockStates.ISSUED,
        role: mockRoles.Beneficiary
      },
      createTask: mockTaskType.ReviewIssuedLC,
      check: lc => lc.direct
    },
    {
      key: {
        lcStatus: mockStates.ISSUED,
        role: mockRoles.AdvisingBank
      },
      createTask: mockTaskType.ReviewIssuedLC,
      check: lc => !lc.direct
    }
  ]
}))

import { LCTaskProcessor } from './LCTaskProcessor'
import { TaskStatus } from '@komgo/notification-publisher'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'

const mockLc: any = {
  _id: '1',
  applicantId: 'app1',
  beneficiaryId: 'ben2',
  reference: '2018-MER-1'
  // directLC, no beneficiaryBankId
}

const mockNonDirectLc = {
  ...mockLc,
  direct: false,
  beneficiaryBankId: '2',
  beneficiaryBankRole: 'AdvisingBank'
}

const mockTaskFactory = {
  getTask: jest.fn(() => ({
    task: {},
    notification: {}
  })),
  getTaskContext: jest.fn(() => ({ id: 1 }))
}

const mockTaskManager: any = {
  createTask: jest.fn(),
  updateTaskStatus: jest.fn()
}

const mockNotifManager: any = {
  createNotification: jest.fn()
}

const mockRegistryService: ICompanyRegistryService = {
  getMember: jest.fn(() => ({ data: [{ x500Name: { CN: 'testCompany' } }] })),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

describe('LCTaskProcessor', () => {
  let lCTaskProcessor: LCTaskProcessor

  beforeAll(() => {
    lCTaskProcessor = new LCTaskProcessor(
      'company1',
      mockTaskManager,
      mockTaskFactory,
      mockNotifManager,
      mockRegistryService,
      'urltest'
    )
  })

  describe('create task', () => {
    it('should not create task if not defined for state', async () => {
      await lCTaskProcessor.createTask(mockLc, LC_STATE.ADVISED, COMPANY_LC_ROLE.IssuingBank)

      expect(mockTaskManager.createTask).not.toHaveBeenCalled()
    })

    it('should not create task if not defined for role', async () => {
      await lCTaskProcessor.createTask(mockLc, LC_STATE.ISSUED, COMPANY_LC_ROLE.Applicant)

      expect(mockTaskManager.createTask).not.toHaveBeenCalled()
    })

    it('should create task if defined for role', async () => {
      await lCTaskProcessor.createTask(mockNonDirectLc, LC_STATE.ISSUED, COMPANY_LC_ROLE.AdvisingBank)

      expect(mockTaskManager.createTask).toHaveBeenCalled()
    })

    it('should not create task if condition not satisfied', async () => {
      await lCTaskProcessor.createTask(mockNonDirectLc, LC_STATE.ISSUED, COMPANY_LC_ROLE.Beneficiary)

      expect(mockTaskManager.createTask).not.toHaveBeenCalled()
    })
  })

  describe('resolve task', () => {
    it('should not resolve task if not defined for state', async () => {
      await lCTaskProcessor.resolveTask(mockLc, LC_STATE.ADVISED, COMPANY_LC_ROLE.IssuingBank)

      expect(mockTaskManager.createTask).not.toHaveBeenCalled()
    })

    it('should not resolve task if not defined for role', async () => {
      await lCTaskProcessor.resolveTask(mockLc, LC_STATE.ISSUED, COMPANY_LC_ROLE.Applicant)

      expect(mockTaskManager.createTask).not.toHaveBeenCalled()
    })

    it('should resolve task if defined for role', async () => {
      await lCTaskProcessor.resolveTask(mockLc, LC_STATE.ISSUED, COMPANY_LC_ROLE.IssuingBank)

      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.Done,
          taskType: LC_TASK_TYPE.ReviewLCApplication,
          context: { id: 1 },
          outcome: true
        })
      )
    })
  })

  describe('sendStatusChange notification', () => {
    it('should send notifiation', async () => {
      await lCTaskProcessor.sendStateUpdatedNotification(
        mockLc,
        LC_STATE.ISSUED,
        COMPANY_LC_ROLE.Beneficiary,
        'company2'
      )

      expect(mockNotifManager.createNotification.mock.calls[0][0]).toMatchObject({
        message: 'LC 2018-MER-1 has been issued by testCompany'
      })
    })

    it('should not send notifiation if company performed this action', async () => {
      await lCTaskProcessor.sendStateUpdatedNotification(
        mockLc,
        LC_STATE.ISSUED,
        COMPANY_LC_ROLE.Beneficiary,
        'company1'
      )

      expect(mockNotifManager.createNotification).not.toHaveBeenCalled()
    })
  })
})
