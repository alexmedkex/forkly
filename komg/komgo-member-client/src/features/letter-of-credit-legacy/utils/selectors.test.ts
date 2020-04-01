import { v4 as uuid } from 'uuid'
import * as immutable from 'immutable'
import {
  findCounterpartyByStatic,
  selectBeneficiaryIdOptions,
  selectBeneficiaryBankIdOptions,
  selectIssuingBankIdOptions,
  findTasksByLetterOfCreditId,
  findTaskStatusByLetterOfCreditId,
  findLatestShipment,
  participantDetailsFromMember,
  selectInitialValues,
  findMembersByStatic,
  selectInitialValuesFromLetterOfCredit,
  findMemberName,
  findRoleForStaticId,
  timerExists,
  getTimer
} from './selectors'
import { IMember } from '../../members/store/types'
import { DropdownOptions } from '../components'
import { Roles } from '../constants/roles'
import {
  fakeLetterOfCredit,
  fakeLetterOfCreditEnriched,
  fakeMember,
  fakeTask,
  fakeTrade,
  fakeCargo,
  fakeCounterparty,
  fakeTradeAndCargoSnapshot,
  fakePresentation,
  fakeTimer
} from '../utils/faker'
import { Task, TaskStatus } from '../../tasks/store/types'
import { LetterOfCreditTaskType } from '../constants/taskType'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
import { Counterparty } from '../../counterparties/store/types'
import {
  emptyCounterparty,
  INVOICE_REQUIREMENT_OPTIONS,
  LOI_TYPE_OPTIONS,
  initialLetterOfCreditValues
} from '../constants'
import { Currency } from '@komgo/types'

const myStaticId = 'myStaticId'
const listOfMembers: IMember[] = [
  fakeMember({
    staticId: 'notABankId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank'
  }),
  fakeMember({
    staticId: myStaticId,
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'My Trading Co'
  }),
  fakeMember({
    staticId: 'anotherId',
    isMember: false,
    isFinancialInstitution: true,
    commonName: 'A Bank'
  }),
  fakeMember({
    staticId: 'yetAnotherId',
    isMember: true,
    isFinancialInstitution: true,
    commonName: 'A Member Bank'
  })
  /*fakeMember({
    staticId: 'notABankIdAndNotAMemberId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank And Not A Member'
  })*/
]
const listOfCounterparties: Counterparty[] = [
  fakeCounterparty({
    staticId: 'notABankId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank'
  }),
  fakeCounterparty({
    staticId: myStaticId,
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'My Trading Co'
  }),
  fakeCounterparty({
    staticId: 'anotherId',
    isMember: false,
    isFinancialInstitution: true,
    commonName: 'A Bank'
  }),
  fakeCounterparty({
    staticId: 'yetAnotherId',
    isMember: true,
    isFinancialInstitution: true,
    commonName: 'A Member Bank'
  }),
  fakeCounterparty({
    staticId: 'notABankIdAndNotAMemberId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank And Not A Member'
  })
]

describe('selectCounterpartyFromStaticId', () => {
  it('selects correct member from a valid staticId', () => {
    expect(findCounterpartyByStatic(listOfCounterparties, myStaticId)!.staticId).toEqual(myStaticId)
  })
  it('returns undefined if the member does not exist', () => {
    const desiredStaticId = 'desiredStaticId'
    expect(findCounterpartyByStatic(listOfCounterparties, desiredStaticId)).toBeUndefined()
  })
})

describe('selectMemberFromStaticId', () => {
  it('selects correct member from a valid staticId', () => {
    expect(findMembersByStatic(listOfMembers, myStaticId)!.staticId).toEqual(myStaticId)
  })
  it('returns undefined if the member does not exist', () => {
    const desiredStaticId = 'desiredStaticId'
    expect(findMembersByStatic(listOfMembers, desiredStaticId)).toBeUndefined()
  })
})

