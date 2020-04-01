import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import {
  ILetterOfCredit,
  buildFakeLetterOfCredit,
  IDataLetterOfCredit,
  LetterOfCreditStatus,
  CompanyRoles,
  LetterOfCreditType
} from '@komgo/types'
import { LetterOfCreditPartyActionProcessorHelper } from './LetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'

describe('LetterOfCreditPartyActionProcessorHelper', () => {
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let letterOfCreditPartyActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper

  describe('executePartyActions', () => {
    beforeEach(() => {
      letterOfCredit = buildFakeLetterOfCredit()
      const { applicant } = letterOfCredit.templateInstance.data
      letterOfCreditPartyActionProcessorHelper = new LetterOfCreditPartyActionProcessorHelper(applicant.staticId)
    })

    describe('getPartyRole', () => {
      it('should get applicant role', async () => {
        const role = letterOfCreditPartyActionProcessorHelper.getPartyRole(letterOfCredit)

        expect(role).toEqual(CompanyRoles.Applicant)
      })
    })

    describe('getLetterOfCreditType', () => {
      it('should return Letter of credit', async () => {
        const anotherLetterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit({
          type: LetterOfCreditType.Documentary
        })

        const result = letterOfCreditPartyActionProcessorHelper.getLetterOfCreditType(anotherLetterOfCredit)

        expect(result).toEqual('Letter of credit')
      })

      it('should return Standby letter of credit', async () => {
        const anotherLetterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit({
          type: LetterOfCreditType.Standby
        })

        const result = letterOfCreditPartyActionProcessorHelper.getLetterOfCreditType(anotherLetterOfCredit)

        expect(result).toEqual('Standby letter of credit')
      })
    })
  })
})
