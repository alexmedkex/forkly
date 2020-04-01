import { injectable, inject } from 'inversify'

import { ILetterOfCredit, CompanyRoles, IDataLetterOfCredit, LetterOfCreditType } from '@komgo/types'
import { getLogger } from '@komgo/logging'

import { CONFIG } from '../../../inversify'

import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'

@injectable()
export class LetterOfCreditPartyActionProcessorHelper implements ILetterOfCreditPartyActionProcessorHelper {
  private readonly logger = getLogger('LetterOfCreditPartyActionProcessorHelper')
  private readonly companyStaticId: string

  constructor(@inject(CONFIG.CompanyStaticId) companyStaticId: string) {
    this.companyStaticId = companyStaticId
  }

  getPartyAction(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    partyRole: CompanyRoles,
    actions: Map<string, any>
  ): (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void> {
    const partyAction = actions.get(partyRole)
    this.logger.info('Checking if there is some action for this role')
    this.logger.info('Action for this role:', {
      partyAction
    })

    if (!partyAction) {
      this.logger.info('No action has to be performed by this party', {
        sblcStaticId: letterOfCredit.staticId,
        companyStaticId: this.companyStaticId,
        partyRole
      })
      return
    }
    return partyAction
  }

  getPartyRole(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): CompanyRoles {
    const { applicant, issuingBank, beneficiary } = letterOfCredit.templateInstance.data
    let partyRole: CompanyRoles
    if (applicant && this.companyStaticId === applicant.staticId) {
      partyRole = CompanyRoles.Applicant
    } else if (issuingBank && this.companyStaticId === issuingBank.staticId) {
      partyRole = CompanyRoles.IssuingBank
    } else if (beneficiary && this.companyStaticId === beneficiary.staticId) {
      partyRole = CompanyRoles.Beneficiary
    } else {
      partyRole = CompanyRoles.UNKNOWN
    }
    this.logger.info('Retrieved company role in this Letter of credit', {
      staticId: letterOfCredit.staticId,
      partyRole
    })

    if (!partyRole) {
      this.logger.info('LetterOfCreditPartyActionProcessor: invalid company role', {
        staticId: letterOfCredit.staticId,
        companyStaticId: this.companyStaticId,
        partyRole
      })
      throw new Error('Company role not found')
    }

    return partyRole
  }

  getLetterOfCreditType(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    return letterOfCredit.type === LetterOfCreditType.Standby ? 'Standby letter of credit' : 'Letter of credit'
  }
}
