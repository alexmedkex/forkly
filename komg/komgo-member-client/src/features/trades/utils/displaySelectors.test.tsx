import { ITradeEnriched } from '../store/types'
import { Map, List, fromJS } from 'immutable'
import {
  selectVisibleTrades,
  displayQuantity,
  displayPrice,
  displayLCStatus,
  selectCounterparty,
  getHumanReadableLCStatus,
  displayCreditRequirement,
  displayEtrmId,
  selectNewestLetterOfCreditWithTradeId,
  findFieldFromTradeSchema,
  displayValue,
  displayYesOrNo
} from './displaySelectors'
import { capitalize } from '../../../utils/casings'

import {
  NOTENOUGHINFO,
  UNRECOGNISED_STATUS,
  LOC_STATUS,
  LOC_CATEGORIES,
  TradingRole,
  CREDIT_REQUIREMENT_LABEL
} from '../constants'
import { fakeTrade, fakeParcel } from '../../letter-of-credit-legacy/utils/faker'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { TradeSource, ITrade, CreditRequirements } from '@komgo/types'

const exampleCompany = 'my oil company'
const exampleCompanyId = '123'

const exampleTrades: ITradeEnriched[] = [
  {
    ...fakeTrade(),
    source: TradeSource.Vakt,
    status: 'OK',
    sourceId: '1',
    _id: 'a',
    buyer: exampleCompanyId,
    buyerName: exampleCompany,
    seller: '321',
    sellerName: exampleCompany
  },
  {
    ...fakeTrade(),
    source: TradeSource.Komgo,
    status: 'LOST',
    sourceId: '2',
    _id: 'b',
    seller: exampleCompanyId,
    sellerName: exampleCompany,
    buyer: 'texaco',
    buyerName: '098'
  },
  {
    ...fakeTrade(),
    source: TradeSource.Vakt,
    status: 'SHIPPED',
    sourceId: '2',
    _id: 'c',
    seller: exampleCompanyId,
    sellerName: exampleCompany,
    buyer: 'texaco',
    buyerName: '098'
  }
]

describe('selectVisibleTrades', () => {
  let trades: Map<string, ITrade>
  let tradeIds: List<string>
  beforeAll(() => {
    const map: any = exampleTrades.reduce(
      (memo, trade: ITrade) => ({
        ...memo,
        [trade._id!]: trade
      }),
      {}
    )
    trades = fromJS(map)
  })
  beforeEach(() => {
    tradeIds = List<string>()
  })
  it('selects no trades if the tradeId list is empty', () => {
    const selectedTrades = selectVisibleTrades(trades, tradeIds)

    expect(selectedTrades.length).toBe(0)
  })
  it('selects the correct trades if the tradeId list is populated', () => {
    tradeIds = tradeIds.push(exampleTrades[0]._id!).push(exampleTrades[2]._id!)

    const selectedTrades = selectVisibleTrades(trades, tradeIds)

    expect(selectedTrades.length).toEqual(2)
    expect(selectedTrades[0]).toEqual(exampleTrades[0])
    expect(selectedTrades[1]).toEqual(exampleTrades[2])
  })
  it('throws error if an ID is given which is not in the trades store', () => {
    tradeIds = tradeIds.push('abc')
    expect(() => selectVisibleTrades(trades, tradeIds)).toThrow()
  })
})

describe('displayYesOrNo', () => {
  it('displays Yes when true', () => {
    expect(displayYesOrNo(true)).toBe('Yes')
  })
  it('displays No when false', () => {
    expect(displayYesOrNo(false)).toBe('No')
  })
})

describe('displayQuantity', () => {
  it('displays quantity and price unit if both given', () => {
    const result = displayQuantity(1, 'bbl')
    expect(result).toEqual('1 bbl')
  })
  it('displays nothing if no quantity information given', () => {
    const result = displayQuantity(undefined, 'bbl')
    expect(result).toEqual(NOTENOUGHINFO)
  })
  it('displays nothing if no price unit information given', () => {
    const result = displayQuantity(1)
    expect(result).toEqual(NOTENOUGHINFO)
  })
  it('displays comma separated quantity', () => {
    const result = displayQuantity(40000, 'bbl')
    expect(result).toEqual('40,000 bbl')
  })
})

describe('displayPrice', () => {
  it('displays full information if given', () => {
    expect(displayPrice(1, 'usd', 'bbl')).toEqual('1.00 usd/bbl')
  })
  it('displays nothing if no price given', () => {
    expect(displayPrice(undefined, 'usd', 'bbl')).toEqual(NOTENOUGHINFO)
  })
  it('displays nothing if no currency given', () => {
    expect(displayPrice(1, undefined, 'bbl')).toEqual(NOTENOUGHINFO)
  })
  it('displays nothing if no priceunit given', () => {
    expect(displayPrice(1, 'usd', undefined)).toEqual(NOTENOUGHINFO)
  })
  it('displays comma separated quantity with 2 decimal points', () => {
    const result = displayPrice(40000, 'usd', 'bbl')
    expect(result).toEqual('40,000.00 usd/bbl')
  })
})

