import React from 'react'
import { render, fireEvent, act, wait, RenderResult, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { v4 } from 'uuid'

import { mockDate } from '../../letter-of-credit-legacy/utils/faker'
import {
  ReviewStandbyLetterOfCreditIssuingBankProps,
  ReviewStandbyLetterOfCreditIssuingBank,
  IssueFormData
} from './ReviewStandbyLetterOfCreditIssuingBank'
import { buildFakeDataLetterOfCreditBase, Currency } from '@komgo/types'
import { ReviewDecision } from '../constants'

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

const initialValues: IssueFormData = {
  ...buildFakeDataLetterOfCreditBase(),
  amount: 10000,
  reviewDecision: '',
  file: null
}

describe('ReviewStandbyLetterOfCreditIssuingBank', () => {
  let testProps: ReviewStandbyLetterOfCreditIssuingBankProps
  let rendered: RenderResult

  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')

    testProps = {
      initialValues,
      templateModel: minValidSlateDocument,
      disableSubmit: false,
      beneficiaryIsMember: true,
      applicantName: 'Applicant name',
      onSubmit: jest.fn(),
      onChange: jest.fn()
    }

    rendered = render(<ReviewStandbyLetterOfCreditIssuingBank {...testProps} />)
  })
  afterAll(() => {
    mockDate().restore()
  })
  it('matches initial snapshot', () => {
    expect(rendered.asFragment()).toMatchSnapshot()
  })
  it('calls onChange when Issue SBLC review decision option is chosen', async () => {
    act(() => {
      fireEvent.click(rendered.getByText('Issue SBLC'))
    })

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      reviewDecision: ReviewDecision.IssueSBLC
    })
  })
  it('calls onChange when reject application review decision option is chosen', () => {
    act(() => {
      fireEvent.click(rendered.getByText('Reject application'))
    })

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      reviewDecision: ReviewDecision.RejectApplication
    })
  })
  it('calls onChange when internal reference is filled in', () => {
    const getById = queryByAttribute.bind(null, 'id')
    const change = v4()

    act(() => {
      userEvent.type(getById(rendered.container, 'field_issuingBankReference'), change)
    })

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      issuingBankReference: change
    })
  })
  it('calls onChange when currency is changed', () => {
    const currency = Currency.EUR

    act(() => {
      userEvent.click(rendered.getByTestId('currency'))
      userEvent.click(rendered.getByText(currency))
    })

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      currency
    })
  })
  it('calls onChange when openinng amount is changed', () => {
    fireEvent.focus(rendered.getByDisplayValue('10,000.00'))
    userEvent.type(rendered.getByDisplayValue('10000'), '1')
    fireEvent.blur(rendered.getByDisplayValue('1'))

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      amount: 1
    })
  })
  it('calls onChange when expiry date is changed', () => {
    const date = '2030-01-01'

    act(() => {
      userEvent.type(rendered.getByDisplayValue(testProps.initialValues.expiryDate as string), date)
    })

    expect(testProps.onChange).toHaveBeenCalledWith({
      ...testProps.initialValues,
      expiryDate: date
    })
  })
  it('calls onSubmit when issue SBLC is chosen and send is clicked', async () => {
    fireEvent.click(rendered.getByText('Issue SBLC'))
    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))

    await wait(() => {
      expect(testProps.onSubmit).toHaveBeenCalledWith({
        ...testProps.initialValues,
        reviewDecision: ReviewDecision.IssueSBLC
      })
    })
  })
  it('does not call onSubmit when issue SBLC is chosen and send is clicked if disableSubmit is set', async () => {
    rendered.rerender(<ReviewStandbyLetterOfCreditIssuingBank {...testProps} disableSubmit={true} />)
    fireEvent.click(rendered.getByText('Issue SBLC'))
    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))

    await wait(() => {
      expect(testProps.onSubmit).not.toHaveBeenCalled()
    })
  })
  it('calls onSubmit when reject application is chosen and send is clicked', async () => {
    fireEvent.click(rendered.getByText('Reject application'))
    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))

    await wait(() => {
      expect(testProps.onSubmit).toHaveBeenCalledWith({
        ...testProps.initialValues,
        reviewDecision: ReviewDecision.RejectApplication
      })
    })
  })
  // TODO unskip when we have the comment feature
  it.skip('calls onSubmit with comment if given', async () => {
    const getById = queryByAttribute.bind(null, 'id')

    const comment = v4()

    fireEvent.click(rendered.getByText('Reject application'))
    userEvent.type(getById(rendered.container, 'field_comment'), comment)
    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))

    await wait(() => {
      expect(testProps.onSubmit).toHaveBeenCalledWith({
        ...testProps.initialValues,
        reviewDecision: ReviewDecision.RejectApplication,
        comment
      })
    })
  })
  it('does not call onSubmit when no file if given when beneficiary is not on komgo', async () => {
    rendered.rerender(<ReviewStandbyLetterOfCreditIssuingBank {...testProps} beneficiaryIsMember={false} />)
    fireEvent.click(rendered.getByText('Issue SBLC'))

    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))

    await wait(() => {
      expect(testProps.onSubmit).not.toHaveBeenCalled()
    })
  })
  it('calls onSubmit when no file if given when beneficiary is not on komgo', async () => {
    const getById = queryByAttribute.bind(null, 'id')

    const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })

    rendered.rerender(<ReviewStandbyLetterOfCreditIssuingBank {...testProps} beneficiaryIsMember={false} />)
    fireEvent.click(rendered.getByText('Issue SBLC'))

    fireEvent.change(getById(rendered.container, 'file-upload'), { target: { files: [file] } })

    fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))

    await wait(() => {
      expect(testProps.onSubmit).toHaveBeenCalledWith({
        ...testProps.initialValues,
        reviewDecision: ReviewDecision.IssueSBLC,
        file
      })
    })
  })
})
