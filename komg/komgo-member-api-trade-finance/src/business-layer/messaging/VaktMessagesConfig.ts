import { LC_STATE } from '../events/LC/LCStates'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import { LCMessageType } from './messageTypes'

export interface IMessageConfig {
  lcStatus: LC_STATE
  vaktMessage: LCMessageType
  messages: Array<{
    sender: COMPANY_LC_ROLE
    recepients: COMPANY_LC_ROLE[]
  }>
}

export const getMessagesConfigs = (): IMessageConfig[] => {
  return [
    {
      lcStatus: LC_STATE.REQUESTED,
      vaktMessage: LCMessageType.LCRequested,
      messages: [
        {
          sender: COMPANY_LC_ROLE.Applicant,
          recepients: [COMPANY_LC_ROLE.Applicant, COMPANY_LC_ROLE.Beneficiary]
        }
      ]
    },
    {
      lcStatus: LC_STATE.ISSUED,
      vaktMessage: LCMessageType.LCIssued,
      messages: [
        {
          sender: COMPANY_LC_ROLE.Applicant,
          recepients: [COMPANY_LC_ROLE.Applicant, COMPANY_LC_ROLE.Beneficiary]
        }
      ]
    },
    {
      lcStatus: LC_STATE.REQUEST_REJECTED,
      vaktMessage: LCMessageType.LCRequestRejected,
      messages: [
        {
          sender: COMPANY_LC_ROLE.Applicant,
          recepients: [COMPANY_LC_ROLE.Applicant, COMPANY_LC_ROLE.Beneficiary]
        }
      ]
    },
    {
      lcStatus: LC_STATE.ISSUED_LC_REJECTED,
      vaktMessage: LCMessageType.LCIssuedRejected,
      messages: [
        {
          sender: COMPANY_LC_ROLE.Applicant,
          recepients: [COMPANY_LC_ROLE.Applicant, COMPANY_LC_ROLE.Beneficiary]
        }
      ]
    }
  ]
}