describe('displayLCStatus', () => {
  it('displays nothing if there is an undefined status', () => {
    expect(displayLCStatus()).toBeUndefined()
  })
  it('displays a red label if the trade is waiting to be financed', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.TO_BE_FINANCED)!

    expect(jsxResult.props.trigger.props.color).toEqual('red')
    expect(jsxResult.props.color).toEqual('red')
  })
  it('contains "Waiting to be financed" text if the trade is waiting to be financed', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.TO_BE_FINANCED)!

    expect(jsxResult.props.children).toContain(capitalize((LOC_CATEGORIES as any)[LOC_STATUS.TO_BE_FINANCED]))
  })
  it('displays a green label if the LC is of issued type', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.ADVISED)!

    expect(jsxResult.props.trigger.props.color).toEqual('green')
  })
  it('contains "LC issued" text if the LC is of issued type', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.RECEIVED)!

    expect(jsxResult.props.children).toEqual(capitalize(LOC_CATEGORIES.ISSUED))
  })
  it('displays an uncoloured label if the LC is refused', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.REFUSED)!

    expect(jsxResult.props.trigger.props.color).toEqual(undefined)
    expect(jsxResult.props.trigger.props.basic).toEqual(true)
  })
  it('contains "LC closed" text if the LC is closed', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.REFUSED)!

    expect(jsxResult.props.children).toContain(capitalize(LOC_CATEGORIES.CLOSED))
  })
  it('displays an uncoloured basic label if the LC is paid', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.PAID)!

    expect(jsxResult.props.trigger.props.color).toEqual(undefined)
    expect(jsxResult.props.trigger.props.basic).toEqual(true)
  })
  it('contains "LC closed" text if the LC is paid', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.PAID)!

    expect(jsxResult.props.children).toContain(capitalize(LOC_CATEGORIES.CLOSED))
  })
  it('displays a yellow label if the LC status is submitted', () => {
    const jsxResult: JSX.Element = displayLCStatus(LOC_STATUS.SUBMITTED)!

    expect(jsxResult.props.trigger.props.color).toEqual('yellow')
  })
})

describe('selectCounterparty', () => {
  it('selects the seller id if we are the buyer', () => {
    const result = selectCounterparty(exampleTrades[0], TradingRole.BUYER)
    expect(result).toEqual(exampleTrades[0].sellerName)
  })
  it('selects the buyer id if we are the seller', () => {
    const result = selectCounterparty(exampleTrades[0], TradingRole.SELLER)
    expect(result).toEqual(exampleTrades[0].buyerName)
  })
})

describe('getHumanReadableLCStatus', () => {
  it('selects to be financed for a TO_BE_FINANCED status', () => {
    const result = getHumanReadableLCStatus(LOC_STATUS.TO_BE_FINANCED)

    expect(result).toEqual(LOC_CATEGORIES.TO_BE_FINANCED)
  })
  it('selects LC issued for a ISSUED category status', () => {
    const result = getHumanReadableLCStatus(LOC_STATUS.ADVISED)

    expect(result).toEqual(LOC_CATEGORIES.ISSUED)
  })
  it('selects LC in progress for SUBMITTED status', () => {
    const result = getHumanReadableLCStatus(LOC_STATUS.SUBMITTED)

    expect(result).toEqual(LOC_CATEGORIES.IN_PROGRESS)
  })
  it('selects LC closed for REFUSED status', () => {
    const result = getHumanReadableLCStatus(LOC_STATUS.REFUSED)

    expect(result).toEqual(LOC_CATEGORIES.CLOSED)
  })
  it('selects Status unrecognized for a status not matching', () => {
    const result = getHumanReadableLCStatus('rasdfjh34kjk')

    expect(result).toEqual(UNRECOGNISED_STATUS)
  })
})

describe('displayCreditRequirement', () => {
  it('selects Documentary LC for a DOCUMENTARY_LETTER_OF_CREDIT creditRequirement', () => {
    const result = displayCreditRequirement(CreditRequirements.DocumentaryLetterOfCredit)

    expect(result).toEqual(CREDIT_REQUIREMENT_LABEL.DOCUMENTARY_LETTER_OF_CREDIT)
  })
  it('selects Standby LC for a STANDBY_LETTER_OF_CREDIT creditRequirement', () => {
    const result = displayCreditRequirement(CreditRequirements.StandbyLetterOfCredit)

    expect(result).toEqual(CREDIT_REQUIREMENT_LABEL.STANDBY_LETTER_OF_CREDIT)
  })
  it('selects Open Credit for a OPEN_CREDIT creditRequirement', () => {
    const result = displayCreditRequirement(CreditRequirements.OpenCredit)

    expect(result).toEqual(CREDIT_REQUIREMENT_LABEL.OPEN_CREDIT)
  })
  it('selects Offset for a OFFSET creditRequirement', () => {
    const result = displayCreditRequirement(CreditRequirements.Offset)

    expect(result).toEqual(CREDIT_REQUIREMENT_LABEL.OFFSET)
  })
  it('selects Status unrecognized for a status not matching', () => {
    const result = displayCreditRequirement('ewefwefwefwef')

    expect(result).toEqual(UNRECOGNISED_STATUS)
  })
})

