import {
  buildFakeReceivablesDiscountingBase,
  CreditRequirements,
  buildFakeReceivablesDiscountingInfo,
  RequestType,
  DiscountingType
} from '@komgo/types'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import * as React from 'react'
import { ErrorMessage, LoadingTransition, Unauthorized } from '../../../../components'
import { fakeTrade } from '../../../letter-of-credit-legacy/utils/faker'
import { ApplyForDiscountingContainer, IApplyForDiscountingContainerProps } from './ApplyForDiscountingContainer'
import { BrowserRouter as Router } from 'react-router-dom'
import { render, fireEvent, wait, RenderResult } from '@testing-library/react'
import Numeral from 'numeral'
import { ITradeEnriched } from '../../../trades/store/types'
import { fakeFormik } from '../../../receivable-discounting-legacy/utils/faker'
import moment from 'moment-timezone'
import { changeFormikField } from '../../../receivable-discounting-legacy/utils/test-utils'
import { TradingRole } from '../../../trades/constants'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'

describe('ApplyForDiscountingContainer', () => {
  let testProps: IApplyForDiscountingContainerProps

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')

    testProps = {
      tradeId: 'A-TRADE-ID',
      company: 'company',
      tradeMovements: [],
      dispatch: jest.fn(),
      trade: fakeTrade({
        _id: '123',
        creditRequirement: CreditRequirements.OpenCredit,
        sellerEtrmId: '1234',
        tradingRole: TradingRole.SELLER
      }),
      createLoader: false,
      submissionError: '',
      history: { ...createMemoryHistory(), push: jest.fn() },
      location: {
        pathname: '/receivable-discounting/123121/new',
        search: '',
        state: '',
        hash: ''
      },
      match: {
        isExact: false,
        path: '',
        url: '',
        params: {
          id: 1
        }
      },
      staticContext: undefined,
      getTrade: jest.fn(),
      fetchMovements: jest.fn(),
      createToast: jest.fn(),
      createReceivablesDiscountingApplication: jest.fn(),
      updateReceivablesDiscountingApplication: jest.fn(),
      fetchRdsByStaticIds: jest.fn(),
      isAuthorized: jest.fn(() => true),
      isLicenseEnabled: jest.fn(() => true),
      isLicenseEnabledForCompany: jest.fn(() => true),
      isFetching: false,
      errors: [],
      rdInfo: null
    }

    localStorage.clear()
  })

  it('renders correctly with nothing selected', () => {
    expect(
      render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('renders correctly with Risk Cover selected', () => {
    const props = { ...testProps }
    props.rdInfo = buildFakeReceivablesDiscountingInfo()
    props.rdInfo.rd.requestType = RequestType.RiskCover

    expect(
      render(
        <Router>
          <ApplyForDiscountingContainer {...props} />
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('renders correctly with Risk Cover with discounting option selected', () => {
    const props = { ...testProps }
    props.rdInfo = buildFakeReceivablesDiscountingInfo()
    props.rdInfo.rd.requestType = RequestType.RiskCoverDiscounting

    expect(
      render(
        <Router>
          <ApplyForDiscountingContainer {...props} />
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('renders correctly with Discounting with Recourse selected', () => {
    const props = { ...testProps }
    props.rdInfo = buildFakeReceivablesDiscountingInfo()
    props.rdInfo.rd.requestType = RequestType.Discount
    props.rdInfo.rd.discountingType = DiscountingType.Recourse

    expect(
      render(
        <Router>
          <ApplyForDiscountingContainer {...props} />
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('fetches trades and movements', () => {
    render(
      <Router>
        <ApplyForDiscountingContainer {...testProps} />
      </Router>
    )
    expect(testProps.getTrade).toHaveBeenCalledWith(testProps.tradeId)
    expect(testProps.fetchMovements).toHaveBeenCalledWith(testProps.tradeId)
  })

  it('should trip validation errors if fields are not filled in', done => {
    const { getByTestId, asFragment } = render(<ApplyForDiscountingContainer {...testProps} />)
    const beforeSubmit = asFragment()

    const form = getByTestId('apply-for-discounting-form')
    fireEvent.submit(form)

    wait(() => {
      expect(testProps.history.push).not.toHaveBeenCalled()
      expect(testProps.updateReceivablesDiscountingApplication).not.toHaveBeenCalled()
      expect(testProps.createReceivablesDiscountingApplication).not.toHaveBeenCalled()
      expect(beforeSubmit).toMatchDiffSnapshot(asFragment())

      done()
    })
  })

  describe('Select request type', () => {
    it('should not show form while the request type is not selected', async done => {
      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )

      wait(() => {
        expect(dom.queryByTestId('numberOfDaysDiscounting')).toBeNull()
        done()
      })
    })

    it('should show form when the request type is selected', async done => {
      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )
      selectRequestType(dom, RequestType.Discount)

      wait(() => {
        expect(dom.queryByTestId('numberOfDaysDiscounting')).toBeVisible()
        done()
      })
    })
  })
  describe('Save as draft', () => {
    it('should initially be disabled', () => {
      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )
      const { queryAllByTestId } = dom
      selectRequestType(dom, RequestType.Discount)

      const [saveAsDraft] = queryAllByTestId('button-save-as-draft')

      expect(saveAsDraft).toBeDefined()
      expect(saveAsDraft).toBeDisabled()
    })

    it('should initially be disabled if rdInfo is present', () => {
      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )
      const { queryAllByTestId } = dom
      selectRequestType(dom, RequestType.Discount)

      const [saveAsDraft] = queryAllByTestId('button-save-as-draft')

      expect(saveAsDraft).toBeDefined()
      expect(saveAsDraft).toBeDisabled()
    })

    it('should be enabled once a field is changed', async done => {
      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )
      const { getByTestId, queryAllByTestId } = dom
      selectRequestType(dom, RequestType.Discount)

      const invoiceAmount = getByTestId('invoiceAmount').querySelector('input')
      changeFormikField(invoiceAmount, 1000)
      const [saveAsDraft] = queryAllByTestId('button-save-as-draft')

      wait(() => {
        expect(saveAsDraft).not.toBeDisabled()
        done()
      })
    })

    it('should show toast and redirect page when saved as draft', async done => {
      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )
      const { getByTestId, queryAllByTestId } = dom
      selectRequestType(dom, RequestType.Discount)

      const invoiceAmount = getByTestId('invoiceAmount').querySelector('input')
      changeFormikField(invoiceAmount, 1000)
      const [saveAsDraft] = queryAllByTestId('button-save-as-draft')

      fireEvent.click(saveAsDraft)

      wait(() => {
        expect(testProps.createToast).toHaveBeenCalledWith(expect.any(String))
        expect(testProps.history.push).toHaveBeenCalledWith('/receivable-discounting')
        done()
      })
    })

    it('should reload saved draft when page is mounted', async done => {
      const draftInvoiceAmountValue = Math.random() * 10000

      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )
      selectRequestType(dom, RequestType.Discount)

      const invoiceAmount = dom.getByTestId('invoiceAmount').querySelector('input')
      changeFormikField(invoiceAmount, draftInvoiceAmountValue)
      const [saveAsDraft] = dom.queryAllByTestId('button-save-as-draft')

      fireEvent.click(saveAsDraft)
      dom.unmount()

      const { getByTestId } = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} />
        </Router>
      )

      const initialInvoiceAmountValue = getByTestId('invoiceAmount').querySelector('input').value
      const formatted = (n: number) => Numeral(n).format('0,0.00')

      wait(() => {
        expect(initialInvoiceAmountValue).toEqual(formatted(draftInvoiceAmountValue))
        done()
      })
    })
  })

  it('renders Loading trade if isFetching value is set to true', () => {
    const testSpecificTestProps = {
      ...testProps,
      isFetching: true
    }
    const wrapper = shallow(<ApplyForDiscountingContainer {...testSpecificTestProps} isFetching={true} />)
    expect(wrapper.containsMatchingElement(<LoadingTransition title="Loading Trade" />)).toBeTruthy()
  })

  it('renders ErrorMessage component if invalid trade is set', () => {
    const testSpecificTestProps = {
      ...testProps,
      trade: fakeTrade({ _id: '123', creditRequirement: CreditRequirements.DocumentaryLetterOfCredit })
    }
    const wrapper = shallow(<ApplyForDiscountingContainer {...testSpecificTestProps} />)
    expect(
      wrapper.containsMatchingElement(
        <ErrorMessage title="Invalid Trade" error="This trade is not applicable for Receivable Discounting" />
      )
    ).toBeTruthy()
  })

  it('renders Unauthorized component if isAuthorized set to false', () => {
    const testSpecificTestProps = {
      ...testProps,
      isAuthorized: jest.fn(() => false)
    }
    const wrapper = shallow(<ApplyForDiscountingContainer {...testSpecificTestProps} />)
    expect(wrapper.containsMatchingElement(<Unauthorized />)).toBeTruthy()
  })

  it('should open confirm and then close when closed is clicked', () => {
    const wrapper = shallow(<ApplyForDiscountingContainer {...testProps} />)
    const instance = wrapper.instance() as ApplyForDiscountingContainer
    instance.handleSubmit(buildFakeReceivablesDiscountingBase(), fakeFormik)
    instance.handleCancelSubmit()

    expect(instance.state.openConfirm).toBe(false)
  })

  it('should pass title correctly to TemplateLayout', () => {
    const wrapper = shallow(<ApplyForDiscountingContainer {...testProps} />)
    const template = wrapper.find(TemplateLayout)

    expect(template.prop('title')).toEqual('Apply for Risk cover / Discounting')
  })

  it('should render Submit button and function correctly when clicked', () => {
    const wrapper = shallow(<ApplyForDiscountingContainer {...testProps} />)
    const button = wrapper.find({ 'data-test-id': 'button-next' }).shallow()

    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Next')
  })

  it('should render Cancel button', () => {
    const wrapper = shallow(<ApplyForDiscountingContainer {...testProps} />)
    const button = wrapper.find({ 'data-test-id': 'button-cancel' }).shallow()

    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Cancel')
  })

  describe('NEXT button performs', () => {
    it('creates an RD', async done => {
      const dom = render(<ApplyForDiscountingContainer {...testProps} />)
      const { getByTestId } = dom
      selectRequestType(dom, RequestType.Discount)

      const invoiceAmount = getByTestId('invoiceAmount').querySelector('input')
      const discountingDate = getByTestId('discountingDate').querySelector('input')
      const advancedRate = getByTestId('advancedRate').querySelector('input')
      const dateOfPerformance = getByTestId('dateOfPerformance').querySelector('input')
      const numberOfDaysDiscounting = getByTestId('numberOfDaysDiscounting').querySelector('input')

      changeFormikField(invoiceAmount, 22)
      changeFormikField(advancedRate, 33)
      changeFormikField(discountingDate, '2019-01-01')
      changeFormikField(numberOfDaysDiscounting, 5)
      changeFormikField(dateOfPerformance, '2019-01-01')

      const form = getByTestId('apply-for-discounting-form')
      fireEvent.submit(form)

      wait(() => {
        expect(testProps.createReceivablesDiscountingApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            advancedRate: 33,
            dateOfPerformance: '2019-01-01',
            discountingDate: '2019-01-01',
            invoiceAmount: 22,
            version: 2
          })
        )

        done()
      })
    })

    it('replaces an RD', async done => {
      const rdInfo = buildFakeReceivablesDiscountingInfo()
      const { queryByTestId } = render(<ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />)

      changeFormikField(queryByTestId('invoiceAmount').querySelector('input'), 22)
      changeFormikField(queryByTestId('advancedRate').querySelector('input'), 33)
      changeFormikField(queryByTestId('numberOfDaysDiscounting').querySelector('input'), 44)
      changeFormikField(queryByTestId('discountingDate').querySelector('input'), '2019-01-01')
      changeFormikField(queryByTestId('dateOfPerformance').querySelector('input'), '2020-01-01')

      fireEvent.submit(queryByTestId('apply-for-discounting-form'))

      wait(() => {
        expect(testProps.updateReceivablesDiscountingApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            advancedRate: 33,
            dateOfPerformance: '2020-01-01',
            discountingDate: '2019-01-01',
            invoiceAmount: 22,
            numberOfDaysDiscounting: 44,
            version: 2
          }),
          rdInfo.rd.staticId,
          true
        )

        done()
      })
    })

    it('does not create or update an RD, for Discounting without recourse', async done => {
      const rdInfo = buildFakeReceivablesDiscountingInfo()
      const { source, sourceId } = testProps.trade
      rdInfo.rd.tradeReference = { source, sourceId, sellerEtrmId: '1234' }
      const { getByTestId } = render(<ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />)

      const form = getByTestId('apply-for-discounting-form')
      fireEvent.submit(form)

      wait(() => {
        expect(testProps.history.push).toHaveBeenCalledWith(
          `/receivable-discounting/${rdInfo.rd.staticId}/request-for-proposal`
        )
        expect(testProps.updateReceivablesDiscountingApplication).not.toHaveBeenCalled()
        expect(testProps.createReceivablesDiscountingApplication).not.toHaveBeenCalled()

        done()
      })
    })
  })

  describe('Fetching RD', () => {
    it('shows RD data in the form if RD found', () => {
      const rdInfo = buildFakeReceivablesDiscountingInfo()
      const { source, sourceId } = testProps.trade
      rdInfo.rd.tradeReference = { source, sourceId, sellerEtrmId: testProps.trade.sellerEtrmId }

      const { getByTestId } = render(<ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />)

      const invoiceAmount = getByTestId('invoiceAmount').querySelector('input')
      const discountingDate = getByTestId('discountingDate').querySelector('input')
      const dateOfPerformance = getByTestId('dateOfPerformance').querySelector('input')
      const numberOfDaysDiscounting = getByTestId('numberOfDaysDiscounting').querySelector('input')

      expect(invoiceAmount.value).toEqual(Numeral(rdInfo.rd.invoiceAmount).format('0,0.00'))
      expect(discountingDate.value).toEqual(rdInfo.rd.discountingDate)
      expect(dateOfPerformance.value).toEqual(rdInfo.rd.dateOfPerformance)
      expect(numberOfDaysDiscounting.value).toEqual(rdInfo.rd.numberOfDaysDiscounting.toString())
    })

    it('fetches RD', () => {
      render(<ApplyForDiscountingContainer {...testProps} />)

      expect(testProps.fetchRdsByStaticIds).toHaveBeenCalled()
    })

    it('should display only fetched RD data if more recent than draft', async done => {
      const draftInvoiceAmountValue = Math.random() * 10000
      const draftNumberOfDaysDiscounting = Math.round(Math.random() * 100)

      const rdInfo = fakeRdInfoWithTradeReference(testProps.trade)
      rdInfo.rd.updatedAt = datePlusHours(new Date().toJSON(), 1)
      rdInfo.rd.invoiceAmount = draftInvoiceAmountValue + 100
      rdInfo.rd.numberOfDaysDiscounting = undefined

      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />
        </Router>
      )
      saveDraftChanges(dom, {
        invoiceAmount: draftInvoiceAmountValue,
        numberOfDaysDiscounting: draftNumberOfDaysDiscounting
      })
      dom.unmount()

      const { getByTestId } = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />
        </Router>
      )

      const initialInvoiceAmountValue = getByTestId('invoiceAmount').querySelector('input').value
      const initialNumberOfDaysDiscountingValue = getByTestId('numberOfDaysDiscounting').querySelector('input').value
      const formatted = (n: number) => Numeral(n).format('0,0.00')

      wait(() => {
        expect(initialInvoiceAmountValue).toEqual(formatted(rdInfo.rd.invoiceAmount))
        expect(initialNumberOfDaysDiscountingValue).toEqual('')
        done()
      })
    })

    it('should display only draft data if more recent than fetched RD data', async done => {
      const draftInvoiceAmountValue = Math.random() * 10000

      const rdInfo = fakeRdInfoWithTradeReference(testProps.trade)
      rdInfo.rd.updatedAt = datePlusHours(new Date().toJSON(), -1)
      rdInfo.rd.invoiceAmount = draftInvoiceAmountValue + 100

      const dom = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />
        </Router>
      )

      saveDraftChanges(dom, { invoiceAmount: draftInvoiceAmountValue })
      dom.unmount()

      const { getByTestId } = render(
        <Router>
          <ApplyForDiscountingContainer {...testProps} rdInfo={rdInfo} />
        </Router>
      )

      const initialInvoiceAmountValue = getByTestId('invoiceAmount').querySelector('input').value
      const formatted = (n: number) => Numeral(n).format('0,0.00')
      wait(() => {
        expect(initialInvoiceAmountValue).toEqual(formatted(draftInvoiceAmountValue))
        done()
      })
    })
  })
})

interface IDraftChanges {
  [key: string]: string | number
}

function saveDraftChanges(dom: RenderResult, changes: IDraftChanges): RenderResult {
  for (const [field, value] of Object.entries(changes)) {
    const inputField = dom.getByTestId(field).querySelector('input')
    changeFormikField(inputField, value)
  }
  const [saveAsDraft] = dom.queryAllByTestId('button-save-as-draft')
  fireEvent.click(saveAsDraft)
  return dom
}

function fakeRdInfoWithTradeReference(trade: ITradeEnriched) {
  const rdInfo = buildFakeReceivablesDiscountingInfo()
  const { source, sourceId } = trade
  rdInfo.rd.tradeReference = { source, sourceId, sellerEtrmId: trade.sellerEtrmId }
  return rdInfo
}

function selectRequestType(dom: RenderResult, requestType: RequestType) {
  dom
    .getByTestId(`radioButtongroup-${RequestType.Discount}`)
    .querySelector('label')
    .click()
}

function datePlusHours(date: string, hours: number) {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() + hours)
  return newDate.toJSON()
}
