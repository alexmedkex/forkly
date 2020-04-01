import { sortPerBoolean, sortPerDate, sortPerString, sortPerNumber } from './sorting'
import { Order } from '../../store/common/types'

describe('Sorting functions', () => {
  let data
  const first = {
    buyerName: 'ATest',
    amount: 1000,
    lastUpdated: '2019-04-01T13:07:00.420Z',
    appetite: true
  }
  const second = {
    buyerName: 'BTest',
    amount: 1000000,
    lastUpdated: '2019-04-06T13:07:00.420Z',
    appetite: true
  }
  const third = {
    buyerName: 'CTest',
    amount: 20000,
    lastUpdated: '2019-04-21T13:07:00.420Z',
    appetite: false
  }

  beforeEach(() => {
    data = [first, second, third]
  })

  describe('sortPerBoolean()', () => {
    const emptyBoolean = {
      buyerName: 'DTest',
      amount: 500,
      lastUpdated: '2019-04-21T13:07:00.420Z'
    }
    it('should sort desc', () => {
      expect(sortPerBoolean('appetite', Order.Desc, data)).toEqual([first, second, third])
    })
    it('should sort asc', () => {
      expect(sortPerBoolean('appetite', Order.Asc, data)).toEqual([third, first, second])
    })
  })

  describe('sortPerDate()', () => {
    it('should sort desc', () => {
      expect(sortPerDate('lastUpdated', Order.Desc, data)).toEqual([third, second, first])
    })
    it('should sort asc', () => {
      expect(sortPerDate('lastUpdated', Order.Asc, data)).toEqual([first, second, third])
    })
  })

  describe('sortPerString()', () => {
    const emptyString = {
      amount: 500,
      lastUpdated: '2019-04-21T13:07:00.420Z'
    }
    it('should sort desc', () => {
      expect(sortPerString('buyerName', Order.Desc, data)).toEqual([third, second, first])
    })
    it('should sort asc', () => {
      expect(sortPerString('buyerName', Order.Asc, data)).toEqual([first, second, third])
    })
    it('should sort desc when one item is empty', () => {
      expect(sortPerString('buyerName', Order.Desc, [...data, emptyString])).toEqual([
        third,
        second,
        first,
        emptyString
      ])
    })
    it('should sort asc when one item is empty', () => {
      expect(sortPerString('buyerName', Order.Asc, [...data, emptyString])).toEqual([emptyString, first, second, third])
    })
  })

  describe('sortPerNumber', () => {
    const emptyNumber = {
      buyerName: 'CTest',
      lastUpdated: '2019-04-21T13:07:00.420Z'
    }
    it('should sort desc', () => {
      expect(sortPerNumber('amount', Order.Desc, data)).toEqual([second, third, first])
    })
    it('should sort asc', () => {
      expect(sortPerNumber('amount', Order.Asc, data)).toEqual([first, third, second])
    })
    it('should sort desc when one item is empty', () => {
      expect(sortPerNumber('amount', Order.Desc, [...data, emptyNumber])).toEqual([second, third, first, emptyNumber])
    })
    it('should sort asc when one item is empty', () => {
      expect(sortPerNumber('amount', Order.Asc, [...data, emptyNumber])).toEqual([emptyNumber, first, third, second])
    })
  })
})
