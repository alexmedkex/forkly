import * as immutable from 'immutable'
import { Reducer, AnyAction } from 'redux'
import moment from 'moment'
import {
  CouneterpartyStatus,
  SortConnectedCounterparties,
  AddCounterpartySuccess,
  CouneterpartyStatusText,
  CounterpartiesAction,
  RiskLevel,
  FetchCounterpartyProfileFailure
} from './types'

import {
  CounterpartiesState,
  CounterpartiesStateFields,
  CounterpartiesActionType,
  NotConnectedCounterparty,
  Counterparty,
  CounterpartyProfile
} from './types'

export const intialStateFields: CounterpartiesStateFields = {
  counterpartiesSearch: '',
  counterparties: [],
  counterpartiesSort: { column: '', order: '' },
  notConnectedCounterpartySearch: '',
  notConnectedCounterparties: [],
  addCounterparties: [],
  isAddModalOpen: false,
  requestResponseActionStatus: false,
  counterpartyRequest: null,
  counterpartyProfiles: new Map<string, CounterpartyProfile>()
}

export const initialState: CounterpartiesState = immutable.Map(intialStateFields)

const reducer: Reducer<CounterpartiesState> = (
  state = initialState,
  action: CounterpartiesAction
): CounterpartiesState => {
  const result = reducerRequests(state, action)

  if (result) {
    return result
  }

  switch (action.type) {
    case CounterpartiesActionType.SET_COUNTERPARTY_MODAL:
      return state.set(action.payload.name, action.payload.value)

    case CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS:
      return state.set('notConnectedCounterparties', action.payload)

    case CounterpartiesActionType.SEARCH_COUNTERPARTY:
      return state.set(action.payload.typeCounterparty, action.payload.search)

    case CounterpartiesActionType.SET_ADD_COUNTERPARTIES:
      return state.set('addCounterparties', action.payload)

    case CounterpartiesActionType.SORT_CONNECTED_COUNTERPARTIES: {
      return sortCounterparties(action as SortConnectedCounterparties, state)
    }

    case CounterpartiesActionType.ADD_COUNTERPARTY_SUCCESS: {
      return setAddedCounterparty(action as AddCounterpartySuccess, state)
    }

    default:
      return state
  }
}

// just put this into separate function to decease complexity, maybe to put into separate reducer
const reducerRequests = (state = initialState, action: CounterpartiesAction): CounterpartiesState | null => {
  switch (action.type) {
    case CounterpartiesActionType.FETCH_COUNTERPARTY_REQ_SUCCESS:
      return state.set('counterpartyRequest', action.payload)

    case CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS:
      return state
        .set('counterparties', sort(action.payload, 'O', 'ascending'))
        .set('counterpartiesSort', { column: 'O', order: 'ascending' })

    case CounterpartiesActionType.SET_REQUEST_ACTION:
      return state.set('requestResponseActionStatus', action.payload.status)

    case CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_SUCCESS: {
      // This code attaches the profile to its counterparty in the counterparties array in the state
      const payload = action.payload
      return setProfile(state, payload.counterpartyId, payload)
    }
    case CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_FAILURE:
      return processCounterpartyFetchError(state, action)
    case CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_SUCCESS:
    case CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_SUCCESS: {
      return state.set(
        'counterpartyProfiles',
        state.get('counterpartyProfiles').set(action.payload.counterpartyId, action.payload as CounterpartyProfile)
      )
    }

    default:
      return null
  }
}

export const sortByRenewalDate = (counterparties: Counterparty[], order: string): Counterparty[] => {
  const counterpartiesSorted: Counterparty[] = [...counterparties]
  return counterpartiesSorted.sort((first, second) => {
    if (first.profile && second.profile) {
      if (!!first.profile.renewalDate !== !!second.profile.renewalDate) {
        return !!first.profile.renewalDate ? (order === 'ascending' ? -1 : 1) : order === 'ascending' ? 1 : -1
      }
      const isBefore = moment(second.profile.renewalDate).isBefore(first.profile.renewalDate)
      return (order === 'ascending' ? 1 : -1) * (isBefore ? 1 : -1)
    }
    return 0
  })
}

export const sortByRiskLevel = (counterparties: Counterparty[], order: string): Counterparty[] => {
  const counterpartiesSorted: Counterparty[] = [...counterparties]
  const orderRiskAsc = [RiskLevel.unspecified, RiskLevel.low, RiskLevel.medium, RiskLevel.high]
  return counterpartiesSorted.sort((first, second) => {
    if (first.profile && second.profile) {
      const isBefore = orderRiskAsc.indexOf(first.profile.riskLevel) < orderRiskAsc.indexOf(second.profile.riskLevel)
      return isBefore ? (order === 'descending' ? -1 : 1) : order === 'descending' ? 1 : -1
    }
    return 0
  })
}

