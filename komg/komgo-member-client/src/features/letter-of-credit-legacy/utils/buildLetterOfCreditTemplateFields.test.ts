import { v4 as uuid } from 'uuid'

import { buildLetterOfCreditTemplateFields } from './buildLetterOfCreditTemplateFields'
import { initialLetterOfCreditValues } from '../constants'
import { ITradeEnriched } from '../../trades/store/types'
import { ICargo } from '@komgo/types'
import { replaceUnderscores } from '../../../utils/casings'
import { fakeTrade, fakeCounterparty, mapOfFakeCargo, fakeMember } from './faker'
import * as selectors from './selectors'
import { Counterparty } from '../../counterparties/store/types'
import { IMember } from '../../members/store/types'

const spyFindMembers = jest.spyOn(selectors, 'findMembersByStatic')
const spyParticipantDetails = jest.spyOn(selectors, 'participantDetailsFromMember')

describe('buildLetterOfCreditTemplateFields', () => {
  // only happy path
  let member: IMember
  let counterparty: Counterparty
  let trade: ITradeEnriched
  let cargoMovements: ICargo[]
  beforeAll(() => {
    member = fakeMember()
    counterparty = fakeCounterparty()
    trade = fakeTrade()
    cargoMovements = mapOfFakeCargo.toList().toJS()
  })

  it('should try to find all 4 parties details', () => {
    spyFindMembers.mockImplementationOnce(() => member)
    spyParticipantDetails.mockImplementationOnce(() => initialLetterOfCreditValues as any)

    buildLetterOfCreditTemplateFields(initialLetterOfCreditValues, [member, member], trade, cargoMovements)

    expect(spyFindMembers).toHaveBeenCalledTimes(4)
    expect(spyParticipantDetails).toHaveBeenCalledTimes(4)
  })

  it('should return a payload containing initial values except those modified', () => {
    const values = {
      ...initialLetterOfCreditValues,
      availableBy: replaceUnderscores(initialLetterOfCreditValues.availableBy),
      applicableRules: replaceUnderscores(initialLetterOfCreditValues.applicableRules)
    }

    const payload = buildLetterOfCreditTemplateFields(
      initialLetterOfCreditValues,
      [member, member],
      trade,
      cargoMovements
    )

    expect(payload).toEqual(expect.objectContaining(values))
  })
  // TODO LS it seems trade isn't required. Instead all the cargo data are missing.
  it.skip('should return the trade cargo', () => {
    const payload = buildLetterOfCreditTemplateFields(
      initialLetterOfCreditValues,
      [member, member],
      trade,
      cargoMovements
    )

    expect(payload.cargo).toEqual(trade)
  })

  describe('For all parties involved', () => {
    it(`should correctly return the applicant`, () => {
      const staticId = uuid()
      const locValues = { ...initialLetterOfCreditValues, applicantId: staticId }
      const testMember = { ...member, staticId }
      testMember.x500Name.O = uuid()
      testMember.x500Name.L = uuid()

      const payload = buildLetterOfCreditTemplateFields(locValues, [testMember, testMember], trade, cargoMovements)

      expect(payload.applicant.name).toEqual(testMember.x500Name.O)
      expect(payload.applicant.locality).toEqual(testMember.x500Name.L)
    })

    it(`should correctly return the beneficiary`, () => {
      const staticId = uuid()
      const locValues = { ...initialLetterOfCreditValues, beneficiaryId: staticId }
      const testMember = { ...member, staticId }
      testMember.x500Name.O = uuid()
      testMember.x500Name.L = uuid()

      const payload = buildLetterOfCreditTemplateFields(locValues, [testMember, testMember], trade, cargoMovements)

      expect(payload.beneficiary.name).toEqual(testMember.x500Name.O)
      expect(payload.beneficiary.locality).toEqual(testMember.x500Name.L)
    })

    it(`should correctly return the issuingBank`, () => {
      const staticId = uuid()
      const locValues = { ...initialLetterOfCreditValues, issuingBankId: staticId }
      const testMember = { ...member, staticId }
      testMember.x500Name.O = uuid()
      testMember.x500Name.L = uuid()

      const payload = buildLetterOfCreditTemplateFields(locValues, [testMember, testMember], trade, cargoMovements)

      expect(payload.issuingBank.name).toEqual(testMember.x500Name.O)
      expect(payload.issuingBank.locality).toEqual(testMember.x500Name.L)
    })

    it(`should correctly return the beneficiaryBank`, () => {
      const staticId = uuid()
      const locValues = { ...initialLetterOfCreditValues, beneficiaryBankId: staticId }
      const testMember = { ...member, staticId }
      testMember.x500Name.O = uuid()
      testMember.x500Name.L = uuid()

      const payload = buildLetterOfCreditTemplateFields(locValues, [testMember, testMember], trade, cargoMovements)

      expect(payload.beneficiaryBank.name).toEqual(testMember.x500Name.O)
      expect(payload.beneficiaryBank.locality).toEqual(testMember.x500Name.L)
    })

    it('should correctly return the LOI from values', () => {
      const payload = buildLetterOfCreditTemplateFields(
        { ...initialLetterOfCreditValues, LOI: 'abcd' },
        [member, member],
        trade,
        cargoMovements
      )

      expect(payload.LOI).toEqual('abcd')
    })
  })
})
