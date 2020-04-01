import * as React from 'react'
import { ExtraOptionsMenuFactory, ExtraOptionsMenuAllProps } from './ExtraOptionsMenu'
import { fakeLetterOfCredit, fakeTrade } from '../../letter-of-credit-legacy/utils/faker'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import * as renderer from 'react-test-renderer'
import { TradingRole, TRADE_STATUS } from '../constants'
import { ShallowWrapper } from 'enzyme'
import { RDStatus, TradeSource, CreditRequirements } from '@komgo/types'
import { createMemoryHistory } from 'history'
import { Dropdown } from 'semantic-ui-react'
import { ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'

const company = 'myCompany'
const testProps: ExtraOptionsMenuAllProps = {
  isFetching: false,
  isLicenseEnabledForCompany: () => true,
  letterOfCredit: fakeLetterOfCredit(),
  trade: {
    ...fakeTrade(),
    sourceId: '1',
    _id: 'abc',
    source: TradeSource.Vakt,
    buyer: company
  },
  tradeId: 'abc',
  sourceId: '1',
  role: TradingRole.BUYER,
  isAuthorized: () => true,
  isLicenseEnabled: () => true,
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  match: {
    isExact: true,
    path: '',
    url: '',
    params: null
  },
  staticContext: undefined
}

describe('ExtraOptionsMenu', () => {
  describe('as buyer or seller', () => {
    it('shows view Trade', () => {
      const tree = renderer
        .create(
          <Router>
            <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...testProps, letterOfCredit: undefined })}</Dropdown.Menu>
          </Router>
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('as buyer', () => {
    describe('ApplyLC', () => {
      it('shows', () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...testProps, letterOfCredit: undefined })}</Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })

      it('is disabled', () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...testProps })}</Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('Reapply for LC', () => {
      it(`shows if status is ${ILetterOfCreditStatus.REQUEST_REJECTED}`, () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>
                {ExtraOptionsMenuFactory({
                  ...testProps,
                  letterOfCredit: { ...fakeLetterOfCredit(), status: ILetterOfCreditStatus.REQUEST_REJECTED }
                })}
              </Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })

      it(`shows if status is ${ILetterOfCreditStatus.ISSUED_LC_REJECTED}`, () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>
                {ExtraOptionsMenuFactory({
                  ...testProps,
                  letterOfCredit: { ...fakeLetterOfCredit(), status: ILetterOfCreditStatus.ISSUED_LC_REJECTED }
                })}
              </Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })

      it('is disabled', () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...testProps, letterOfCredit: undefined })}</Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('View LC Details', () => {
      it('shows', () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...testProps })}</Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })

      it('is disabled', () => {
        const tree = renderer
          .create(
            <Router>
              <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...testProps, letterOfCredit: undefined })}</Dropdown.Menu>
            </Router>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })

  describe('as seller', () => {
    describe('Apply for Discounting Dashboard options', () => {
      it('shows view and edit trade, and apply for discounting buttons', () => {
        const push = jest.fn()
        const wrapper = new ShallowWrapper(
          (
            <Dropdown.Menu>
              {ExtraOptionsMenuFactory({
                ...testProps,
                role: TradingRole.SELLER,
                history: { ...testProps.history, push }
              })}
            </Dropdown.Menu>
          )
        )

        const apply = wrapper.find("[data-test-id='applyforDiscounting']")
        const view = wrapper.find("[data-test-id='details']")
        const edit = wrapper.find("[data-test-id='editTrade']")

        expect(apply.exists()).toBeTruthy()
        expect(view.exists()).toBeTruthy()
        expect(edit.exists()).toBeTruthy()
        expect(edit.props().disabled).toBeTruthy()
        expect(wrapper.find(Dropdown.Item).length).toBe(3)

        apply.simulate('click')
        expect(push).toHaveBeenCalledWith('/receivable-discounting/abc/apply')
      })

      it('should allow edit for seller if status is TO_BE_DISCOUNTED', () => {
        const push = jest.fn()

        const props: ExtraOptionsMenuAllProps = {
          ...testProps,
          trade: {
            ...testProps.trade,
            source: TradeSource.Komgo,
            creditRequirement: CreditRequirements.OpenCredit,
            status: TRADE_STATUS.ToBeDiscounted
          },
          history: {
            ...testProps.history,
            push
          }
        }

        const wrapper = new ShallowWrapper(
          <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...props, role: TradingRole.SELLER })}</Dropdown.Menu>
        )

        const apply = wrapper.find({ name: 'editTrade' })
        expect(apply.props().disabled).toBeFalsy()
        apply.simulate('click')

        expect(push).toHaveBeenCalledWith(`/trades/${props.trade._id}/edit`)
      })

      it('should not allow edit for seller if status is not TO_BE_DISCOUNTED', () => {
        const props = {
          ...testProps,
          trade: {
            ...testProps.trade,
            source: TradeSource.Komgo,
            creditRequirement: CreditRequirements.OpenCredit,
            tradingRole: TradingRole.SELLER,
            status: 'REQUESTED'
          }
        }

        const wrapper = new ShallowWrapper(
          <Dropdown.Menu>{ExtraOptionsMenuFactory({ ...props, role: TradingRole.SELLER })}</Dropdown.Menu>
        )

        const apply = wrapper.find({ name: 'editTrade' })
        expect(apply.props().disabled).toBeTruthy()
      })
    })
  })
})