const sort = (counterparties: Counterparty[], columnName: string, order: string): Counterparty[] => {
  let counterpartiesSorted: Counterparty[] = [...counterparties]
  if (columnName === 'status') {
    counterpartiesSorted.sort((first, second) => {
      if (first.status && second.status) {
        const i = CouneterpartyStatusText[first.status].localeCompare(CouneterpartyStatusText[second.status])
        return order === 'ascending' ? i : -i
      }
      return 0
    })
  } else if (columnName === 'timestamp') {
    counterpartiesSorted.sort((first, second) => {
      if (first.timestamp && second.timestamp) {
        const isBefore = moment(second.timestamp).isBefore(first.timestamp)
        return order === 'ascending' && isBefore ? 1 : -1
      }
      return 0
    })
  } else if (columnName === 'risk') {
    counterpartiesSorted = sortByRiskLevel(counterpartiesSorted, order)
  } else if (columnName === 'renewal') {
    counterpartiesSorted = sortByRenewalDate(counterpartiesSorted, order)
  } else {
    counterpartiesSorted.sort((first, second) => {
      const i = (first.x500Name as any)[columnName].localeCompare((second.x500Name as any)[columnName])
      return order === 'ascending' ? i : -i
    })
  }

  return counterpartiesSorted
}

const sortCounterparties = (action: SortConnectedCounterparties, state: CounterpartiesState) => {
  const counterparties = sort(state.get('counterparties'), action.payload.column, action.payload.order)
  return state.set('counterparties', counterparties).set('counterpartiesSort', action.payload)
}

const setAddedCounterparty = (action: AddCounterpartySuccess, state: CounterpartiesState) => {
  const notConnectedCounterparties = state.get('notConnectedCounterparties')
  const addCounterparties = state.get('addCounterparties')
  const newNotConnectedCounterparties: NotConnectedCounterparty[] = notConnectedCounterparties.map(
    notConnectedCounterparty => {
      if (addCounterparties.indexOf(notConnectedCounterparty.staticId) === -1) {
        return notConnectedCounterparty
      }
      return { ...notConnectedCounterparty, status: CouneterpartyStatus.PENDING }
    }
  )
  return state
    .set('isAddModalOpen', false)
    .set('addCounterparties', [])
    .set('notConnectedCounterparties', newNotConnectedCounterparties)
    .set('notConnectedCounterpartySearch', '')
}

export const notConnecedCounterpartyFileter = (state: CounterpartiesState): NotConnectedCounterparty[] => {
  const counterparties = state.get('notConnectedCounterparties')
  const notConnectedCounterpartySearch = state.get('notConnectedCounterpartySearch')
  return counterparties.filter(
    counterparty => counterparty.x500Name.O.toLowerCase().indexOf(notConnectedCounterpartySearch.toLowerCase()) !== -1
  )
}

export const connectedCounterpartyFilter = (state: CounterpartiesState): Counterparty[] => {
  const counterparties = state.get('counterparties')
  const counterpartiesSearch = state.get('counterpartiesSearch')
  return counterparties
    ? counterparties.filter(
        counterparty => counterparty.x500Name.O.toLowerCase().indexOf(counterpartiesSearch.toLowerCase()) !== -1
      )
    : []
}

const setProfile = (state: CounterpartiesState, counterpartyId: string, profile: CounterpartyProfile) => {
  const newMap = new Map(state.get('counterpartyProfiles'))
  addProfileToCounterparties(state.get('counterparties'), profile || { counterpartyId })
  return state.set('counterpartyProfiles', newMap.set(counterpartyId, profile))
}

const processCounterpartyFetchError = (state: CounterpartiesState, action: FetchCounterpartyProfileFailure) => {
  const payload = action.payload
  // it is expected for counterparty to have profile. Temporary create empty one if 404 is returned
  if (payload.error && payload.error.response && payload.error.response.status === 404) {
    return setProfile(state, payload.counterpartyId, null)
  }
}

const addProfileToCounterparties = (counterparties: Counterparty[], payload: any): Counterparty[] => {
  return counterparties.map(c => {
    if (c.staticId === payload.counterpartyId) {
      c.profile = payload
      if (!payload.riskLevel) {
        c.profile.riskLevel = RiskLevel.unspecified
      }
    }
    return c
  })
}

export default reducer
