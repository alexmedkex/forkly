import { ILC } from '../../data-layer/models/ILC'
import { getLogger } from '@komgo/logging'
import { IVaktMessagingManager } from './VaktMessagingManager'
import { IVaktMessagingFactoryManager } from './VaktMessagingFactoryManager'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../inversify/types'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import { LC_STATE } from '../events/LC/LCStates'
import * as _ from 'lodash'
import { getMessagesConfigs, IMessageConfig } from './VaktMessagesConfig'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import getLCMetaData from '../util/getLCMetaData'
import { SOURCES } from '../../data-layer/constants/Sources'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

export interface IVaktMessageNotifier {
  sendVaktMessage(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE)
}

@injectable()
export class VaktMessageNotifier implements IVaktMessageNotifier {
  private logger = getLogger('VaktMessageNotifier')
  private readonly config: IMessageConfig[]

  constructor(
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService,
    @inject(TYPES.VaktMessagingManager) private readonly vaktMessagingManager: IVaktMessagingManager,
    @inject(TYPES.VaktMessagingFactoryManager)
    private readonly vaktMessagingFactoryManager: IVaktMessagingFactoryManager
  ) {
    this.config = getMessagesConfigs()
  }

  async sendVaktMessage(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE) {
    const messageForStatus = this.config.find(m => m.lcStatus === state)

    if (!messageForStatus) {
      this.logger.info(`No VAKT message to be sent for state ${state}`, { ...getLCMetaData(lc), LC_STATE: state })
      return
    }

    if (lc && lc.tradeAndCargoSnapshot && lc.tradeAndCargoSnapshot.source === SOURCES.KOMGO) {
      this.logger.info(`No notification sent to VAKT because trade source is KOMGO`)
      return
    }

    const messagesForSender = messageForStatus.messages.filter(m => m.sender === role)

    if (!messagesForSender.length) {
      this.logger.info(`No VAKT message to be sent for state ${state} by ${role}`, {
        ...getLCMetaData(lc),
        LC_STATE: state
      })
      return
    }

    const toSend = messagesForSender[0]

    const companiesData = {}

    await Promise.all(
      _.uniq([toSend.sender, ...toSend.recepients]).map(async companyRoleType => {
        companiesData[companyRoleType] = await this.getCompanyData(
          companyRoleType === COMPANY_LC_ROLE.Applicant ? lc.applicantId : lc.beneficiaryId
        )
      })
    )

    if (!companiesData[toSend.sender]) {
      this.logger.info('No required data resolved for company role', {
        role: toSend.sender,
        ...getLCMetaData(lc)
      })
      return
    }

    const messages = toSend.recepients.map(recType => ({
      senderMnid: companiesData[toSend.sender].komgoMnid,
      recipientStaticId: companiesData[recType].staticId
    }))

    messages.forEach(messageOptions => {
      this.logger.info(`For LC [${lc._id}] state [${state}], sending VAKT message`, {
        ...getLCMetaData(lc),
        LC_STATE: state,
        vaktMessage: messageForStatus.vaktMessage,
        messageOptions
      })
      const message = this.vaktMessagingFactoryManager.getVaktMessage(messageForStatus.vaktMessage, lc, messageOptions)

      return this.vaktMessagingManager.notify(message)
    })
  }

  private async getCompanyData(staticId: string) {
    const resp = await this.companyRegistryService.getMember(staticId)

    if (!resp || !resp.data || !resp.data[0]) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.CompanyNotFound,
        `Can't find company with staticId: ${staticId}`,
        { error: 'CompanyDataNotFound', staticId }
      )

      return null
    }

    const company = resp.data[0]

    if (!resp.data[0].komgoMnid) {
      this.logger.info(`Missing KomgoId for company`, { error: 'KomgoIdMissing', staticId })

      return null
    }

    return { staticId, komgoMnid: company.komgoMnid }
  }
}
