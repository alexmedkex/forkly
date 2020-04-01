import React from 'react'
import { ViewLetterOfCreditProps, ViewLetterOfCredit } from './ViewLetterOfCredit'
import {
  buildFakeLetterOfCredit,
  buildFakeDataLetterOfCredit,
  IDataLetterOfCredit,
  LetterOfCreditStatus,
  LetterOfCreditTaskType
} from '@komgo/types'
import { v4 } from 'uuid'
import { fromJS } from 'immutable'
import { render, wait, queryByAttribute, fireEvent } from '@testing-library/react'
import { buildFakeTemplateInstance } from '@komgo/types/dist/template-library/template/faker'
import { MemoryRouter as Router } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { mockDate } from '../../letter-of-credit-legacy/utils/faker'

jest.setTimeout(30000)

const globalAsAny = global as any
const originalGetSelection = globalAsAny.window.getSelection

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

const companyStaticId = v4()

const fakeDataLatterOfCredit = buildFakeDataLetterOfCredit()

const buildFakeData = ({
  applicantOverride,
  issuingBankOverride
}: {
  applicantOverride?: string
  issuingBankOverride?: string
}) => (): IDataLetterOfCredit => ({
  ...fakeDataLatterOfCredit,
  applicant: applicantOverride
    ? { ...fakeDataLatterOfCredit.applicant, staticId: applicantOverride }
    : fakeDataLatterOfCredit.applicant,
  issuingBank: issuingBankOverride
    ? { ...fakeDataLatterOfCredit.issuingBank, staticId: issuingBankOverride }
    : fakeDataLatterOfCredit.issuingBank
})
const testProps: ViewLetterOfCreditProps = {
  letterOfCredit: fromJS(
    buildFakeLetterOfCredit({
      templateInstance: buildFakeTemplateInstance({
        factory: buildFakeData({ applicantOverride: companyStaticId }),
        template: minValidSlateDocument as any
      })
    })
  ),
  companyStaticId,
  onSubmit: jest.fn(),
  taskType: null
}

describe('ViewLetterOfCredit', () => {
  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')

    globalAsAny.window.getSelection = jest.fn(() => {
      return {}
    })
  })
  afterEach(() => {
    globalAsAny.window.getSelection = originalGetSelection
  })
  afterAll(() => {
    mockDate().restore()
  })
  it('matches snapshot when we are applicant', () => {
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCredit {...testProps} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('matches snapshot when we are issuing bank', () => {
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCredit
          {...testProps}
          letterOfCredit={fromJS(
            buildFakeLetterOfCredit({
              templateInstance: buildFakeTemplateInstance({
                dataSchemaId: 'http://komgo.io/schema/data-letter-of-credit/1/base',
                factory: buildFakeData({ issuingBankOverride: companyStaticId })
              }),
              status: LetterOfCreditStatus.Issued
            })
          )}
        />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('matches snapshot when we are issuing bank and status is requested and there is a review to do', () => {
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCredit
          {...testProps}
          letterOfCredit={fromJS(
            buildFakeLetterOfCredit({
              templateInstance: buildFakeTemplateInstance({
                dataSchemaId: 'http://komgo.io/schema/data-letter-of-credit/1/base',
                factory: buildFakeData({ issuingBankOverride: companyStaticId })
              }),
              status: LetterOfCreditStatus.Requested
            })
          )}
          taskType={LetterOfCreditTaskType.ReviewRequested}
        />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('matches snapshot when we have a document overriding the letter of credit template', () => {
    const issuanceDocumentMetadata = true as any

    const issuanceDocument = fromJS({
      documentRaw: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOs1Vv6HwAE0QJRJ/jTdwAAAABJRU5ErkJggg==',
      isLoadingContent: false,
      documentType: 'image/png'
    })

    const { asFragment } = render(
      <Router>
        <ViewLetterOfCredit
          {...testProps}
          issuanceDocument={issuanceDocument}
          issuanceDocumentMetadata={issuanceDocumentMetadata}
        />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('calls onSubmit with the right information', async () => {
    const getById = queryByAttribute.bind(null, 'id')

    const rendered = render(
      <Router>
        <ViewLetterOfCredit
          {...testProps}
          letterOfCredit={fromJS(
            buildFakeLetterOfCredit({
              templateInstance: buildFakeTemplateInstance({
                dataSchemaId: 'http://komgo.io/schema/data-letter-of-credit/1/base',
                factory: buildFakeData({ issuingBankOverride: companyStaticId }),
                template: minValidSlateDocument as any
              }),
              status: LetterOfCreditStatus.Requested
            })
          )}
          taskType={LetterOfCreditTaskType.ReviewRequested}
        />
      </Router>
    )

    const first = rendered.asFragment()

    // set issuing bank ref
    const issuingBankRef = 'MyRef'
    await wait(() => {
      userEvent.type(getById(rendered.container, 'field_issuingBankReference'), issuingBankRef)
    })

    // choose issue
    await wait(() => {
      fireEvent.click(rendered.getByText('Issue SBLC'))
    })

    // click submit
    await wait(() => {
      fireEvent.click(rendered.getByTestId('submit-letter-of-credit-review'))
    })

    await wait(() => {
      expect(testProps.onSubmit).toHaveBeenCalledWith(
        {
          amount: 10000,
          applicant: { staticId: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' },
          beneficiary: { staticId: 'ecc3b179-00bc-499c-a2f9-f8d1cc58e9db' },
          beneficiaryBank: { staticId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c' },
          cargo: { cargoId: 'F0401', source: 'KOMGO', sourceId: 'E2389423' },
          comment: '',
          currency: 'USD',
          expiryDate: '2019-11-29',
          file: null,
          issuingBank: { staticId: companyStaticId },
          issuingBankReference: 'MyRef',
          reviewDecision: 'ISSUE_SBLC',
          trade: { source: 'KOMGO', sourceId: 'E2389423' },
          version: 1
        },
        minValidSlateDocument
      )
    })

    expect(first).toMatchDiffSnapshot(rendered.asFragment())
  })
})
