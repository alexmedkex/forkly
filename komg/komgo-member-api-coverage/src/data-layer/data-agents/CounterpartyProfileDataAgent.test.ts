import 'reflect-metadata'

let counterpartyProfileMock: jest.Mocked<CounterpartyProfileModel>
counterpartyProfileMock = {
  create: jest.fn(),
  getByCounterpartyId: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn()
}
let dataAgent: CounterpartyProfileDataAgent
jest.mock('../models/profile/CounterpartyProfile', () => ({
  CounterpartyProfile: counterpartyProfileMock
}))

import CounterpartyProfileDataAgent from './CounterpartyProfileDataAgent'
import { CounterpartyProfileModel } from '../models/profile/CounterpartyProfile'
import { RiskLevel } from '../models/profile/enums'

describe('CounterpartyProfileDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    dataAgent = new CounterpartyProfileDataAgent()
  })

  describe('.create', () => {
    it('create', async () => {
      counterpartyProfileMock.create.mockImplementation(() => undefined)
      const profile = {
        id: '1111',
        counterpartyId: 'COUNTERPARTY_ID',
        riskLevel: RiskLevel.low,
        renewalDate: new Date(),
        managedById: 'ABCDE'
      }
      await counterpartyProfileMock.create(profile)
      expect(counterpartyProfileMock.create).toHaveBeenCalledTimes(1)
      expect(counterpartyProfileMock.create).toHaveBeenCalledWith(profile)
    })
  })

  it('create with real implementation', async () => {
    counterpartyProfileMock.create.mockImplementation(() => undefined)
    const profile = {
      id: '1111',
      counterpartyId: 'COUNTERPARTY_ID',
      riskLevel: RiskLevel.low,
      renewalDate: new Date(),
      managedById: 'ABCDE'
    }
    counterpartyProfileMock.findOne.mockImplementation(() => profile)
    await dataAgent.create(profile)
    expect(counterpartyProfileMock.create).toHaveBeenCalledTimes(1)
    expect(counterpartyProfileMock.create).toHaveBeenCalledWith(profile)
  })
})

describe('.getByCounterpartyId', () => {
  it('getByCounterpartyId', async () => {
    const profile = {
      id: '1111',
      counterpartyId: 'COUNTERPARTY_ID',
      riskLevel: RiskLevel.low,
      renewalDate: new Date(),
      managedById: 'ABCDE'
    }
    counterpartyProfileMock.findOne.mockImplementation(() => profile)
    await dataAgent.getByCounterpartyId(profile.counterpartyId)
  })
})
