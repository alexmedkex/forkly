import reducer, { initialState, sortByRiskLevel, sortByRenewalDate } from './reducer'
import {
  CounterpartiesActionType,
  Counterparty,
  NotConnectedCounterparty,
  CouneterpartyStatus,
  RiskLevel
} from './types'
import { fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'
import { fakeProfile } from '../../document-management/components/counterparty-profile/utils/faker'

describe('counterparty reducer', () => {
  const counterparty1: Counterparty = {
    isFinancialInstitution: false,
    staticId: '123',
    isMember: false,
    x500Name: undefined,
    covered: false,
    profile: {
      id: '123',
      counterpartyId: '123',
      riskLevel: RiskLevel.unspecified,
      renewalDate: '10/10/2018',
      managedById: 'ABC'
    }
  }
  const counterparty2: Counterparty = {
    isFinancialInstitution: false,
    staticId: '123',
    isMember: false,
    x500Name: undefined,
    covered: false,
    profile: {
      id: '123',
      counterpartyId: '123',
      riskLevel: RiskLevel.low,
      renewalDate: '10/09/2018',
      managedById: 'ABC'
    }
  }
  const counterparty3: Counterparty = {
    isFinancialInstitution: false,
    staticId: '123',
    isMember: false,
    x500Name: undefined,
    covered: false,
    profile: {
      id: '123',
      counterpartyId: '123',
      riskLevel: RiskLevel.medium,
      renewalDate: '10/11/2018',
      managedById: 'ABC'
    }
  }
  const counterparty4: Counterparty = {
    isFinancialInstitution: false,
    staticId: '123',
    isMember: false,
    x500Name: undefined,
    covered: false,
    profile: {
      id: '123',
      counterpartyId: '123',
      riskLevel: RiskLevel.high,
      renewalDate: null,
      managedById: 'ABC'
    }
  }

  it('should return default initialState when irrelevat action is called', () => {
    const expected = initialState
    const unonInvalidAction = { type: 'FOO', payload: ['bar'] }
    const actual = reducer(initialState, unonInvalidAction)
    expect(actual).toEqual(expected)
  })

  it('should set connected counterparties', () => {
    const payload: Counterparty[] = [fakeCounterparty({ staticId: '1', commonName: 'A Company' })]

    const action = {
      type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS,
      payload
    }

    const actual = reducer(initialState, action)
    const expected = initialState.set('counterparties', payload).get('counterparties')

    expect(actual.get('counterparties')).toEqual(expected)
  })

  it('should set not connected counterparties', () => {
    const payload: NotConnectedCounterparty[] = [
      fakeCounterparty({ staticId: '1', commonName: 'A Company' }) as NotConnectedCounterparty
    ]

    const action = {
      type: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS,
      payload
    }

    const actual = reducer(initialState, action).get('notConnectedCounterparties')
    const expected = initialState.set('notConnectedCounterparties', payload).get('notConnectedCounterparties')

    expect(actual).toEqual(expected)
  })

  it('should change modal state', () => {
    const action = {
      type: CounterpartiesActionType.SET_COUNTERPARTY_MODAL,
      payload: { name: 'isAddModalOpen', value: true }
    }

    const actual = reducer(initialState, action).get('isAddModalOpen')
    const expected = initialState.set('isAddModalOpen', true).get('isAddModalOpen')

    expect(actual).toEqual(expected)
  })

  it('should change state to pending when add is successful', () => {
    const one: NotConnectedCounterparty[] = [
      fakeCounterparty({ staticId: '1', commonName: 'A Company' }) as NotConnectedCounterparty
    ]

    const newIntialState = initialState.set('notConnectedCounterparties', one)
    const action = {
      type: CounterpartiesActionType.ADD_COUNTERPARTY_SUCCESS,
      payload: ['1']
    }
    const actual = reducer(newIntialState, action).get('notConnectedCounterparties')
    one[0].status = CouneterpartyStatus.PENDING

    expect(actual).toEqual(one)
  })

  it('should set search counterparty', () => {
    const action = {
      type: CounterpartiesActionType.SEARCH_COUNTERPARTY,
      payload: {
        search: 'test',
        typeCounterparty: 'counterpartiesSearch'
      }
    }

    const actual = reducer(initialState, action).get('counterpartiesSearch')

    expect(actual).toEqual('test')
  })

  it('should set a counterparty profile in response to FETCH_COUNTERPARTY_PROFILE_SUCCESS', () => {
    const anonProfile = fakeProfile()

    const action = {
      type: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_SUCCESS,
      payload: anonProfile
    }

    const actual = reducer(initialState, action)
      .get('counterpartyProfiles')
      .get(anonProfile.counterpartyId)

    expect(actual).toEqual(anonProfile)
  })

  it('should set a counterparty profile in response to CREATE_COUNTERPARTY_PROFILE_SUCCESS', () => {
    const anonProfile = fakeProfile()

    const action = {
      type: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_SUCCESS,
      payload: anonProfile
    }

    const actual = reducer(initialState, action)
      .get('counterpartyProfiles')
      .get(anonProfile.counterpartyId)

    expect(actual).toEqual(anonProfile)
  })

  it('should set a counterparty profile in response to UPDATE_COUNTERPARTY_PROFILE_SUCCESS', () => {
    const anonProfile = fakeProfile()

    const action = {
      type: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_SUCCESS,
      payload: anonProfile
    }

    const actual = reducer(initialState, action)
      .get('counterpartyProfiles')
      .get(anonProfile.counterpartyId)

    expect(actual).toEqual(anonProfile)
  })

  it('should sort by risk level ASC correctly', () => {
    const arrayCounters = [counterparty1, counterparty2, counterparty1, counterparty4, counterparty1, counterparty3]
    const expectedSorted = [counterparty4, counterparty3, counterparty2, counterparty1, counterparty1, counterparty1]

    const sortedCounters = sortByRiskLevel(arrayCounters, 'ascending')
    expect(sortedCounters).toEqual(expectedSorted)
  })

  it('should sort by risk level DESC correctly', () => {
    const arrayCounters = [counterparty2, counterparty1, counterparty1, counterparty4, counterparty3, counterparty1]
    const expectedSorted = [counterparty1, counterparty1, counterparty1, counterparty2, counterparty3, counterparty4]

    const sortedCounters = sortByRiskLevel(arrayCounters, 'descending')
    expect(sortedCounters).toEqual(expectedSorted)
  })

  it('should sort by renewal date level ASC correctly', () => {
    const arrayCounters = [counterparty1, counterparty4, counterparty2, counterparty4, counterparty3, counterparty4]
    const expectedSorted = [counterparty2, counterparty1, counterparty3, counterparty4, counterparty4, counterparty4]

    const sortedCounters = sortByRenewalDate(arrayCounters, 'ascending')
    expect(sortedCounters).toEqual(expectedSorted)
  })

  it('should sort by renewal date level DESC correctly', () => {
    const arrayCounters = [counterparty1, counterparty4, counterparty2, counterparty4, counterparty3, counterparty4]
    const expectedSorted = [counterparty4, counterparty4, counterparty4, counterparty3, counterparty1, counterparty2]

    const sortedCounters = sortByRenewalDate(arrayCounters, 'descending')
    expect(sortedCounters).toEqual(expectedSorted)
  })
})
