import { buildFakeCargo, buildFakeStandByLetterOfCreditBase, buildFakeTrade, TradeSource } from '@komgo/types'
import { mount, shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import * as React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter as Router } from 'react-router-dom'
import * as renderer from 'react-test-renderer'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { FullHeader } from '../../../components/full-header'
import { FullpageModal } from '../../../components/fullpage-modal/FullPageModal'
import { ServerError } from '../../../store/common/types'
import { ApplicationState } from '../../../store/reducers'
import { fakeMember, mockDate } from '../../letter-of-credit-legacy/utils/faker'
import { Confirm } from '../components/confirm-modal'
import Container, { CreateStandbyLetterOfCredit, IProps } from './CreateStandByLetterOfCredit'

jest.mock('../components/agreement-view/index.tsx', () => ({ AgreementView: 'AgreementView' }))
// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

const sourceId = 'abc123'
const source = TradeSource.Komgo

export const mountWithProvider = children => store => mount(<Provider store={store}>{children}</Provider>)
const shallowWithStore = (component, store) => {
  const context = {
    store
  }
  return shallow(component, { context })
}

describe('CreateStandbyLetterOfCredit', () => {
  let props: IProps
  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')
    const trade = buildFakeTrade({ sourceId, source })
    props = {
      staticContext: null,
      history: createMemoryHistory(),
      location: {
        pathname: '',
        search: `?source=${source}&sourceId=${sourceId}`,
        state: '',
        hash: ''
      },
      match: {
        isExact: true,
        path: '',
        url: '',
        params: null
      },
      isAuthorized: () => true,
      isLicenseEnabled: () => true,
      isLicenseEnabledForCompany: () => true,
      errors: [],
      isFetching: false,
      applicant: fakeMember(),
      beneficiary: fakeMember({ staticId: trade.seller }),
      initialValues: buildFakeStandByLetterOfCreditBase(),
      clearError: jest.fn(),
      submitStandbyLetterOfCredit: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      fetchTradesWithCargos: jest.fn(),
      trade,
      cargo: buildFakeCargo({ sourceId, source }),
      tradeId: { source, sourceId },
      applicantId: 'abc123',
      issuingBanks: [],
      beneficiaryBanks: [],
      isSubmitting: false,
      submitErrors: []
    }
  })
  afterAll(() => {
    mockDate().restore()
  })
  describe('render', () => {
    it('shows the default UI', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('shows authorized', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} isAuthorized={() => false} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('shows an error', () => {
      const error: ServerError = {
        message: 'Error',
        errorCode: 'E001',
        requestId: '5d9a7aaf-f55a-431c-9d26-8204d9ecdbe9',
        origin: 'trade-finance',
        fields: {}
      }
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} errors={[error]} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('shows an error if no cargo', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} cargo={buildFakeCargo({ grade: '' as any })} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('shows trade not found', () => {
      props.trade = {} as any
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('shows loading transitions', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} isFetching={true} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('disable confirm button', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateStandbyLetterOfCredit {...props} isSubmitting={true} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })
  })

  describe('componentDidMount', () => {
    it('fetches data', () => {
      shallow(<CreateStandbyLetterOfCredit {...props} />)

      expect(props.fetchConnectedCounterpartiesAsync).toHaveBeenCalled()
      expect(props.fetchTradesWithCargos).toHaveBeenCalledWith({
        filter: { options: {}, projection: undefined, query: { source: TradeSource.Komgo, sourceId: 'abc123' } },
        source: TradeSource.Komgo
      })
    })
  })

  describe('submit-application-button', () => {
    it('is disabled when an invalid SBLC is in state', () => {
      const wrapper = mount(
        <Router>
          <CreateStandbyLetterOfCredit {...props} />
        </Router>
      )

      expect(wrapper.find('Button[data-test-id="submit-application-button"]').prop('disabled')).toEqual(true)
    })
    // RR TODO FIND OUT WHY THIS IS BROKEN
    it.skip('is enabled when a valid SBLC is in state', done => {
      const wrapper = mount(
        <Router>
          <CreateStandbyLetterOfCredit {...props} />
        </Router>
      )

      wrapper.find(CreateStandbyLetterOfCredit).setState({ letter: buildFakeStandByLetterOfCreditBase() })
      setTimeout(() => {
        expect(wrapper.find('Button[data-test-id="submit-application-button"]').prop('disabled')).toEqual(false)

        done()
      })
    })
  })

  describe('openConfirmModal', () => {
    it('opens when click submit application', () => {
      const component = shallow<CreateStandbyLetterOfCredit>(<CreateStandbyLetterOfCredit {...props} />)

      const [button] = component
        .find(FullpageModal)
        .dive()
        .find(FullHeader)
        .dive()
        .find('Button[data-test-id="submit-application-button"]') as any
      button.props.onClick()

      const modal = component.find(Confirm)
      expect(modal.props().open).toEqual(true)
    })

    it('closes when click cancel', () => {
      const Component = shallow<CreateStandbyLetterOfCredit>(<CreateStandbyLetterOfCredit {...props} />)

      const [button] = Component.find(FullpageModal)
        .dive()
        .find(FullHeader)
        .dive()
        .find('Button[data-test-id="submit-application-button"]') as any
      button.props.onClick()

      const component = Component.instance() as any
      component.openConfirmModal(false)

      const modal = Component.find(FullpageModal)
        .dive()
        .find(Confirm)

      expect(modal.props().open).toEqual(false)
    })
  })

  describe('submit', () => {
    it('calls the endpoint', done => {
      const wrapper = mount(
        <Router>
          <CreateStandbyLetterOfCredit {...props} />
        </Router>
      )
      wrapper.find('form').simulate('submit')

      setTimeout(() => {
        expect(props.submitStandbyLetterOfCredit).toHaveBeenCalledWith(props.initialValues)
        done()
      })
    })
  })

  describe('container', () => {
    let store
    beforeEach(() => {
      const mockStore = configureMockStore([thunk])
      const initialState: ApplicationState = fromJS({
        uiState: {
          profile: {
            company: '1234'
          }
        },
        errors: {
          byAction: {}
        },
        loader: {
          requests: {}
        },
        counterparties: {
          counterparties: []
        },
        members: {
          byId: {}
        },
        trades: {
          trades: {},
          tradeMovements: {}
        }
      })
      // WORKAROUND fix wrong types it should be a Immutable collection
      initialState.get('uiState').set('permissions', [
        {
          product: {
            id: 'tradeFinance',
            label: 'tradeFinance'
          },
          action: {
            id: 'manageSBLCRequest',
            label: 'manageSBLCRequest'
          },
          permission: null
        }
      ] as any)
      store = mockStore(initialState)
    })

    // TODO LS I can't mount a nested container :/
    // I keep all the attempts to see if I can find a better solution later
    it.skip('mounts the container', () => {
      // const root = document.createElement('div')
      // document.body.appendChild(root)

      const wrapper = shallowWithStore(<Container />, store)
        .instance()
        .componentDidMount()
      // const output = wrapper.debug()
      // const wrapper = mount(
      //   <Router>
      //     <Provider store={store}>
      //       <Container />
      //     </Provider>
      //   </Router>,
      //   { context: store, attachTo: root }
      // )
      /*const wrapper = mountWithProvider(
        mountWithProvider(
          <Router>
            <Container />
          </Router>
        )(store).children[0]
      )(store)*/
      /*const wrapper = shallowWithStore(
        <Router>
          <Container />
        </Router>,
        store
      )
        .dive({ context: { store } })
        .dive({ context: { store } })
        .dive({ context: { store } })
        .dive({ context: { store } })
        .instance()
        .componentDidMount()*/
      // const wrapper = shallow(<Container store={store}/>).dive().dive()
      //   .instance()
      //   .componentDidMount()

      // expect(wrapper.props()).toEqual({})
      /*const wrapper = shallowWithStore(<Container/>, store)
      wrapper
        .dive()
        .dive()
        .instance()*/
      /*const wrapper = shallow(
        <Container />,
        { context: { store } }
      ).dive().dive().dive().dive();*/
      expect(store.getActions()).toEqual({})
    })
  })
})
