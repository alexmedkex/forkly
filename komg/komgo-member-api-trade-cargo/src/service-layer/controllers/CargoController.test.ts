import 'reflect-metadata'
import { ICargoDataAgent } from '../../data-layer/data-agents/ICargoDataAgent'
import { Cargo } from '../../data-layer/models/Cargo'
import { CargoController } from './CargoController'
import { LOC_STATUS } from '../../data-layer/constants/LetterOfCreditStatus'
import moment = require('moment')
import { ITradeDataAgent } from '../../data-layer/data-agents/ITradeDataAgent'
import { ICargoValidator } from '../../data-layer/validation/CargoValidator'
import { stringify } from 'qs'
import { IEventMessagePublisher } from '../events/IEventMessagePublisher'
import { ICargoBase, TradeSource, ICargo, Grade, buildFakeCargo, buildFakeCargoBase } from '@komgo/types'
import { CargoUpdateMessageUseCase } from '../../business-layer/CargoUpdateMessageUseCase'
import { createMockInstance } from 'jest-create-mock-instance'

const MOCK_ID = '3ea30520n42b4n4495n964dn4e63224b8332'

const MOCK_BASE_DATA: ICargoBase = {
  ...buildFakeCargoBase(),
  source: TradeSource.Komgo,
  cargoId: '5555aaaaaa',
  sourceId: '444AAA444',
  grade: Grade.Brent,
  parcels: [
    {
      id: '1',
      laycanPeriod: { startDate: moment('2018-09-01').toDate(), endDate: moment('2018-09-30').toDate() },
      vesselIMO: 1,
      vesselName: 'Andrej',
      loadingPort: 'Banja luka',
      dischargeArea: 'Sarajevo',
      inspector: 'Kenan',
      deemedBLDate: moment('2018-09-01').toDate(),
      quantity: 3
    }
  ]
}
const MOCK_DATA: ICargo = {
  ...MOCK_BASE_DATA,
  sourceId: '444AAA444',
  cargoId: '5555aaaaaa',
  createdAt: '2019-06-12T11:24:20.000Z',
  updatedAt: '2019-06-12T11:24:20.000Z',
  status: LOC_STATUS.TO_BE_FINANCED,
  _id: MOCK_ID
}
const MOCK_DATA_UPDATED: ICargo = { ...MOCK_DATA, quality: 'dfdfd' }

let controller: CargoController
let agent: ICargoDataAgent
let tradeDataAgent: ITradeDataAgent
let cargoValidator: ICargoValidator

