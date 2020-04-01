import * as React from 'react'
import { render, fireEvent, RenderResult, wait } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  StandbyLetterOfCreditApplication,
  StandbyLetterOfCreditApplicationProps
} from './StandbyLetterOfCreditApplication'
import { fakeCounterparty, mockDate } from '../../letter-of-credit-legacy/utils/faker'
import { TradeSource, Currency } from '@komgo/types'

const issuingBanks = [
  fakeCounterparty({ isFinancialInstitution: true, commonName: 'Bank 1' }),
  fakeCounterparty({ isFinancialInstitution: true, commonName: 'Bank 2' }),
  fakeCounterparty({ isFinancialInstitution: true, commonName: 'Bank 3' })
]

const applicantId = 'f0bc781d-c98c-4a06-ac12-3e09a0749d7f'
const beneficiaryId = '2af1d7d7-a3e0-485d-9bcd-53d3d0d22589'
const issuingBankId = ''
const tradeSourceId = 'f9c60190-8546-4445-95df-fb440e7cd82d'
const minValidSlateDocument = {
  nodes: [
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'applicant.x500Name.CN'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'issuingBank.x500Name.CN'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'beneficiaryBank.x500Name.CN'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'beneficiary.x500Name.CN'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'amount'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'currency'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'expiryDate'
      }
    },
    {
      object: 'inline',
      type: 'variable',
      data: {
        path: 'issuingBankReference'
      }
    }
  ]
}

describe('StandbyLetterOfCreditApplication', () => {
  let testProps: StandbyLetterOfCreditApplicationProps
  let rendered: RenderResult

  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')

    testProps = {
      initialValues: {
        version: 1,
        applicant: {
          staticId: applicantId
        },
        beneficiary: {
          staticId: beneficiaryId
        },
        issuingBank: {
          staticId: issuingBankId
        },
        trade: {
          source: TradeSource.Komgo,
          sourceId: tradeSourceId
        },
        cargo: {
          source: TradeSource.Komgo,
          sourceId: tradeSourceId,
          cargoId: 'myCargoId'
        },
        amount: 100,
        expiryDate: '2018-01-01',
        currency: Currency.AED
      },
      beneficiaryBanks: [],
      issuingBanks,
      onChange: jest.fn(),
      onSubmit: jest.fn(),
      templateModel: minValidSlateDocument
    }

    rendered = render(<StandbyLetterOfCreditApplication {...testProps} />)
  })
  afterAll(() => {
    mockDate().restore()
  })
  it('matches snapshot', () => {
    expect(rendered.asFragment()).toMatchSnapshot()
  })
  it('shows errors if a slate document errors is given', () => {
    const first = rendered.asFragment()
    rendered.rerender(<StandbyLetterOfCreditApplication {...testProps} templateModel={{}} />)
    expect(first).toMatchDiffSnapshot(rendered.asFragment())
  })
  it('Allows selection of issuing bank', () => {
    fireEvent.click(rendered.getByTestId('issuingBankId'))
    fireEvent.click(rendered.getAllByText(issuingBanks[0].x500Name.CN)[1])

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      issuingBank: {
        staticId: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
      }
    })
  })
  it('Allows selection of opening amount', () => {
    fireEvent.focus(rendered.getByDisplayValue('100.00'))
    userEvent.type(rendered.getByDisplayValue('100'), '1')
    fireEvent.blur(rendered.getByDisplayValue('1'))

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      amount: 1
    })
  })
  it('Allows selection of currency', () => {
    userEvent.click(rendered.getByTestId('currency'))
    userEvent.click(rendered.getByText(Currency.USD))

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      currency: Currency.USD
    })
  })
  it('Allows selection of expiry date', () => {
    const date = '2030-01-01'

    userEvent.type(rendered.getByDisplayValue('2018-01-01'), date)

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      expiryDate: date
    })
  })
  it('calls submit handler if submission button is clicked', async () => {
    fireEvent.click(rendered.getByTestId('issuingBankId'))
    fireEvent.click(rendered.getAllByText(issuingBanks[0].x500Name.CN)[1])

    fireEvent.focus(rendered.getByDisplayValue('100.00'))
    const amount = 1000
    userEvent.type(rendered.getByDisplayValue('100'), `${amount}`)
    fireEvent.blur(rendered.getByDisplayValue('1000'))

    userEvent.click(rendered.getByTestId('currency'))
    userEvent.click(rendered.getByText(Currency.USD))

    const date = '2030-01-01'
    userEvent.type(rendered.getByDisplayValue('2018-01-01'), date)

    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-application'))

    await wait(() => {
      expect(testProps.onSubmit).toHaveBeenCalledWith({
        amount,
        applicant: { staticId: applicantId },
        beneficiary: { staticId: beneficiaryId },
        cargo: {
          cargoId: testProps.initialValues.cargo.cargoId,
          source: testProps.initialValues.cargo.source,
          sourceId: tradeSourceId
        },
        currency: Currency.USD,
        expiryDate: date,
        issuingBank: { staticId: issuingBanks[0].staticId },
        trade: { source: testProps.initialValues.trade.source, sourceId: tradeSourceId },
        version: 1
      })
    })
  })
  it('cant call submit handler if disableSubmit prop is true', async () => {
    rendered.rerender(<StandbyLetterOfCreditApplication {...testProps} disableSubmit={true} />)
    fireEvent.click(rendered.getByTestId('issuingBankId'))
    fireEvent.click(rendered.getAllByText(issuingBanks[0].x500Name.CN)[1])

    fireEvent.focus(rendered.getByDisplayValue('100.00'))
    const amount = 1000
    userEvent.type(rendered.getByDisplayValue('100'), `${amount}`)
    fireEvent.blur(rendered.getByDisplayValue('1000'))

    userEvent.click(rendered.getByTestId('currency'))
    userEvent.click(rendered.getByText(Currency.USD))

    const date = '2030-01-01'
    userEvent.type(rendered.getByDisplayValue('2018-01-01'), date)

    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-application'))

    await wait(() => {
      expect(testProps.onSubmit).not.toHaveBeenCalled()
    })
  })
})
