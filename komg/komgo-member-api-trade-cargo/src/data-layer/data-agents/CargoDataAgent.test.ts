import 'reflect-metadata'
import moment = require('moment')
import { ICargo, TradeSource, Grade, buildFakeCargo } from '@komgo/types'
import { DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { LOC_STATUS } from '../constants/LetterOfCreditStatus'

const CARGO_ID = 'test1234'
const NOT_FOUND = 'NOT_FOUND'

const cargoRepo = {
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn()
}

jest.mock('../mongodb/CargoRepo', () => ({
  CargoRepo: cargoRepo
}))

const MOCK_DATA: ICargo = {
  ...buildFakeCargo(),
  source: TradeSource.Komgo,
  sourceId: '113355',
  grade: Grade.Brent,
  cargoId: '224466',
  parcels: [
    {
      id: '6667777',
      laycanPeriod: { startDate: moment('2018-09-01').toDate(), endDate: moment('2018-09-30').toDate() },
      vesselIMO: 33434,
      vesselName: '',
      loadingPort: 'loading port',
      dischargeArea: 'end port',
      inspector: 'Test inspector',
      deemedBLDate: moment('2018-09-01').toDate(),
      quantity: 1000
    }
  ],
  _id: '123',
  status: LOC_STATUS.TO_BE_FINANCED
}

import { Cargo } from '../models/Cargo'

import CargoDataAgent from './CargoDataAgent'

describe('CargoDataAgent', () => {
  beforeEach(() => {
    cargoRepo.find.mockReset()
    cargoRepo.countDocuments.mockReset()
    cargoRepo.create.mockReset()
    cargoRepo.findOne.mockReset()
    cargoRepo.deleteOne.mockReset()
    cargoRepo.findOneAndUpdate.mockReset()
    cargoRepo.updateOne.mockReset()
    cargoRepo.find.mockImplementation((filter: object, sort: object, skip: number, limit: number) => {
      return {
        skip: () => ({
          limit: () => ({
            lean: () => Promise.resolve([])
          })
        })
      }
    })
    cargoRepo.findOneAndUpdate.mockResolvedValue(0)
    cargoRepo.updateOne.mockResolvedValue(0)
    cargoRepo.create.mockImplementation((record: any) => {
      return Promise.resolve({ _id: 1 })
    })
    cargoRepo.findOne.mockImplementation((record: any) => {
      if (record._id === NOT_FOUND || record.cargoId === NOT_FOUND) {
        return Promise.resolve(undefined)
      }
      return Promise.resolve({
        toObject: () => ({ _id: 1 })
      })
    })
    cargoRepo.deleteOne.mockImplementation((record: any) => {
      if (record._id === NOT_FOUND) {
        return Promise.resolve({ n: 0 })
      }
      return Promise.resolve({ n: 1 })
    })
    cargoRepo.findOneAndUpdate.mockImplementation((record: any, data: ICargo) => {
      if (record === NOT_FOUND || record.cargoId === NOT_FOUND || record._id === NOT_FOUND)
        return {
          exec: jest.fn().mockResolvedValueOnce({
            toObject: () => ({
              n: 0
            })
          })
        }
      return {
        exec: jest.fn().mockResolvedValueOnce({
          toObject: () => ({
            n: 1
          })
        })
      }
    })
    cargoRepo.updateOne.mockImplementation((record: any, data: ICargo) => {
      if (record === NOT_FOUND || record.cargoId === NOT_FOUND || record._id === NOT_FOUND)
        return Promise.resolve({ n: 0 })
      return Promise.resolve({ n: 1 })
    })
  })

  it('is defined', () => {
    expect(new CargoDataAgent()).toBeDefined()
  })

  describe('create', () => {
    it('returns an cargoid', async () => {
      const { source, sourceId, cargoId, ...options } = MOCK_DATA
      cargoRepo.create.mockImplementation((record: any) => {
        return Promise.resolve({ _id: 1, ...record })
      })

      const cargo = new Cargo(TradeSource.Vakt, sourceId, { cargoId, ...options })
      expect(await new CargoDataAgent().create(cargo)).toEqual(cargoId)
    })

    it('returns invalidArgumentException', done => {
      const { source, sourceId, ...options } = MOCK_DATA
      options.cargoId = undefined
      const cargo = new Cargo(TradeSource.Vakt, sourceId, options)
      const agent = new CargoDataAgent()
      return agent
        .create(cargo)
        .then(() => fail(`'it shouldn't succeed`))
        .catch(error => {
          expect(error).toMatchObject({ message: "'cargoid' is obligatory for source VAKT" })
          done()
        })
    })
  })

  describe('delete', () => {
    it('returns void', done => {
      const agent = new CargoDataAgent()
      return agent
        .delete(CARGO_ID, TradeSource.Komgo)
        .then(() => done())
        .catch(e => done(e))
    })

    it('returns not found error', done => {
      const agent = new CargoDataAgent()
      return agent
        .delete(NOT_FOUND, TradeSource.Komgo)
        .then(() => fail(`'it shouldn't succeed`))
        .catch(e => {
          expect(e).toMatchObject({ message: 'Cargo NOT_FOUND not found', error: DATA_ACCESS_ERROR.NOT_FOUND })
          done()
        })
    })
  })

  describe('find', () => {
    it('returns cargo', async () => {
      const trade = await new CargoDataAgent().find({}, {}, { skip: 0, limit: 100 })
      expect(trade).toEqual([])
    })

    it('returns cargo without options', async () => {
      const trade = await new CargoDataAgent().find({}, {}, undefined)
      expect(trade).toEqual([])
    })
  })

  describe('get', () => {
    it('returns a cargo', async () => {
      const cargo = await new CargoDataAgent().get('test123', TradeSource.Komgo)
      expect(cargo).toEqual({
        _id: 1
      })
    })

    it('returns 404', done => {
      const agent = new CargoDataAgent()
      return agent
        .get(NOT_FOUND, TradeSource.Komgo)
        .then(() => fail(`'it shouldn't succeed`))
        .catch(e => {
          expect(e).toMatchObject({ message: 'Cargo NOT_FOUND not found', error: DATA_ACCESS_ERROR.NOT_FOUND })
          done()
        })
    })
  })

  describe('update', () => {
    it('returns void after a proper update', done => {
      const id = CARGO_ID
      const update: ICargo = new Cargo(TradeSource.Komgo, '123', {
        cargoId: '223344',
        parcels: [{ id: '111222' }]
      })
      const agent = new CargoDataAgent()
      return agent
        .update(id, update)
        .then(() => done())
        .catch(e => done(e))
    })
  })
})