describe('selectBeneficiaryIdOptions', () => {
  let result: DropdownOptions[]
  beforeAll(() => {
    result = selectBeneficiaryIdOptions(listOfCounterparties, myStaticId)
  })
  it(`Picks all companies, apart from the Applicants company, with 'isfinancialinstitution' is equal to false`, () => {
    expect(result.length).toEqual(2)
    expect(result[0].value).toEqual('notABankId')
    expect(result[0].text).toEqual('Not A Bank')
    expect(result[0].content).toEqual('Not A Bank')
  })
})

describe('selectIssuingBankIdOptions', () => {
  let result: DropdownOptions[]
  beforeAll(() => {
    result = selectIssuingBankIdOptions(listOfCounterparties, jest.fn(() => true))
  })
  it(`Display 'isfinancialinstitution' is true companies who are members`, () => {
    expect(result.length).toEqual(1)
    expect(result[0].value).toEqual('yetAnotherId')
    expect(result[0].text).toEqual('A Member Bank')
    expect(result[0].content).toEqual('A Member Bank')
  })
})

describe('selectBeneficiaryBankIdOptions', () => {
  let result: DropdownOptions[]
  beforeAll(() => {
    result = selectBeneficiaryBankIdOptions(listOfMembers)
  })
  it(`Display all 'isfinancialinstitution' is true companies`, () => {
    expect(result.length).toEqual(2)
    expect(result[0].value).toEqual('anotherId')
    expect(result[0].text).toEqual('A Bank')
    expect(result[0].content).toEqual('A Bank')
    expect(result[1].value).toEqual('yetAnotherId')
    expect(result[1].text).toEqual('A Member Bank')
    expect(result[1].content).toEqual('A Member Bank')
  })
})

describe('selectBeneficiaryBankIdOptionsFiltered', () => {
  it(`Show banks with LC license and show non members bank`, () => {
    const result = selectBeneficiaryBankIdOptions(listOfMembers)
    expect(result).toEqual([
      { content: 'A Bank', text: 'A Bank', value: 'anotherId' },
      { content: 'A Member Bank', text: 'A Member Bank', value: 'yetAnotherId' }
    ])
  })
})

describe('participantDetailsFromMember', () => {
  describe('if beneficiary is a komgo member', () => {
    let member: Counterparty
    let details
    beforeAll(() => {
      member = { ...fakeCounterparty(), isMember: true }
      member.x500Name.CN = uuid()
      member.x500Name.L = uuid()
      member.x500Name.C = uuid()
      member.x500Name.STREET = uuid()
      member.x500Name.PC = uuid()
    })
    it('returns correct company name from the member', () => {
      details = participantDetailsFromMember(member)

      expect(details.companyName).toEqual(member.x500Name.CN)
    })
    it('returns correct locality as city from the member', () => {
      details = participantDetailsFromMember(member)

      expect(details.city).toEqual(member.x500Name.L)
    })
    it('returns correct country as country from the member', () => {
      details = participantDetailsFromMember(member)

      expect(details.country).toEqual(member.x500Name.C)
    })
    it("should make an address containing street locality and 'PC' ", () => {
      details = participantDetailsFromMember(member)

      expect(details.address).toEqual(expect.stringContaining(member.x500Name.STREET))
      expect(details.address).toEqual(expect.stringContaining(member.x500Name.L))
      expect(details.address).toEqual(expect.stringContaining(member.x500Name.PC))
    })
  })
  describe('if beneficiary is not a komgo member', () => {
    it('returns empty member details', () => {
      const details = participantDetailsFromMember(undefined)

      expect(details.companyName).toEqual(emptyCounterparty.x500Name.CN)
    })
  })
})

describe('findLatestShipment', () => {
  it('returns the latest shipment', () => {
    const letter = fakeLetterOfCredit()
    expect(findLatestShipment({ ...letter, tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot() })).toEqual({
      latestShipment: '2020-12-31'
    })
  })

  it('returns undefined', () => {
    const letter = fakeLetterOfCredit()
    letter.tradeAndCargoSnapshot = undefined
    expect(findLatestShipment(letter)).toEqual({ latestShipment: '' })
  })
})

