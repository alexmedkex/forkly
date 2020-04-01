import * as React from 'react'
import { mount } from 'enzyme'
import { FormikProvider } from 'formik'
import { fakeFormikContext } from '../../../../store/common/faker'
import {
  PricingType,
  buildFakeQuote,
  DiscountingType,
  RequestType,
  Currency,
  buildFakeReceivablesDiscountingExtended
} from '@komgo/types'
import TraderAcceptQuoteForm, { TraderAcceptQuoteFormOwnProps } from './TraderAcceptQuoteForm'
import { MemoryRouter as Router } from 'react-router-dom'
import { initialAcceptQuoteData } from '../../utils/constants'
import { render, wait, fireEvent } from '@testing-library/react'
import { changeFormikField } from '../../utils/test-utils'

describe('<TraderAcceptQuoteForm />', () => {
  let discountingType: DiscountingType
  let requestType: RequestType
  let wrapper
  let props: TraderAcceptQuoteFormOwnProps
  let formikContext: any

  beforeEach(() => {
    requestType = RequestType.Discount
    discountingType = DiscountingType.WithoutRecourse
    props = {
      rdId: 'An-RDID',
      participantStaticId: 'A-PARTICPANT-STATIC-ID',
      tradeId: 'TRADE-ID',
      quote: buildFakeQuote({}, false, requestType, discountingType),
      bankName: 'A-BANK-NAME',
      rdError: null,
      traderSubmitQuoteLoader: false,
      rd: buildFakeReceivablesDiscountingExtended(false, { requestType, discountingType }),
      traderCreateQuote: jest.fn()
    }

    formikContext = fakeFormikContext<TraderAcceptQuoteFormOwnProps>(
      initialAcceptQuoteData(props.quote, props.rd.currency, props.rd.requestType)
    )

    wrapper = mount(
      <Router>
        <FormikProvider value={formikContext}>
          <TraderAcceptQuoteForm {...props} />
        </FormikProvider>
      </Router>
    )
  })

  it('should render as expected', () => {
    expect(
      render(
        <Router>
          <TraderAcceptQuoteForm {...props} />
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  describe('Validation errors', () => {
    it('should show validation errors if invalid entries are provided', done => {
      props.quote.pricingType = PricingType.FlatFee
      props.quote.pricingFlatFeeAmount = { amount: 20, currency: Currency.CHF }

      const { queryByTestId, asFragment, queryByText } = render(
        <Router>
          <TraderAcceptQuoteForm {...props} />
        </Router>
      )

      const beforeSubmitClicked = asFragment()

      changeFormikField(queryByTestId('advanceRate').querySelector('input'), '')
      changeFormikField(queryByTestId('numberOfDaysDiscounting').querySelector('input'), '')
      changeFormikField(queryByTestId('pricingFlatFeeAmount.amount').querySelector('input'), '')

      fireEvent.submit(queryByTestId('trader-accept-quote-form'))

      wait(() => {
        const afterSubmitClicked = asFragment()
        expect(queryByText('Validation Errors')).toBeVisible()
        expect(beforeSubmitClicked).toMatchDiffSnapshot(afterSubmitClicked)
        done()
      })
    })

    it('should show validation errors if invalid entries are provided', done => {
      props.quote.pricingType = PricingType.Split
      props.quote.pricingMargin = 30
      props.quote.pricingRiskFee = 20

      const { queryByTestId, asFragment, queryByText } = render(
        <Router>
          <TraderAcceptQuoteForm {...props} />
        </Router>
      )

      const beforeSubmitClicked = asFragment()

      changeFormikField(queryByTestId('margin').querySelector('input'), '')
      changeFormikField(queryByTestId('riskFee').querySelector('input'), '')

      fireEvent.submit(queryByTestId('trader-accept-quote-form'))

      wait(() => {
        const afterSubmitClicked = asFragment()
        expect(queryByText('Validation Errors')).toBeVisible()
        expect(beforeSubmitClicked).toMatchDiffSnapshot(afterSubmitClicked)
        done()
      })
    })

    it('should show validation errors if invalid entries are provided', done => {
      props.quote.pricingType = PricingType.AllIn
      props.quote.pricingAllIn = 30

      const { queryByTestId, asFragment, queryByText } = render(
        <Router>
          <TraderAcceptQuoteForm {...props} />
        </Router>
      )

      const beforeSubmitClicked = asFragment()

      changeFormikField(queryByTestId('pricingAllIn').querySelector('input'), '')

      fireEvent.submit(queryByTestId('trader-accept-quote-form'))

      wait(() => {
        const afterSubmitClicked = asFragment()
        expect(queryByText('Validation Errors')).toBeVisible()
        expect(beforeSubmitClicked).toMatchDiffSnapshot(afterSubmitClicked)
        done()
      })
    })
  })

  describe('Submit', () => {
    // cannot show modal to confirm submit!
    it('should succesfully submit final agreed terms', async () => {
      props.quote.pricingType = PricingType.AllIn
      const pricingAllIn = Math.random() * 100

      const { queryByTestId } = render(
        <Router>
          <TraderAcceptQuoteForm {...props} />
        </Router>
      )

      changeFormikField(queryByTestId('pricingAllIn').querySelector('input'), pricingAllIn)
      fireEvent.submit(queryByTestId('trader-accept-quote-form'))

      let confirm: HTMLElement
      await wait(() => {
        confirm = queryByTestId('accept-quote-confirm-submit')
        expect(queryByTestId('accept-quote-confirm-submit')).toBeVisible()
      })

      fireEvent.click(confirm)

      await wait(() => {
        expect(props.traderCreateQuote).toHaveBeenCalledTimes(1)
        expect(props.traderCreateQuote).toHaveBeenCalledWith(
          expect.objectContaining({ pricingAllIn }),
          props.rdId,
          props.participantStaticId
        )
      })
    })
  })

  it('should show "Risk fee" and "Margin" if pricing type is set to "split"', () => {
    expect(wrapper.find({ 'data-test-id': 'riskFee' }).exists()).toBeFalsy()
    expect(wrapper.find({ 'data-test-id': 'margin' }).exists()).toBeFalsy()

    props.quote.pricingType = PricingType.Split

    wrapper = mount(
      <Router>
        <FormikProvider value={formikContext}>
          <TraderAcceptQuoteForm {...props} />
        </FormikProvider>
      </Router>
    )

    expect(wrapper.find({ 'data-test-id': 'riskFee' }).exists()).toBeTruthy()
    expect(wrapper.find({ 'data-test-id': 'margin' }).exists()).toBeTruthy()
  })

  it('should show "all in pricing" if pricing type is set to "all in"', () => {
    expect(wrapper.find({ 'data-test-id': 'pricingAllIn' }).exists()).toBeTruthy()
  })
})
