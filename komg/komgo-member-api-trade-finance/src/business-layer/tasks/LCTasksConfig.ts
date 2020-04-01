import { LC_STATE } from '../events/LC/LCStates'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import { LC_TASK_TYPE } from './LCTaskType'
import { ILC } from '../../data-layer/models/ILC'
import { IEmailTemplateData } from '@komgo/types'

export interface ITaskConfig {
  key: {
    lcStatus: LC_STATE
    role: COMPANY_LC_ROLE
  }
  check?: (lc: ILC) => boolean
  createTask?: LC_TASK_TYPE
  emailTemplateData?: IEmailTemplateData
  resolveTask?: {
    taskType: LC_TASK_TYPE
    outcome?: boolean
  }
}

export const getTasksConfigs = (baseUrl: string): ITaskConfig[] => {
  return [
    // requested
    {
      key: {
        lcStatus: LC_STATE.REQUESTED,
        role: COMPANY_LC_ROLE.IssuingBank
      },
      createTask: LC_TASK_TYPE.ReviewLCApplication,
      emailTemplateData: {
        subject: '[Komgo][LC Requested]',
        taskTitle: 'Review LC Request',
        taskLink: `${baseUrl}/tasks`
      }
    },
    // issued
    {
      key: {
        lcStatus: LC_STATE.ISSUED,
        role: COMPANY_LC_ROLE.IssuingBank
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewLCApplication,
        outcome: true
      }
    },
    {
      key: {
        lcStatus: LC_STATE.ISSUED,
        role: COMPANY_LC_ROLE.Beneficiary
      },
      createTask: LC_TASK_TYPE.ReviewIssuedLC,
      emailTemplateData: {
        subject: '[Komgo][LC Issued]',
        taskTitle: 'Review LC Issued',
        taskLink: `${baseUrl}/tasks`
      },
      check: lc => lc.direct
    },
    {
      key: {
        lcStatus: LC_STATE.ISSUED,
        role: COMPANY_LC_ROLE.AdvisingBank
      },
      createTask: LC_TASK_TYPE.ReviewIssuedLC,
      emailTemplateData: {
        subject: '[Komgo][LC Issued]',
        taskTitle: 'Review LC Issued',
        taskLink: `${baseUrl}/tasks`
      },
      check: lc => !lc.direct
    },
    // request rejected
    {
      key: {
        lcStatus: LC_STATE.REQUEST_REJECTED,
        role: COMPANY_LC_ROLE.IssuingBank
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewLCApplication,
        outcome: false
      }
    },
    {
      key: {
        lcStatus: LC_STATE.REQUEST_REJECTED,
        role: COMPANY_LC_ROLE.Applicant
      },
      createTask: LC_TASK_TYPE.ReviewAppRefusal,
      emailTemplateData: {
        subject: '[Komgo][LC Request Rejected]',
        taskTitle: 'Review LC Request Rejected',
        taskLink: `${baseUrl}/tasks`
      }
    },
    // acknowledge
    {
      key: {
        lcStatus: LC_STATE.ACKNOWLEDGED,
        role: COMPANY_LC_ROLE.Beneficiary
      },
      createTask: LC_TASK_TYPE.ManagePresentation,
      emailTemplateData: {
        subject: '[Komgo][LC Manage Presentation]',
        taskTitle: 'LC Manage Presentation',
        taskLink: `${baseUrl}/tasks`
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewIssuedLC,
        outcome: true
      }
    },
    // IssueRejected
    {
      key: {
        lcStatus: LC_STATE.ISSUED_LC_REJECTED,
        role: COMPANY_LC_ROLE.Beneficiary
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewIssuedLC,
        outcome: false
      },
      check: lc => lc.direct
    },
    {
      key: {
        lcStatus: LC_STATE.ISSUED_LC_REJECTED,
        role: COMPANY_LC_ROLE.Beneficiary
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewIssuedLC,
        outcome: false
      },
      // non direct lc, and LC was previosly advised
      check: lc => !lc.direct && (lc.stateHistory && !!lc.stateHistory.find(s => s.toState === LC_STATE.ADVISED))
    },
    {
      key: {
        lcStatus: LC_STATE.ISSUED_LC_REJECTED,
        role: COMPANY_LC_ROLE.AdvisingBank
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewIssuedLC,
        outcome: false
      },
      check: lc => !lc.direct
    },
    // Advised
    {
      key: {
        lcStatus: LC_STATE.ADVISED,
        role: COMPANY_LC_ROLE.AdvisingBank
      },
      resolveTask: {
        taskType: LC_TASK_TYPE.ReviewIssuedLC,
        outcome: true
      }
    },
    {
      key: {
        lcStatus: LC_STATE.ADVISED,
        role: COMPANY_LC_ROLE.Beneficiary
      },
      createTask: LC_TASK_TYPE.ReviewIssuedLC,
      emailTemplateData: {
        subject: '[Komgo][LC Advised]',
        taskTitle: 'Review LC Advised',
        taskLink: `${baseUrl}/tasks`
      },
      check: lc => !lc.direct // non-directLC
    }
  ]
}