describe('displayEtrmId', () => {
  it('Displays buyerEtrmId if company is buyer and role is empty', () => {
    const trade = exampleTrades[0]
    const result = displayEtrmId(trade, exampleCompanyId)

    expect(result).toEqual(trade.buyerEtrmId)
  })
  it('Displays sellerEtrmId if company is seller and role is empty', () => {
    const trade = exampleTrades[1]
    const result = displayEtrmId(trade, exampleCompanyId)

    expect(result).toEqual(trade.sellerEtrmId)
  })
  it('Display buyerEtrmId if company is buyer and credit requirement is open credit', () => {
    const trade = { ...exampleTrades[0], creditRequirement: CreditRequirements.OpenCredit }
    const result = displayEtrmId(trade, exampleCompanyId)

    expect(result).toEqual(trade.buyerEtrmId)
  })
  it('Display sellerEtrmId if company is seller and credit requirement is open credit', () => {
    const trade = { ...exampleTrades[1], creditRequirement: CreditRequirements.OpenCredit }
    const result = displayEtrmId(trade, exampleCompanyId)

    expect(result).toEqual(trade.sellerEtrmId)
  })
  it('Display buyerEtrmId if company is empty and role is issuing bank', () => {
    const trade = exampleTrades[0]
    const result = displayEtrmId(trade, undefined, Roles.ISSUING_BANK)

    expect(result).toEqual(trade.buyerEtrmId)
  })
  it('Displays sellerEtrmId if company is empty and role is advising bank', () => {
    const trade = exampleTrades[0]
    const result = displayEtrmId(trade, undefined, Roles.ADVISING_BANK)

    expect(result).toEqual(trade.sellerEtrmId)
  })
})

describe('selectNewestLetterOfCreditWithTradeId', () => {
  const exampleLetters: any = [
    {
      _id: '123',
      status: 'request rejected',
      tradeAndCargoSnapshot: { trade: { _id: '123_1' } },
      updatedAt: '2018-12-06T11:44:39.704Z'
    },
    {
      _id: '234',
      status: 'request rejected',
      updatedAt: '2014-05-24T11:44:39.123Z',
      tradeAndCargoSnapshot: { trade: { _id: '234_1' } }
    },
    {
      _id: '234',
      status: 'requested',
      updatedAt: '2016-11-04T13:12:33.321Z',
      tradeAndCargoSnapshot: { trade: { _id: '234_1' } }
    },
    {
      _id: '234',
      status: 'nope',
      tradeAndCargoSnapshot: { trade: { _id: '234_1' } }
    }
  ]
  it('returns a letter of credit matching the id given', () => {
    const letter = selectNewestLetterOfCreditWithTradeId(exampleLetters, '123_1')

    expect(letter).not.toBeUndefined()
    expect(letter!._id).toEqual('123')
  })
  it('returns undefined if no letter of credit is matched', () => {
    expect(selectNewestLetterOfCreditWithTradeId(exampleLetters, 'noMatch')).toBeUndefined()
  })
  it('returns the newest letter if two letters of credit match', () => {
    expect(selectNewestLetterOfCreditWithTradeId(exampleLetters, '234_1')!.status).toEqual('requested')
  })
})

describe('findFieldFromSchema', () => {
  it('should find field name from schema', () => {
    expect(findFieldFromTradeSchema('title', 'sellerEtrmId')).toBe("Seller's reference")
    expect(findFieldFromTradeSchema('title', 'paymentTerms.eventBase')).toBe('Eventbase')
  })
  it('if field name do not exist should return same text which is passed as field name', () => {
    expect(findFieldFromTradeSchema('title', 'test')).toBe('test')
    expect(findFieldFromTradeSchema('title', 'test.test')).toBe('test.test')
  })
})

describe('displayValue', () => {
  describe('displays', () => {
    it('maxTolerance', () => {
      expect(displayValue(1, 'maxTolerance')).toEqual('1.00%')
    })

    it('minTolerance', () => {
      expect(displayValue(1, 'minTolerance')).toEqual('1.00%')
    })

    it('default commodity', () => {
      expect(displayValue(undefined, 'commodity')).toEqual('BFOET')
    })

    it('a date', () => {
      expect(displayValue(new Date('2019-02-15'), 'a date')).toEqual('2019/02/15')
    })

    it('a parcel', () => {
      expect(displayValue(fakeParcel(), 'parcel')).toMatchSnapshot()
    })

    it('a price', () => {
      expect(displayValue(3800, 'price')).toEqual('3,800.00')
    })

    it('a quantity', () => {
      expect(displayValue(2000, 'quantity')).toEqual('2,000')
    })

    it('a sellerEtrmId', () => {
      expect(displayValue('trade-90', 'sellerEtrmId')).toEqual('trade-90')
    })

    it('a null value', () => {
      expect(displayValue(null, 'whatever')).toEqual('-')
    })

    it('a undefined value', () => {
      expect(displayValue(undefined, 'whatever')).toEqual('-')
    })
  })
})
