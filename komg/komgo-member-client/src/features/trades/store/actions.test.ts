import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import * as immutable from 'immutable'
import { toast } from 'react-toastify'
import {
  createTrade,
  fetchTrades,
  fetchCargos,
  fetchTradesWithCargos,
  fetchTradesDashboardData,
  filterTradingRole,
  FindTradeBySourceAndSourceId,
  getTrade,
  sortBy,
  FindCargoBySourceAndSourceId,
  fetchTradesWithRd,
  fetchRdsFromTrades,
  deleteDocuments,
  editTrade
} from './actions'
import { initialTradeState } from './reducer'
import { FilterTradingRole, ICreateOrUpdateTrade, SortTrades, TradeActionType } from './types'
import { TradingRole } from '../constants'
import { fakeCargo, fakeTrade } from '../../letter-of-credit-legacy/utils/faker'
import { TradeSource, CreditRequirements, buildFakeTrade, buildFakeCargo } from '@komgo/types'
import { ReceivableDiscountingApplicationActionType } from '../../receivable-discounting-legacy/store/application/types'
import { formatDocuments } from '../utils/formatters'
import { fakeDocument } from '../../letter-of-credit-legacy/utils/faker'
import { DOCUMENTS_BASE_ENDPOINT, TRADE_CARGO_BASE_ENDPOINT } from '../../../utils/endpoints'
import { TRADE_EDITED_MESSAGE } from '../constants'
import { ToastContainerIds } from '../../../utils/toast'
import { compressToEncodedURIComponent } from 'lz-string'

const mockCreateTradeValues: ICreateOrUpdateTrade = {
  trade: buildFakeTrade(),
  cargo: buildFakeCargo(),
  documents: []
}

const mockStore = configureMockStore([thunk])

