import moment from 'moment'
import { Counterparty } from '../../counterparties/store/types'
import { RenewalDateFilterKey } from '..'

const betweenDaysIncluding = (date: string | Date, dateStartOfset: number, dateEndOfset: number) =>
  date && moment(date).isBetween(moment().add(dateStartOfset, 'days'), moment().add(dateEndOfset, 'days'), 'day', '[]')

export interface IFilterOptions {
  title: string
  key: RenewalDateFilterKey
  sort: {
    column: string
    order: 'ascending' | 'descending'
  }
  filter: (date: string | Date) => boolean
}

export const renewalDateFilterOptions: IFilterOptions[] = [
  {
    title: 'All',
    key: 'all',
    sort: {
      column: 'O',
      order: 'ascending'
    },
    filter: (date: string | Date) => true
  },
  {
    title: 'KYC renewal due ≤ 30 days',
    key: 'due30',
    sort: {
      column: 'renewal',
      order: 'ascending'
    },
    // within period of today's date and 30 days (Including day 30 and including today’s date)
    filter: (date: string | Date) => betweenDaysIncluding(date, 0, 30)
  },
  {
    title: 'Due ≤ 60 days',
    key: 'due60',
    sort: {
      column: 'renewal',
      order: 'ascending'
    },
    // between 31 days and ≤60 days from today's date (Including day 60)
    filter: (date: string | Date) => betweenDaysIncluding(date, 31, 60)
  },
  {
    title: 'Due ≤ 90 days',
    key: 'due90',
    sort: {
      column: 'renewal',
      order: 'ascending'
    },
    // between 61 days and ≤90 days from today's date (Including day 90)
    filter: (date: string | Date) => betweenDaysIncluding(date, 61, 90)
  },
  {
    title: 'Overdue ≤ 30 days',
    key: 'overdueLt30',
    sort: {
      column: 'renewal',
      order: 'descending'
    },
    // overdue ≤ 30 days (Excluding today's date until day -30)
    filter: (date: string | Date) =>
      date && moment(date).isBetween(moment().subtract(30, 'days'), moment(), 'day', '[)')
  },
  {
    title: 'Overdue > 30 days',
    key: 'overdueGt30',
    sort: {
      column: 'renewal',
      order: 'descending'
    },
    //  overdue > 30 days (from day -31 upwards)
    filter: (date: string | Date) => date && moment(date).isBefore(moment().subtract(30, 'days'), 'day')
  },
  {
    title: 'No renewal date',
    key: 'noDate',
    sort: {
      column: 'O',
      order: 'ascending'
    },
    filter: (date: string | Date) => !date
  }
]

export const getGroupCounts = (counterparties: Counterparty[]): Array<{ key: RenewalDateFilterKey; value: number }> => {
  return renewalDateFilterOptions.reduce((memo, filter) => {
    const item = {
      key: filter.key,
      value: counterparties.filter(company => filter.filter(company.profile ? company.profile.renewalDate : null))
        .length
    }

    memo.push(item)

    return memo
  }, [])
}

export const filterByRenewalDate = (counterparties: Counterparty[], filterKey: string): Counterparty[] => {
  if (!counterparties) {
    return counterparties
  }

  const filter = renewalDateFilterOptions.find(f => f.key === filterKey)

  if (!filter) {
    return counterparties
  }

  return counterparties.filter(company => filter.filter(company.profile ? company.profile.renewalDate : null))
}

export const getRenewalDateFilterData = (filterKey: string): IFilterOptions => {
  return renewalDateFilterOptions.find(f => f.key === filterKey)
}