describe('findTasksByLetterOfCreditId', () => {
  const context = {
    type: 'LC',
    id: '123',
    lcid: '123'
  }
  const task = fakeTask({
    summary: 'fake task',
    status: TaskStatus.ToDo,
    type: LetterOfCreditTaskType.REVIEW_APPLICATION,
    actions: [] as string[],
    context,
    assignee: ''
  })
  const anotherTask = fakeTask()

  it('returns tasks of a given letter of credit', () => {
    const letter = fakeLetterOfCreditEnriched({
      transactionHash: context.lcid,
      _id: context.lcid,
      tasks: [task, anotherTask]
    })
    expect(findTasksByLetterOfCreditId(letter.tasks, context.id)).toEqual([task])
  })

  it("returns an empty arrays if letter of credit doesn't match", () => {
    const letter = fakeLetterOfCreditEnriched({
      tasks: [anotherTask, anotherTask]
    })
    expect(findTasksByLetterOfCreditId(letter.tasks, context.id)).toEqual([])
  })
})

describe('findTaskStatusByLetterOfCreditId', () => {
  describe(TaskStatus.Done, () => {
    it(`returns ${TaskStatus.Done} when there isn't tasks for the assignee`, () => {
      const letterOfCreditId = '0x123'
      const tasks: Task[] = [
        fakeTask({
          summary: 'fake task',
          status: TaskStatus.Done,
          type: LetterOfCreditTaskType.REVIEW_APPLICATION,
          actions: [] as string[],
          context: {
            type: 'LC',
            id: letterOfCreditId,
            lcid: letterOfCreditId
          }
        }),
        fakeTask({ status: TaskStatus.Done, context: { type: 'LC', id: letterOfCreditId, lcid: letterOfCreditId } })
      ]
      expect(findTaskStatusByLetterOfCreditId(tasks, letterOfCreditId)).toEqual(TaskStatus.Done)
    })
  })

  describe(TaskStatus.ToDo, () => {
    it(`returns ${TaskStatus.ToDo} when I have some tasks`, () => {
      const letterOfCreditId = '0x123'
      const tasks: Task[] = [
        fakeTask({
          summary: 'fake task',
          status: TaskStatus.ToDo,
          type: LetterOfCreditTaskType.REVIEW_APPLICATION,
          actions: [] as string[],
          context: {
            type: 'LC',
            id: letterOfCreditId,
            lcid: letterOfCreditId
          }
        })
      ]
      expect(findTaskStatusByLetterOfCreditId(tasks, letterOfCreditId)).toEqual(TaskStatus.ToDo)
    })
  })
})

describe('selectInitialValues', () => {
  it('contains cargo movement IDs if included', () => {
    const values = selectInitialValues({
      applicantId: '123',
      members: [
        fakeCounterparty({ staticId: '123', commonName: '123 co' }),
        fakeCounterparty({ staticId: 'abc', commonName: 'abc co' })
      ],
      tradeEnriched: fakeTrade(),
      cargoMovements: [fakeCargo({ cargoId: 'a' }), fakeCargo({ cargoId: 'b' }), fakeCargo({ cargoId: 'c' })]
    })

    expect(values.cargoIds).toEqual(['a', 'b', 'c'])
  })
})

