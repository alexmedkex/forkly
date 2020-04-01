import 'reflect-metadata'

import { Trade } from '../models/Trade'

import { ITrade, buildFakeTrade, TradeSource } from '@komgo/types'

const NOT_FOUND = 'NOT_FOUND'
const GET_ID = 'GET_ID'
let memberClientMock

const TradeMockRepo = {
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  countDocuments: jest.fn()
}

jest.mock('../mongodb/TradeRepo', () => ({
  TradeRepo: TradeMockRepo
}))

const MOCK_BUYER_ID = 'node.GUNVOR_BFOET-123'
const MOCK_SELLER_ID = 'node.SHELL_BFOET-321'

import TradeDataAgent from './TradeDataAgent'

describe('TradeDataAgent', () => {
  beforeEach(() => {
    memberClientMock = {
      find: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_ID }]))
        .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_SELLER_ID }]))
    }

    TradeMockRepo.find = jest.fn().mockImplementation(() => {
      return {
        skip: () => ({
          limit: () => ({
            lean: () => Promise.resolve([])
          })
        })
      }
    })
    TradeMockRepo.create = jest.fn().mockImplementation(() => {
      return Promise.resolve({ _id: 1 })
    })
    TradeMockRepo.findOne = jest.fn().mockImplementation(record => {
      if (record._id === NOT_FOUND) {
        return Promise.resolve(undefined)
      }
      return Promise.resolve({
        toObject: () => ({ _id: 1 })
      })
    })
    TradeMockRepo.findOneAndUpdate = jest.fn().mockImplementation((query: any, data: ITrade) => {
      if (query._id === NOT_FOUND)
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
    TradeMockRepo.updateOne = jest.fn().mockImplementation((query: any, data: ITrade) => {
      if (query._id === NOT_FOUND)
        return Promise.resolve({
          n: 0
        })
      return Promise.resolve({
        n: 1
      })
    })
    TradeMockRepo.countDocuments = jest.fn().mockImplementation((query: any, data: ITrade) => {
      return Promise.resolve(1)
    })
  })
  it('is defined', () => {
    expect(new TradeDataAgent(memberClientMock)).toBeDefined()
  })

  describe('find', () => {
    it('returns trades', async () => {
      const trade = await new TradeDataAgent(memberClientMock).find({}, {}, { skip: 0, limit: 100 })
      expect(trade).toEqual([])
    })

    it('returns trades without options', async () => {
      const trade = await new TradeDataAgent(memberClientMock).find({}, {}, undefined)
      expect(trade).toEqual([])
    })
  })

  describe('create', () => {
    const testTrade = buildFakeTrade({ buyer: MOCK_BUYER_ID, seller: MOCK_SELLER_ID })

    it('returns an id', async () => {
      const { source, sourceId, ...options } = testTrade
      const trade = new Trade(source, sourceId, MOCK_BUYER_ID, options)
      expect(await new TradeDataAgent(memberClientMock).create(trade)).toEqual(1)
    })

    it('rejects an invalid buyer', done => {
      memberClientMock = {
        find: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_ID }]))
          .mockImplementationOnce(() => Promise.resolve([]))
      }
      const { source, sourceId, ...options } = testTrade
      const trade: any = new Trade(source, sourceId, MOCK_BUYER_ID, options)
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .create(trade)
        .then(() => done(fail(`it shouldn't succeed`)))
        .catch(error => {
          expect(error).toMatchObject({ message: `buyer '${MOCK_BUYER_ID}' not found` })
          done()
        })
    })

    it('rejects an invalid seller', done => {
      memberClientMock = {
        find: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve([]))
          .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_SELLER_ID }]))
      }
      const { source, sourceId, ...options } = testTrade
      const trade: any = new Trade(source, sourceId, MOCK_SELLER_ID, options)
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .create(trade)
        .then(() => done(fail(`it shouldn't succeed`)))
        .catch(error => {
          expect(error).toMatchObject({ message: `seller '${MOCK_SELLER_ID}' not found` })
          done()
        })
    })

    it('rejects same seller and buyer', done => {
      memberClientMock = {
        find: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_ID }]))
          .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_ID }]))
      }
      const { source, sourceId, ...options } = testTrade
      const trade: any = new Trade(source, sourceId, MOCK_BUYER_ID, options)
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .create(trade)
        .then(() => done(fail(`it shouldn't succeed`)))
        .catch(error => {
          expect(error).toMatchObject({
            message: `Buyer and seller can't be same`
          })
          done()
        })
    })
  })

  describe('delete', () => {
    it('returns void', done => {
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .delete('abc1')
        .then(() => done())
        .catch(e => done(e))
    })

    it('returns not found error', async () => {
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .delete(NOT_FOUND)
        .then(() => fail(`'it shouldn't succeed`))
        .catch(error => expect(error).toMatchObject({ message: 'Trade NOT_FOUND not found' }))
    })
  })

  describe('get', () => {
    it('returns a trade', async () => {
      const trade = await new TradeDataAgent(memberClientMock).get('abc1')
      expect(trade).toEqual({
        _id: 1
      })
    })

    it('returns 404', done => {
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .get(NOT_FOUND)
        .then(() => fail(`'it shouldn't succeed`))
        .catch(e => {
          expect(e).toMatchObject({ message: 'Trade NOT_FOUND not found' })
          done()
        })
    })
  })

  describe('count', () => {
    it('returns a trade', async () => {
      const trade = await new TradeDataAgent(memberClientMock).count({})
      expect(trade).toEqual(1)
    })
  })

  describe('update', () => {
    const testTrade = buildFakeTrade({ buyer: MOCK_BUYER_ID, seller: MOCK_SELLER_ID })

    it('returns void after a proper update', done => {
      const id = 'abc1'
      const update: ITrade = new Trade(TradeSource.Komgo, '123', MOCK_BUYER_ID, {
        seller: MOCK_SELLER_ID,
        buyer: MOCK_BUYER_ID
      })
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .update(id, update)
        .then(() => done())
        .catch(e => done(e))
    })

    it('rejects an invalid buyer', done => {
      const id = 'abc1'
      memberClientMock = {
        find: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve([{ id: '1' }]))
          .mockImplementationOnce(() => Promise.resolve([]))
      }
      const { source, sourceId, ...options } = testTrade
      const trade: any = new Trade(source, sourceId, MOCK_BUYER_ID, options)
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .update(id, trade)
        .then(() => done(fail(`it shouldn't succeed`)))
        .catch(error => {
          expect(error).toMatchObject({ message: `buyer '${MOCK_BUYER_ID}' not found` })
          done()
        })
    })

    it('rejects an invalid seller', done => {
      const id = 'abc1'
      memberClientMock = {
        find: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve([]))
          .mockImplementationOnce(() => Promise.resolve([{ id: '1' }]))
      }
      const { source, sourceId, ...options } = testTrade
      const trade: any = new Trade(source, sourceId, MOCK_BUYER_ID, options)
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .update(id, trade)
        .then(() => done(fail(`it shouldn't succeed`)))
        .catch(error => {
          expect(error).toMatchObject({ message: `seller '${MOCK_SELLER_ID}' not found` })
          done()
        })
    })

    it('rejects same seller and buyer', done => {
      const id = 'abc1'
      memberClientMock = {
        find: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_ID }]))
          .mockImplementationOnce(() => Promise.resolve([{ staticId: MOCK_BUYER_ID }]))
      }
      const { source, sourceId, ...options } = testTrade
      const trade: any = new Trade(source, sourceId, MOCK_BUYER_ID, options)
      const agent = new TradeDataAgent(memberClientMock)
      return agent
        .update(id, trade)
        .then(() => done(fail(`it shouldn't succeed`)))
        .catch(error => {
          expect(error).toMatchObject({
            message: `Buyer and seller can't be same`
          })
          done()
        })
    })
  })
})