describe('CargoController', () => {
  let mockCargoUpdateMessageUseCase: jest.Mocked<CargoUpdateMessageUseCase>

  beforeEach(() => {
    mockCargoUpdateMessageUseCase = createMockInstance(CargoUpdateMessageUseCase)

    agent = {
      create: jest.fn(cargo => {
        if (cargo.source === TradeSource.Komgo) {
          return MOCK_ID
        }
        return cargo.cargoId
      }),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(
        (): ICargo => {
          return MOCK_DATA
        }
      ),
      find: jest.fn().mockImplementation(() => {
        const cargo: ICargo = {
          ...buildFakeCargo(),
          source: TradeSource.Komgo,
          grade: 'A1' as any,
          status: LOC_STATUS.TO_BE_FINANCED,
          sourceId: '1',
          cargoId: '2',
          parcels: [],
          _id: '123'
        }
        return [cargo]
      }),
      findOne: jest.fn(() => MOCK_DATA),
      count: jest.fn(() => 1)
    }
    tradeDataAgent = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn()
    }
    cargoValidator = {
      validate: jest.fn().mockReturnValue(null)
    }
    controller = new CargoController(agent, tradeDataAgent, cargoValidator, mockCargoUpdateMessageUseCase)
  })

  describe('.create', () => {
    it('returns an id', async () => {
      tradeDataAgent.findOne = jest.fn().mockResolvedValue({ _id: 1 })

      expect(await controller.create(MOCK_BASE_DATA)).toEqual({
        _id: MOCK_ID
      })

      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledWith({}, MOCK_DATA)
    })

    it('creates cargo with right sourceId', async () => {
      tradeDataAgent.findOne = jest.fn().mockResolvedValue({ _id: 1 })
      agent.get = jest.fn().mockResolvedValue(MOCK_DATA_UPDATED)

      expect(await controller.create(MOCK_BASE_DATA)).toEqual({
        _id: MOCK_ID
      })

      expect(agent.create).toBeCalledWith(
        expect.objectContaining({
          sourceId: MOCK_DATA.sourceId
        })
      )
      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledWith({}, MOCK_DATA_UPDATED)
    })

    it('throws error', async () => {
      tradeDataAgent.find = jest.fn().mockResolvedValue(null)
      controller
        .create(MOCK_DATA)
        .then(() => fail(`'it shouldn't succeed`))
        .catch(error => {
          expect(error.message).toEqual('Trade for cargo does not exists')
        })
    })

    it('returns an cargo id', async () => {
      const { source, cargoId, ...options } = MOCK_DATA
      const requestData: ICargo = {
        source: TradeSource.Vakt,
        cargoId,
        ...options
      }
      tradeDataAgent.findOne = jest.fn().mockResolvedValue({ _id: 1 })
      expect(await controller.create(requestData)).toEqual({
        _id: cargoId
      })
    })
  })

  describe('.get', () => {
    it('returns a cargo', async () => {
      expect(await controller.get(MOCK_ID, TradeSource.Komgo)).toEqual({
        ...MOCK_DATA,
        status: LOC_STATUS.TO_BE_FINANCED
      })
    })
  })

  describe('.delete', () => {
    it('delete a cargo', done => {
      return controller.delete(MOCK_ID, TradeSource.Komgo).then(() => done())
    })
  })

  describe('.update', () => {
    it('updates a cargo', async () => {
      const update: ICargo = {
        ...MOCK_DATA,
        source: TradeSource.Vakt,
        sourceId: 'abc0',
        cargoId: 'def1',
        parcels: [],
        _id: '123',
        status: LOC_STATUS.TO_BE_FINANCED
      }
      agent.update = jest.fn().mockResolvedValue(update)
      agent.get = jest.fn().mockResolvedValue(MOCK_DATA)

      await controller.update(MOCK_ID, update)

      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledWith(MOCK_DATA, update)
    })

    it('updates a cargo with sourceId', async () => {
      const update: ICargo = {
        ...MOCK_DATA,
        source: TradeSource.Komgo,
        sourceId: 'abc0',
        cargoId: 'def1',
        parcels: [],
        status: LOC_STATUS.TO_BE_FINANCED
      }
      agent.update = jest.fn().mockResolvedValue(update)
      agent.get = jest.fn().mockResolvedValue(MOCK_DATA)

      await controller.update(MOCK_ID, update)

      const { source, sourceId, ...expectedCargo } = update
      expect(agent.update).toBeCalledWith(MOCK_ID, new Cargo(source, sourceId, { ...expectedCargo }))
      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledTimes(1)
      expect(mockCargoUpdateMessageUseCase.execute).toBeCalledWith(MOCK_DATA, update)
    })
  })

  describe('.find', () => {
    it('returns cargo', async () => {
      // '?filter%5Bquery%5D%5B_id%5D=123&filter%5Bprojection%5D%5B_id%5D=1'
      const filter = {
        query: { _id: '123' },
        projection: { _id: 1 },
        options: {}
      }

      expect(await controller.find(stringify(filter), TradeSource.Komgo)).toEqual({
        items: [
          {
            _id: '123',
            createdAt: '2019-01-01T00:00:00.000Z',
            updatedAt: '2019-01-01T00:00:00.000Z',

            source: TradeSource.Komgo,
            status: 'TO_BE_FINANCED',
            grade: 'A1',
            sourceId: '1',
            cargoId: '2',
            parcels: [],
            version: 2,
            quality: 'top',
            originOfGoods: 'China'
          }
        ],
        limit: 100,
        skip: 0,
        total: 1
      })
    })
  })
})
