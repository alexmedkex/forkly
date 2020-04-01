import 'reflect-metadata'
import { CounterpartyProfileController } from './CounterpartyProfileController'
import CounterpartyProfileDataAgent from '../../data-layer/data-agents/CounterpartyProfileDataAgent'
import { RiskLevel } from '../../data-layer/models/profile/enums'
import { CreateCounterpartyProfileRequest } from '../request/counterparty-profile/CreateCounterpartyProfileRequest'
import { ICounterpartyProfile } from '../../data-layer/models/profile/ICounterpartyProfile'
import { UpdateCounterpartyProfileRequest } from '../request/counterparty-profile/UpdateCounterpartyProfileRequest'
import { ICounterpartyProfileResponse } from '../responses/counterparty-profile/ICounterpartyProfileResponse'

let profileDataAgent: jest.Mocked<CounterpartyProfileDataAgent>
let controller: CounterpartyProfileController
const riskLevelLow = RiskLevel.low

describe('CounterpartyProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    profileDataAgent = {
      getByCounterpartyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
    controller = new CounterpartyProfileController(profileDataAgent)
  })

  describe('.getCounterpartyProfile', () => {
    it('we try a GET on a counterparty that exists', async () => {
      const profile = {
        id: '1111',
        counterpartyId: 'COUNTERPARTY_ID',
        riskLevel: riskLevelLow,
        renewalDate: new Date(),
        managedById: 'ABCDE'
      }
      profileDataAgent.getByCounterpartyId.mockImplementation(() => profile)
      await controller.getCounterpartyProfile('COUNTERPARTY_ID')
      expect(profileDataAgent.getByCounterpartyId).toHaveBeenCalledTimes(1)
    })
    it('we try a GET on a counterparty that doesnt exists', async () => {
      profileDataAgent.getByCounterpartyId.mockImplementation(() => null)
      const call = controller.getCounterpartyProfile('COUNTERPARTY_ID')
      expect(call).rejects.toMatchObject({ status: 404, message: 'Counterparty not found' })
    })
  })

  describe('.postCounterpartyProfile', () => {
    it('stores a counterparty that doesnt clash with another already stored', async () => {
      const newProfile: CreateCounterpartyProfileRequest = {
        counterpartyId: 'COUNTERPARTY_ID_NEW',
        riskLevel: riskLevelLow,
        renewalDate: new Date(),
        managedById: 'ABCDE'
      }
      const fullProfile: ICounterpartyProfile = {
        id: '123',
        counterpartyId: 'COUNTERPARTY_ID_NEW',
        riskLevel: riskLevelLow,
        renewalDate: new Date(),
        managedById: 'ABCDE'
      }
      profileDataAgent.create.mockImplementation(() => fullProfile)
      profileDataAgent.getByCounterpartyId.mockImplementation(() => undefined)
      const resp: ICounterpartyProfileResponse = await controller.postCounterpartyProfile(newProfile)
      expect(profileDataAgent.getByCounterpartyId).toHaveBeenCalledTimes(1)
      expect(resp).toEqual(fullProfile)
    })

    it('stores a counterparty that clashes with another already stored', async () => {
      const newProfile: CreateCounterpartyProfileRequest = {
        counterpartyId: 'COUNTERPARTY_ID_NEW',
        riskLevel: riskLevelLow,
        renewalDate: new Date(),
        managedById: 'ABCDE'
      }
      profileDataAgent.getByCounterpartyId.mockImplementation(() => newProfile)
      const call = controller.postCounterpartyProfile(newProfile)
      expect(call).rejects.toMatchObject({
        status: 409,
        message: 'A risk profile for counterparty COUNTERPARTY_ID_NEW already exists'
      })
    })
  })

  describe('.patchCounterpartyProfile', () => {
    it('patch a counterparty that EXISTS', async () => {
      const idCounterparty = '12345'
      const mockedDate = new Date()
      const newProfile: UpdateCounterpartyProfileRequest = {
        riskLevel: riskLevelLow,
        renewalDate: mockedDate,
        managedById: 'ABCDE'
      }
      const updatedProfile: ICounterpartyProfile = {
        id: '11111',
        counterpartyId: idCounterparty,
        riskLevel: riskLevelLow,
        renewalDate: mockedDate,
        managedById: 'ABCDE'
      }
      profileDataAgent.update.mockImplementation(() => updatedProfile)
      profileDataAgent.getByCounterpartyId.mockImplementation(() => updatedProfile)
      const resp = await controller.patchCounterpartyProfile(idCounterparty, newProfile)
      expect(profileDataAgent.getByCounterpartyId).toHaveBeenCalledTimes(1)
      expect(resp).toEqual(updatedProfile)
    })
  })
})
