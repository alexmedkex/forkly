import React from 'react'
import { ISubmitQuoteContainerProps, SubmitQuoteContainer } from './SubmitQuoteContainer'
import {
  fakeRdInfo,
  fakeRouteComponentProps,
  fakeWithLoaderProps,
  fakeWithPermissionsProps,
  fakeLicenseCheckProps
} from '../../../receivable-discounting-legacy/utils/faker'
import { fakeMember, fakeTrade } from '../../../letter-of-credit-legacy/utils/faker'
import { render, fireEvent, wait, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import { store } from '../../../../store'
import { PricingType, buildFakeCreditLine, buildFakeRiskCoverData, buildFakeSharedCreditLine } from '@komgo/types'
import { productRD } from '@komgo/products'
import { tradeFinanceManager } from '@komgo/permissions'
import moment from 'moment-timezone'
import { changeFormikField } from '../../../receivable-discounting-legacy/utils/test-utils'
import { IExtendedCreditLine } from '../../../credit-line/store/types'

describe('SubmitQuoteContainer', () => {
  let testProps: ISubmitQuoteContainerProps
  let rendered: RenderResult

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    Date.now = jest.fn(() => 1487076708000)

    const extendedCreditLine: IExtendedCreditLine = {
      ...buildFakeCreditLine(),
      counterpartyName: 'BP',
      counterpartyLocation: '',
      data: buildFakeRiskCoverData(),
      sharedCreditLines: [{ ...buildFakeSharedCreditLine(), counterpartyName: '' }]
    }

    testProps = {
      ...fakeRouteComponentProps({ match: { params: { rdId: 'test-rd-id' } } }),
      ...fakeWithLoaderProps(),
      ...fakeWithPermissionsProps({ isAuthorized: perm => perm === tradeFinanceManager.canCrudRDRequests }),
      ...fakeLicenseCheckProps({ isLicenseEnabled: product => product === productRD }),
      isSubmitting: false,
      discountingRequest: fakeRdInfo(),
      trade: fakeTrade(),
      creditAppetite: extendedCreditLine,
      members: [fakeMember()],
      fetchRDRequesForSubmitQuote: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      bankCreateQuote: jest.fn(),
      isAuthorized: () => true
    }
    rendered = render(
      <Router>
        <Provider store={store}>
          <SubmitQuoteContainer {...testProps} />
        </Provider>
      </Router>
    )
  })

  it('should render correctly', () => {
    expect(rendered.asFragment()).toMatchSnapshot()
  })

  it('should be unauthorized if no license for RD', () => {
    expect(
      render(
        <Router>
          <Provider store={store}>
            <SubmitQuoteContainer {...testProps} isLicenseEnabled={product => product !== productRD} />
          </Provider>
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should display loading transition', () => {
    expect(
      render(
        <Router>
          <Provider store={store}>
            <SubmitQuoteContainer {...testProps} isFetching={true} />
          </Provider>
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should display errors', () => {
    expect(
      render(
        <Router>
          <Provider store={store}>
            <SubmitQuoteContainer {...testProps} errors={[{ message: 'Stop! Its broken' } as any]} />
          </Provider>
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should be unauthorized if cannot tradeFinanceManager.crudRDRequests', () => {
    expect(
      render(
        <Router>
          <Provider store={store}>
            <SubmitQuoteContainer
              {...testProps}
              isAuthorized={perm => perm !== tradeFinanceManager.canCrudRDRequests}
            />
          </Provider>
        </Router>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should navigate to the review request screen if cancel is clicked', done => {
    const { queryByTestId } = rendered

    fireEvent.click(queryByTestId('bank-submit-quote-cancel-btn'))

    wait(() => {
      expect(testProps.history.push).toHaveBeenCalledWith(`/receivable-discounting/${testProps.match.params.rdId}`)
      done()
    })
  })

  it('should trip validation errors if the form is submitted and fields are invalid', done => {
    const { queryByTestId, queryByText, asFragment } = rendered

    const beforeSubmitClicked = asFragment()
    fireEvent.submit(queryByTestId('bank-submit-quote-form'))

    wait(() => {
      const afterSubmitClicked = asFragment()
      expect(queryByText('Validation Errors')).toBeVisible()
      expect(beforeSubmitClicked).toMatchDiffSnapshot(afterSubmitClicked)
      done()
    })
  })

  it('should submit successfully when forms are filled', done => {
    const { queryByTestId, queryByText } = rendered

    changeFormikField(queryByTestId('advanceRate').querySelector('input'), 30)
    changeFormikField(queryByTestId('numberOfDaysDiscounting').querySelector('input'), 30)
    changeFormikField(queryByTestId('pricingAllIn').querySelector('input'), 25)
    changeFormikField(queryByTestId('indicativeCof').querySelector('input'), 1.5)

    fireEvent.submit(queryByTestId('bank-submit-quote-form'))

    wait(() => {
      expect(queryByText('Validation Errors')).toBeNull()
      expect(testProps.bankCreateQuote).toHaveBeenCalledWith(
        expect.objectContaining({
          advanceRate: 30,
          numberOfDaysDiscounting: 30,
          pricingType: PricingType.AllIn,
          pricingAllIn: 25
        }),
        testProps.match.params.rdId
      )
      done()
    })
  })
})
