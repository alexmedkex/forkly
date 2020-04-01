import { Counterparty } from '../../counterparties/store/types'
import moment from 'moment'
import { getGroupCounts, filterByRenewalDate } from './filters'
import { RenewalDateFilterKey } from '..'

describe('filters', () => {
  let counterparties: Counterparty[] = []
  const daysMap: Array<{ key: RenewalDateFilterKey; value: number }> = [
    {
      key: 'due30',
      value: 20
    },
    {
      key: 'due60',
      value: 40
    },
    {
      key: 'due90',
      value: 80
    },
    {
      key: 'overdueLt30',
      value: -10
    },
    {
      key: 'overdueGt30',
      value: -40
    },
    {
      key: 'noDate',
      value: null
    }
  ]

  beforeEach(() => {
    counterparties = []
    daysMap
      .map(values => ({
        x500Name: {
          CN: `comp-${values.key}`
        },
        profile: {
          renewalDate: values.value
            ? moment()
                .add(values.value, 'days')
                .toISOString()
            : null
        } as any
      }))
      .forEach(c => {
        counterparties.push((c as unknown) as Counterparty)
      })
  })

  describe('getGroupCounts', () => {
    it('should get all counts', () => {
      const result = getGroupCounts(counterparties as Counterparty[])

      expect(result.find(i => i.key === 'all').value).toBe(counterparties.length)
      ;['due30', 'due60', 'due90', 'overdueLt30', 'overdueGt30', 'noDate'].forEach(days => {
        expect(result.find(i => i.key === days)).toMatchObject({ key: days, value: 1 })
      })
    })
  })

  describe('filterByRenewalDate', () => {
    it('should filter by all items', () => {
      expect(filterByRenewalDate(counterparties, 'all').length).toBe(counterparties.length)

      daysMap.forEach(dayItem => {
        const result = filterByRenewalDate(counterparties, dayItem.key)

        expect(result[0].x500Name ? result[0].x500Name.CN : '').toBe(`comp-${dayItem.key}`)
        expect(result.length).toBe(1)
      })
    })
  })
})
