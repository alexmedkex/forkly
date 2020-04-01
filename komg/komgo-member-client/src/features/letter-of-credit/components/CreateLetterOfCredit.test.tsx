import * as React from 'react'
import { render, cleanup, fireEvent, queryByAttribute, wait } from '@testing-library/react'
import { CreateLetterOfCredit, CreateLetterOfCreditProps } from './CreateLetterOfCredit'
import { fromJS } from 'immutable'
import {
  buildFakeTrade,
  buildFakeCargo,
  buildFakeTemplate,
  buildFakeTemplateBinding,
  Currency,
  LetterOfCreditType
} from '@komgo/types'
import { fakeMember, fakeCounterparty, mockDate } from '../../letter-of-credit-legacy/utils/faker'
import { MemoryRouter as Router } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

const templateSchemaId = 'http://komgo.io/schema/sblc/template-bindings/1'
const dataSchemaId = 'http://komgo.io/schema/data-letter-of-credit/1/base'
const applicantStaticId = 'c172f8c1-4d4f-4209-9500-d70fdaf8b76f'
const beneficiaryStaticId = 'f0bc781d-c98c-4a06-ac12-3e09a0749d7f'
const issuingBank1StaticId = '18ccb461-d89e-449a-a517-cdfd110d3621'
const templateStaticId = 'e2afbc01-984c-458d-b629-c042bfa978c0'

const trade = buildFakeTrade({ version: 2, price: 1, quantity: 100 })
const cargo = buildFakeCargo({ version: 2 })

const issuingBanks = [
  fakeCounterparty({ isFinancialInstitution: true, commonName: 'Bank 1', staticId: issuingBank1StaticId }),
  fakeCounterparty({ isFinancialInstitution: true, commonName: 'Bank 2' }),
  fakeCounterparty({ isFinancialInstitution: true, commonName: 'Bank 3' })
]

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

const bindings: any = {
  trade: 'http://komgo.io/schema/trade/2',
  cargo: 'http://komgo.io/schema/cargo/2',
  beneficiary: 'http://komgo.io/schema/company/1/base',
  applicant: 'http://komgo.io/schema/company/1/base',
  issuingBank: 'http://komgo.io/schema/company/1/base',
  beneficiaryBank: 'http://komgo.io/schema/company/1/base'
}

describe('CreateLetterOfCredit', () => {
  let testProps: CreateLetterOfCreditProps
  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')

    globalAsAny.window.getSelection = jest.fn(() => {
      return {}
    })

    testProps = {
      trade: fromJS(trade),
      cargo,
      applicant: fakeMember({ staticId: applicantStaticId }),
      beneficiary: fakeMember({ staticId: beneficiaryStaticId, commonName: 'beneficiary' }),
      issuingBanks,
      beneficiaryBanks: [],
      template: fromJS(buildFakeTemplate({ template: minValidSlateDocument as any, staticId: templateStaticId })),
      templateBinding: fromJS(
        buildFakeTemplateBinding({
          templateSchemaId,
          dataSchemaId,
          bindings
        })
      ),
      onSubmit: jest.fn()
    }
  })

  afterEach(() => {
    globalAsAny.window.getSelection = originalGetSelection
    // globalAsAny.document.createRange = originalCreateRange
    afterEach(cleanup)
  })

  afterAll(() => {
    mockDate().restore()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(
      <Router>
        <CreateLetterOfCredit {...testProps} />
      </Router>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('matches snapshot when there is a bad slate document', () => {
    const { asFragment } = render(
      <Router>
        <CreateLetterOfCredit {...testProps} template={fromJS(buildFakeTemplate({ template: {} as any }))} />
      </Router>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  describe('submission', () => {
    it('calls onSubmit when form fields are filled and template is valid', async () => {
      // notes:
      // - this test takes over 5000ms
      //
      // - there are lots of logs asking to wrap in act()
      //   e.g. Warning: An update to Template inside a test was not wrapped in act(...).
      //   these still appear after wrapping in act. :(
      //
      // - the awaits were necessary or the form wouldn't have updated
      jest.setTimeout(30000)

      const rendered = render(
        <Router>
          <CreateLetterOfCredit {...testProps} />
        </Router>
      )

      const first = rendered.asFragment()

      await wait(() => {
        fireEvent.click(rendered.getByTestId('issuingBankId'))
      })
      await wait(() => {
        fireEvent.click(rendered.getAllByText(issuingBanks[0].x500Name.CN)[1])
      })
      await wait(() => {
        fireEvent.focus(rendered.getByDisplayValue('100.00'))
      })
      const amount = 1000
      await wait(() => {
        userEvent.type(rendered.getByDisplayValue('100'), `${amount}`)
      })
      await wait(() => {
        fireEvent.blur(rendered.getByDisplayValue('1000'))
      })
      await wait(() => {
        userEvent.click(rendered.getByTestId('currency'))
      })
      const currency = Currency.USD
      await wait(() => {
        userEvent.click(rendered.getByText(currency))
      })

      const date = '2030-01-01'
      const getById = queryByAttribute.bind(null, 'id')

      await wait(() => {
        userEvent.type(getById(rendered.container, 'field_expiryDate'), date)
      })

      await wait(() => {
        userEvent.click(rendered.getByTestId('submit-letter-of-credit-application'))
      })

      await wait(() => {
        expect(testProps.onSubmit).toHaveBeenCalledWith({
          templateInstance: {
            bindings,
            data: {
              amount,
              applicant: { staticId: applicantStaticId },
              beneficiary: { staticId: beneficiaryStaticId },
              cargo: { cargoId: cargo.cargoId, source: cargo.source, sourceId: cargo.sourceId },
              currency,
              expiryDate: date,
              issuingBank: { staticId: issuingBank1StaticId },
              trade: { source: trade.source, sourceId: trade.sourceId },
              version: 1
            },
            dataSchemaId,
            template: minValidSlateDocument,
            templateSchemaId,
            templateStaticId,
            version: 1
          },
          type: LetterOfCreditType.Standby,
          version: 1
        })
      })

      expect(first).toMatchDiffSnapshot(rendered.asFragment())
    })
  })
})