describe('Trades actions', () => {
  let store
  let dispatchMock: any
  let apiMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => dummyAction),
      post: jest.fn(() => dummyAction),
      delete: jest.fn(() => dummyAction),
      put: jest.fn(() => dummyAction)
    }
  })

  describe('createTrade()', () => {
    it('should dispatch an action to clear error', () => {
      createTrade(mockCreateTradeValues)(dispatchMock, undefined, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith({
        type: TradeActionType.CREATE_TRADE_FAILURE,
        payload: null
      })
    })

    it('should post to create a trade', () => {
      createTrade({
        ...mockCreateTradeValues,
        trade: {
          ...mockCreateTradeValues.trade,
          price: 12345,
          source: 'X',
          sourceId: 'XY'
        }
      })(dispatchMock, undefined, apiMock)

      expect(apiMock.post).toHaveBeenCalledTimes(1)
      const [[url, options]] = apiMock.post.mock.calls
      expect(url).toEqual('/trade-cargo/v0/trades')
      expect(options.data).toEqual(
        expect.objectContaining({
          price: 12345,
          source: 'X'
        })
      )
      expect(options.data.sourceId).not.toBeDefined()
      expect(options.data.vaktId).not.toBeDefined()
      expect(options.type).toEqual(TradeActionType.CREATE_TRADE_REQUEST)
      expect(options.onSuccess).toEqual(expect.any(Function))
      expect(options.onError).toEqual(expect.any(Function))
    })

    it('should create a cargo if cargo exists and create trade succeeds', () => {
      createTrade({
        ...mockCreateTradeValues
      })(dispatchMock, undefined, apiMock)
      const [[, createTradeOptions]] = apiMock.post.mock.calls

      createTradeOptions.onSuccess({ sourceId: 'test-cargo-id' }).afterHandler({ dispatch: dispatchMock })
      const [, [url, options]] = apiMock.post.mock.calls

      expect(url).toEqual('/trade-cargo/v0/movements')
      expect(options.data).toEqual(
        expect.objectContaining({
          sourceId: 'test-cargo-id'
        })
      )
      expect(options.onSuccess).toEqual(expect.any(Function))
      expect(options.type).toEqual(TradeActionType.CREATE_CARGO_REQUEST)
      expect(options.onError).toEqual(expect.any(Function))
    })

    it('should not create a cargo if cargo does not exist', () => {
      createTrade({
        trade: mockCreateTradeValues,
        cargo: {
          cargoId: '',
          grade: '',
          parcels: []
        }
      })(dispatchMock, undefined, apiMock)
      const [[_, options]] = apiMock.post.mock.calls

      expect(options.onSuccess().afterHandler).not.toBeDefined()
      expect(apiMock.post).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchTradesDashboardData()', () => {
    beforeEach(() => {
      store = mockStore(initialTradeState)
    })

    it('calls api.get with the correct arguments', () => {
      fetchTradesDashboardData()(dispatchMock, () => store, apiMock)

      const [[url, options]] = apiMock.get.mock.calls
      expect(url).toEqual('/trade-cargo/v0/trades')
      expect(options.params).toEqual({})
      expect(options.onSuccess.type).toEqual(TradeActionType.TRADES_SUCCESS)
      expect(options.onSuccess.afterHandler).toBeDefined()
      expect(options.onError).toEqual(TradeActionType.TRADES_FAILURE)
    })

    it('includes params in action', () => {
      fetchTradesDashboardData({ sort: { etrmId: 1 } })(dispatchMock, () => store, apiMock)
      const [[url, options]] = apiMock.get.mock.calls
      expect(url).toEqual('/trade-cargo/v0/trades')
      expect(options.params).toEqual({
        sort: {
          etrmId: 1
        }
      })
      expect(options.onSuccess.type).toEqual(TradeActionType.TRADES_SUCCESS)
      expect(options.onSuccess.afterHandler).toBeDefined()
      expect(options.onError).toEqual(TradeActionType.TRADES_FAILURE)
    })
  })

  describe('fetchTradesWithRd()', () => {
    beforeEach(() => {
      store = mockStore(initialTradeState)
    })

    it('calls api.get with the correct arguments', () => {
      const mockCompanyId: string = 'companyIddd'
      fetchTradesWithRd(mockCompanyId)(dispatchMock, () => store, apiMock)

      const [[url, options]] = apiMock.get.mock.calls
      expect(url).toEqual('/trade-cargo/v0/trades')
      expect(options.params).toEqual({
        filter: {
          projection: {},
          options: {},
          query: { seller: mockCompanyId }
        }
      })
      expect(options.onSuccess.type).toEqual(TradeActionType.TRADES_SUCCESS)
      expect(options.onSuccess.afterHandler).toBeDefined()
      expect(options.onError).toEqual(TradeActionType.TRADES_FAILURE)
    })
  })

  describe('fetchTrades', () => {
    beforeEach(() => {
      store = mockStore(initialTradeState)
    })

    it('calls api.get with the source and sourceId', () => {
      const params: FindTradeBySourceAndSourceId = {
        source: TradeSource.Komgo,
        filter: {
          query: {
            source: TradeSource.Komgo,
            sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41'
          },
          projection: {},
          options: {}
        }
      }
      fetchTrades(params)(dispatchMock, () => store, apiMock)
      const [[url, options]] = apiMock.get.mock.calls
      expect(url).toEqual('/trade-cargo/v0/trades')
      expect(options.params).toEqual({
        filter: {
          options: {},
          projection: {},
          query: { source: 'KOMGO', sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41' }
        },
        source: 'KOMGO'
      })
      expect(options.onSuccess.type).toEqual(TradeActionType.TRADES_SUCCESS)
      expect(options.onError).toEqual(TradeActionType.TRADES_FAILURE)
    })

    it('calls afterHandler if it has been set', () => {
      const afterHandler = jest.fn(params => () => ({}))
      const params: FindTradeBySourceAndSourceId = {
        source: TradeSource.Komgo,
        filter: {
          query: {
            source: TradeSource.Komgo,
            sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41'
          },
          projection: {},
          options: {}
        }
      }
      fetchTrades(params, afterHandler)(dispatchMock, () => store, apiMock)
      const [[url, options]] = apiMock.get.mock.calls
      options.onSuccess.afterHandler(store)
      expect(afterHandler).toHaveBeenCalledWith({
        filter: {
          options: {},
          projection: {},
          query: { source: 'KOMGO', sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41' }
        },
        source: 'KOMGO'
      })
    })
  })

  describe('fetchCargos', () => {
    beforeEach(() => {
      store = mockStore(initialTradeState)
    })

    it('calls api.get with the source and sourceId', () => {
      const params: FindTradeBySourceAndSourceId = {
        source: TradeSource.Komgo,
        filter: {
          query: {
            source: TradeSource.Komgo,
            sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41'
          },
          projection: {},
          options: {}
        }
      }
      fetchCargos(params)(dispatchMock, () => store, apiMock)
      const [[url, options]] = apiMock.get.mock.calls
      expect(url).toEqual('/trade-cargo/v0/movements')
      expect(options.params).toEqual({
        filter: {
          options: {},
          projection: {},
          query: { source: 'KOMGO', sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41' }
        },
        source: 'KOMGO'
      })
      expect(options.onSuccess.type).toEqual(TradeActionType.TRADE_MOVEMENTS_SUCCESS)
      expect(options.onError).toEqual(TradeActionType.TRADE_MOVEMENTS_FAILURE)
    })

    it('calls afterHandler if it has been set', () => {
      const afterHandler = jest.fn(() => () => ({}))
      const params: FindCargoBySourceAndSourceId = {
        source: TradeSource.Komgo,
        filter: {
          query: {
            source: TradeSource.Komgo,
            sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41'
          },
          projection: {},
          options: {}
        }
      }
      fetchCargos(params, afterHandler)(dispatchMock, () => store, apiMock)
      const [[url, options]] = apiMock.get.mock.calls
      options.onSuccess.afterHandler(store)
      expect(afterHandler).toHaveBeenCalledWith({
        filter: {
          options: {},
          projection: {},
          query: { source: 'KOMGO', sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41' }
        },
        source: 'KOMGO'
      })
    })

    describe('fetchRdsFromTrades', () => {
      it('calls api.get with the correct arguments', () => {
        const getRdsByStaticIdEndpoint = '/receivable-finance/v0/info/rd'
        const mockTrades = [
          { creditRequirement: CreditRequirements.OpenCredit, sourceId: '1' } as any,
          { creditRequirement: CreditRequirements.OpenCredit, sourceId: '2' } as any
        ]

        fetchRdsFromTrades(mockTrades, true)(dispatchMock, jest.fn(), apiMock)

        expect(apiMock.get).toHaveBeenLastCalledWith(getRdsByStaticIdEndpoint, {
          onError: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_FAILURE,
          onSuccess: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS,
          type: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST,
          params: {
            polling: true
          }
          // NOTE - we are currenly skipping filter with tradeIds as this causes issues with request size
          // expect.objectContaining({
          //   filter: compressToEncodedURIComponent('{"tradeSourceIds":["1","2"]}'),
          //   polling: true
          // })
        })
      })
    })
  })

  describe('fetchTradesWithCargos', () => {
    beforeEach(() => {
      store = mockStore(initialTradeState)
    })

    it('calls trades and movements endpoint', () => {
      const params: FindTradeBySourceAndSourceId = {
        source: TradeSource.Komgo,
        filter: {
          query: {
            source: TradeSource.Komgo,
            sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41'
          },
          projection: {},
          options: {}
        }
      }
      fetchTradesWithCargos(params)(dispatchMock, () => store, apiMock)
      const [[tradeUrl, tradeOptions]] = apiMock.get.mock.calls
      expect(tradeUrl).toEqual('/trade-cargo/v0/trades')
      expect(tradeOptions.params).toEqual({
        filter: {
          options: {},
          projection: {},
          query: { source: 'KOMGO', sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41' }
        },
        source: 'KOMGO'
      })
      expect(tradeOptions.onSuccess.type).toEqual(TradeActionType.TRADES_SUCCESS)
      expect(tradeOptions.onError).toEqual(TradeActionType.TRADES_FAILURE)

      tradeOptions.onSuccess.afterHandler(store)
      const [_, [movementUrl, movementOptions]] = apiMock.get.mock.calls
      expect(movementUrl).toEqual('/trade-cargo/v0/movements')
      expect(movementOptions.params).toEqual({
        filter: {
          options: {},
          projection: {},
          query: { source: 'KOMGO', sourceId: 'fdb0b782-33f3-447e-8aa0-2ff67b2cdc41' }
        },
        source: 'KOMGO'
      })
      expect(movementOptions.onSuccess.type).toEqual(TradeActionType.TRADE_MOVEMENTS_SUCCESS)
      expect(movementOptions.onError).toEqual(TradeActionType.TRADE_MOVEMENTS_FAILURE)
    })
  })

  describe('getTrade()', () => {
    beforeEach(() => {
      store = mockStore(initialTradeState)
    })

    it('calls api.get with the id', () => {
      const id = 'abc123'
      getTrade(id)(dispatchMock, () => store, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(`/trade-cargo/v0/trades/${id}`, {
        onError: TradeActionType.TRADE_FAILURE,
        onSuccess: TradeActionType.TRADE_SUCCESS,
        type: TradeActionType.TRADE_REQUEST
      })
    })
  })

  describe('sortBy()', () => {
    let action: SortTrades
    beforeAll(() => {
      action = sortBy({ column: 'tradeId', direction: 1 })
    })
    it('creates an action with SORT_TRADES type', () => {
      expect(action.type).toBe(TradeActionType.SORT_TRADES)
    })
    it('has the column on the payload', () => {
      expect(action.payload.column).toBe('tradeId')
    })
    it('has the direction on the payload', () => {
      expect(action.payload.direction).toBe(1)
    })
  })

  describe('deleteDocuments()', () => {
    it('should dispatch success action', () => {
      const mockDocument = formatDocuments([fakeDocument({ name: 'document.png', id: '1' })])[0]
      deleteDocuments(mockDocument)(dispatchMock, undefined, apiMock)

      const [endpoint, config] = apiMock.delete.mock.calls[0]

      expect(endpoint).toBe(`${DOCUMENTS_BASE_ENDPOINT}/products/tradeFinance/documents/1`)
      expect(config.type).toBe(TradeActionType.DELETE_TRADE_DOCUMENT_REQUEST)
      expect(config.onError).toBe(TradeActionType.DELETE_TRADE_DOCUMENT_FAILURE)
      expect(config.onSuccess()).toBe(TradeActionType.DELETE_TRADE_DOCUMENT_SUCCESS)
    })
  })

  describe('editTrade()', () => {
    const tradeValues = fakeTrade({ sourceId: 'source123' })
    const cargoValues = fakeCargo()
    const document = fakeDocument()
    const tradeMovements = immutable.List([cargoValues])
    const tradeDocuments = immutable.List([document])
    let state

    beforeEach(() => {
      state = new Map([['trades', immutable.Map({ tradeMovements, tradeDocuments })]])
      toast.success = jest.fn()
    })

    it('should call edit trade end point with appropriate values', () => {
      const mockValues: ICreateOrUpdateTrade = {
        trade: tradeValues,
        cargo: cargoValues,
        documents: formatDocuments([document])
      }

      editTrade('123', mockValues, 'source123', {})(dispatchMock, () => state as any, apiMock)
      const [endpoint, config] = apiMock.put.mock.calls[0]
      expect(endpoint).toBe(`${TRADE_CARGO_BASE_ENDPOINT}/trades/123`)
      expect(config.type).toBe(TradeActionType.EDIT_TRADE_REQUEST)
      expect(config.data).toEqual(mockValues.trade)
      expect(config.onError().type).toEqual(TradeActionType.EDIT_TRADE_FAILURE)
      expect(config.onSuccess().type).toEqual(TradeActionType.EDIT_TRADE_SUCCESS)
      expect(toast.success).toHaveBeenCalledWith(TRADE_EDITED_MESSAGE, { containerId: ToastContainerIds.Default })
    })
  })
})

describe('filterTradingRole()', () => {
  let action: FilterTradingRole
  beforeAll(() => {
    action = filterTradingRole({ role: TradingRole.SELLER, company: 'shell' })
  })
  it('creates an action with SORT_TRADES type', () => {
    expect(action.type).toBe(TradeActionType.FILTER_TRADING_ROLE)
  })
  it('has the company on the payload', () => {
    expect(action.payload.company).toBe('shell')
  })
  it('has the field on the payload', () => {
    expect(action.payload.role).toBe(TradingRole.SELLER)
  })
})
