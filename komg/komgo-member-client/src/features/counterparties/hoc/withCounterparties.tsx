import { connect } from 'react-redux'
import {
  setAddCounterpartyModal,
  fetchConnectedCounterpartiesAsync,
  getConnectedCounterpartiesWithRequestsAsync,
  fetchNotConnectedCompaniesAsync,
  searchCounterparty,
  sortConnectedCounterparties,
  addCounterpartyAsync,
  setAddCounterparties,
  fetchCounterpartyProfileAsync,
  createCounterpartyProfileAsync,
  updateCounterpartyProfileAsync
} from '../store/actions'
import { notConnecedCounterpartyFileter, connectedCounterpartyFilter } from '../store/reducer'
import { ApplicationState } from '../../../store/reducers'
import { loadingSelector } from '../../../store/common/selectors'
import { CounterpartiesActionType, Counterparty } from '../store/types'
import { findErrors } from '../../../store/common/selectors/errorSelector'

export interface WithCounterpartiesProps {
  counterparties: Counterparty[]
  fetchConnectedCounterpartiesAsync: (params?: {}) => void
  notConnectedCounterparties: Counterparty[]
  fetchNotConnectedCompaniesAsync: () => void
}

const mapStateToProps = (state: ApplicationState) => {
  const counterparties = state.get('counterparties')
  const errorState = state.get('errors').get('byAction')
  const loadingState = state.get('loader').get('requests')
  const fetchingConnectedCounterpartiesErrors = findErrors(errorState, [
    CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
  ])
  const fetchingNotConnectedCounterpartiesErrors = findErrors(errorState, [
    CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST
  ])
  return {
    counterparties: counterparties.get('counterparties'),
    counterpartiesFiltered: connectedCounterpartyFilter(counterparties),
    isAddModalOpen: counterparties.get('isAddModalOpen'),
    notConnectedCounterparties: counterparties.get('notConnectedCounterparties'),
    notConnectedCounterpartiesFiltred: notConnecedCounterpartyFileter(counterparties),
    addCounterparties: counterparties.get('addCounterparties'),
    counterpartiesSort: counterparties.get('counterpartiesSort'),
    counterpartiesSearch: counterparties.get('counterpartiesSearch'),
    notConnectedCounterpartySearch: counterparties.get('notConnectedCounterpartySearch'),
    requestResponseActionStatus: counterparties.get('requestResponseActionStatus'),
    fetchingConnectedCounterparties: loadingSelector(loadingState, [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
    ]),
    fetchingConnectedCounterpartiesError:
      fetchingConnectedCounterpartiesErrors.length > 0 ? fetchingConnectedCounterpartiesErrors[0].message : null,
    fetchingNotConnectedCounterparties: loadingSelector(loadingState, [
      CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST
    ]),
    fetchingNotConnectedCounterpartiesError:
      fetchingNotConnectedCounterpartiesErrors.length > 0 ? fetchingNotConnectedCounterpartiesErrors[0].message : null,
    counterpartyProfiles: counterparties.get('counterpartyProfiles')
  }
}

const withCounterparties = (wrapped: React.ComponentType) =>
  connect(mapStateToProps, {
    setAddCounterpartyModal,
    fetchConnectedCounterpartiesAsync,
    getConnectedCounterpartiesWithRequestsAsync,
    fetchNotConnectedCompaniesAsync,
    searchCounterparty,
    sortConnectedCounterparties,
    addCounterpartyAsync,
    setAddCounterparties,
    fetchCounterpartyProfileAsync,
    createCounterpartyProfileAsync,
    updateCounterpartyProfileAsync
  })(wrapped)

export default withCounterparties