describe('selectInitialValuesFromLetterOfCredit', () => {
  it('selects the correct initial invoiceRequirement', () => {
    const values = selectInitialValuesFromLetterOfCredit(fakeLetterOfCredit(), listOfMembers, '123')

    expect(values.invoiceRequirement).toEqual(INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE)
  })
  it('selects the correct invoiceRequirement', () => {
    const values = selectInitialValuesFromLetterOfCredit(
      { ...fakeLetterOfCredit(), invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS.SIMPLE },
      listOfMembers,
      '123'
    )

    expect(values.invoiceRequirement).toEqual(INVOICE_REQUIREMENT_OPTIONS.SIMPLE)
  })
  it('selects the default invoiceRequirement', () => {
    const input = fakeLetterOfCredit()
    delete input.invoiceRequirement

    const values = selectInitialValuesFromLetterOfCredit({ ...fakeLetterOfCredit() }, listOfMembers, '123')

    expect(values.invoiceRequirement).toEqual(INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE)
  })
  it('selects the correct default LOIType', () => {
    const values = selectInitialValuesFromLetterOfCredit(fakeLetterOfCredit(), listOfMembers, '123')

    expect(values.LOIType).toEqual(LOI_TYPE_OPTIONS.KOMGO_LOI)
  })
  it('selects the free text LOI if given', () => {
    const values = selectInitialValuesFromLetterOfCredit(
      { ...fakeLetterOfCredit(), LOIType: LOI_TYPE_OPTIONS.FREE_TEXT },
      listOfMembers,
      '123'
    )

    expect(values.LOIType).toEqual(LOI_TYPE_OPTIONS.FREE_TEXT)
  })
  it('selects the correct default type', () => {
    const lc = fakeLetterOfCredit()
    delete lc.type
    const values = selectInitialValuesFromLetterOfCredit(lc, listOfMembers, '123')

    expect(values.type).toEqual(initialLetterOfCreditValues.type)
  })
  it('selects a different type if given', () => {
    const values = selectInitialValuesFromLetterOfCredit(
      { ...fakeLetterOfCredit(), type: 'not our problem' },
      listOfMembers,
      '123'
    )

    // We expect this because if the front end receives bad data, it is misleading to
    // dispay anything other than that data.
    // If we receive bad data and sanitise it to good data (e.g. fixing this to be a valid LC type),
    // there is a risk we misrepresent the letter of credit legal contract. Let's keep our bugs
    // here not with the courts :)
    expect(values.type).toEqual('not our problem')
  })
  it('selects the correct default currency', () => {
    const lc = fakeLetterOfCredit()
    delete lc.currency
    const values = selectInitialValuesFromLetterOfCredit(lc, listOfMembers, '123')

    expect(values.currency).toEqual(initialLetterOfCreditValues.currency)
  })
  it('selects an alternative currency', () => {
    const lc = fakeLetterOfCredit()
    lc.currency = Currency.EUR
    const values = selectInitialValuesFromLetterOfCredit(lc, listOfMembers, '123')

    expect(values.currency).toEqual(Currency.EUR)
  })
})

describe('findMemberName', () => {
  it('should return member CN', () => {
    const members = [
      fakeMember({
        staticId: '123',
        isMember: false,
        commonName: 'Name'
      })
    ]
    expect(findMemberName('123', members)).toBe('Name')
  })
  it('should return static id if member is not found', () => {
    const members = [
      fakeMember({
        staticId: '123',
        isMember: false,
        commonName: 'Name'
      })
    ]
    expect(findMemberName('1234', members)).toBe('1234')
  })
})

describe('findRoleForStaticId', () => {
  it('should return role for static id', () => {
    const presentation = fakePresentation({ staticId: '123' })
    expect(findRoleForStaticId('08e9f8e3-94e5-459e-8458-ab512bee6e2c', presentation)).toBe('Beneficiary')
    expect(findRoleForStaticId('a3d82ae6-908c-49da-95b3-ba1ebe7e5f85', presentation)).toBe('Applicant')
    expect(findRoleForStaticId('a28b8dc3-8de9-4559-8ca1-272ccef52b48', presentation)).toBe('Nominated Bank')
    expect(findRoleForStaticId('a28b8dc3-8de9-4559-8ca1-272ccef52b47', presentation)).toBe('Issuing Bank')
  })
})

describe('timerExists', () => {
  it('should return false if timer do not exists', () => {
    const letter: ILetterOfCredit = fakeLetterOfCredit()
    expect(timerExists(letter)).toBeFalsy()
  })

  it('should return false if timer do not exists', () => {
    const letter: ILetterOfCredit = { ...fakeLetterOfCredit(), timer: fakeTimer() }
    expect(timerExists(letter)).toBe(true)
  })
})

describe('getTimer', () => {
  it('should return null if timer do not exists', () => {
    const letter: ILetterOfCredit = fakeLetterOfCredit()
    expect(getTimer(letter)).toBe(null)
  })

  it('should return false if timer do not exists', () => {
    const timer = fakeTimer()
    const letter: ILetterOfCredit = { ...fakeLetterOfCredit(), timer }
    expect(getTimer(letter)).toEqual(timer.timerData[0].time)
  })
})
