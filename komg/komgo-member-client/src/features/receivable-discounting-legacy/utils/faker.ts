import { fakeTrade, fakeCargo, fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'
import {
  buildFakeReceivablesDiscountingExtended,
  IReceivablesDiscounting,
  InvoiceType,
  Currency,
  buildFakeQuoteBase,
  IReceivablesDiscountingInfo,
  RDStatus,
  ReplyType,
  IParticipantRFPReply,
  buildFakeQuote,
  buildFakeReceivablesDiscountingInfo,
  buildFakeCargo,
  IHistory,
  IQuote,
  IReceivablesDiscountingBase,
  RequestType,
  DiscountingType,
  SupportingInstrument
} from '@komgo/types'
import {
  IReceivableDiscountingDashboardTrader,
  IReceivableDiscountingDashboardBank,
  ISubmitQuoteFormDetails,
  IMemberMarketSelectionItem,
  ITradeSnapshot
} from '../store/types'
import _ from 'lodash'
import { createMemoryHistory } from 'history'
import { RouteComponentProps } from 'react-router'
import { DeepPartial } from '../../../utils/DeepPartial'
import { FormikProps } from 'formik'
import { initialApplyForDiscountingData } from './constants'
import { WithLicenseCheckProps } from '../../../components/with-license-check'
import { WithPermissionsProps } from '../../../components/with-permissions'
import { WithLoaderProps } from '../../../components/with-loaders'

export const fakeRdInfo = (overrides: DeepPartial<IReceivablesDiscountingInfo> = {}): IReceivablesDiscountingInfo =>
  _.merge(buildFakeReceivablesDiscountingInfo(), overrides)

export const fakeRouteComponentProps = <T>(
  overrides: DeepPartial<RouteComponentProps<T>> = {}
): RouteComponentProps<T> =>
  _.merge(
    {
      history: { ...createMemoryHistory(), push: jest.fn() },
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
        params: {
          id: 'id'
        }
      },
      staticContext: undefined
    },
    overrides
  ) as RouteComponentProps<T>

/**
 * Move this this to @komgo/types
 */
const fakeDate1 = '2019-05-19T13:00:00Z'
const fakeDate2 = '2019-05-20T14:00:00Z'
const fakeDate3 = '2019-05-21T15:00:00Z'
export const fakeRdApplicationHistory = (overrides: DeepPartial<IHistory<IReceivablesDiscounting>> = {}) =>
  _.merge(
    {
      id: 'rdId',
      historyEntry: {
        invoiceAmount: [{ updatedAt: fakeDate1, value: 1000 }, { updatedAt: fakeDate2, value: 1100 }],
        invoiceType: [
          { updatedAt: fakeDate1, value: InvoiceType.Final },
          { updatedAt: fakeDate2, value: InvoiceType.Indicative }
        ],
        titleTransfer: [{ updatedAt: fakeDate1, value: true }, { updatedAt: fakeDate2, value: false }],
        dateOfPerformance: [
          { updatedAt: fakeDate1, value: '2019-01-21' },
          { updatedAt: fakeDate2, value: '2019-01-22' }
        ],
        discountingDate: [{ updatedAt: fakeDate1, value: '2019-01-21' }, { updatedAt: fakeDate2, value: '2019-01-22' }],
        supportingInstruments: [
          {
            updatedAt: fakeDate1,
            value: [
              SupportingInstrument.PaymentConfirmation,
              SupportingInstrument.ParentCompanyGuarantee,
              SupportingInstrument.PromissoryNote
            ]
          },
          {
            updatedAt: fakeDate2,
            value: []
          },
          {
            updatedAt: fakeDate3,
            value: [SupportingInstrument.BillOfExchange]
          }
        ],
        comment: [{ updatedAt: fakeDate1, value: 'comment 1' }, { updatedAt: fakeDate2, value: 'comment 2' }]
      }
    },
    overrides
  )

export const fakeAgreedTermsHistory = (overrides: DeepPartial<IHistory<IQuote>> = {}) =>
  _.merge(
    {
      id: 'quoteId',
      historyEntry: {
        advanceRate: [{ updatedAt: fakeDate1, value: 1 }, { updatedAt: fakeDate2, value: 2 }],
        numberOfDaysDiscounting: [{ updatedAt: fakeDate1, value: 3 }, { updatedAt: fakeDate2, value: 4 }],
        daysUntilMaturity: [{ updatedAt: fakeDate1, value: 30 }, { updatedAt: fakeDate2, value: 60 }],
        comment: [{ updatedAt: fakeDate1, value: 'comment 0' }, { updatedAt: fakeDate2, value: 'oomment 1' }]
      }
    },
    overrides
  )

export const ACCEPTED_PARTICIPANT_STATIC_ID = '1d0d6806-6fe7-47b2-aef2-d3333'

export const fakeRFPReply = ({
  comment = 'example comment',
  senderStaticId = '1d0d6806-6fe7-47b2-aef2-efd458d66f26',
  createdAt = '2020-12-1',
  type = ReplyType.Accepted
} = {}): IParticipantRFPReply => ({
  type,
  createdAt,
  senderStaticId,
  comment,
  quote: buildFakeQuote()
})

export const fakeReceivablesDiscounting = (
  { status = RDStatus.PendingRequest, sourceId = 'SOURCE-ID-1' } = {},
  acceptedParticipantStaticId?: string
): IReceivablesDiscountingInfo => {
  const rd: IReceivablesDiscounting = buildFakeReceivablesDiscountingExtended()
  rd.tradeReference.sourceId = sourceId
  rd.currency = Currency.EUR
  return {
    rd,
    tradeSnapshot: {
      source: 'KOMGO',
      sourceId,
      trade: fakeTrade(),
      movements: [buildFakeCargo(), buildFakeCargo()],
      createdAt: '2020-12-1',
      updatedAt: '2020-12-1'
    },
    rfp: {
      participantStaticIds: ['static1', 'static2']
    },
    status,
    acceptedParticipantStaticId
  }
}

export const fakeLicenseCheckProps = (overrides?: Partial<WithLicenseCheckProps>): WithLicenseCheckProps =>
  _.merge(
    {
      isLicenseEnabled: jest.fn(() => true),
      isLicenseEnabledForCompany: jest.fn(() => true)
    },
    overrides
  )

export const fakeWithPermissionsProps = (overrides?: Partial<WithPermissionsProps>): WithPermissionsProps =>
  _.merge(
    {
      isAuthorized: jest.fn(() => true)
    },
    overrides
  )

export const fakeWithLoaderProps = (overrides?: Partial<WithLoaderProps>): WithLoaderProps =>
  _.merge(
    {
      isFetching: false,
      errors: []
    },
    overrides
  )

export const fakeReceivableDiscountingDashboardTrader = ({
  tradeId = 'TRADE-ID-1',
  tradeTechnicalId = 'TRADE-TECHNICAL-ID-1',
  rdId = 'RD-ID-1',
  status = 'To be discounted'
} = {}): IReceivableDiscountingDashboardTrader => ({
  tradeId,
  tradeTechnicalId,
  rdId,
  tradeDate: '2019/01/02',
  counterparty: 'BP',
  bank: '',
  commodity: 'BFOET',
  invoiceAmount: '1,230.00',
  currency: 'EUR',
  invoiceType: InvoiceType.Indicative,
  status
})

export const fakeReceivableDiscountingDashboardBank = ({
  tradeId = 'TRADE-ID-1',
  rdId = 'RD-ID-1',
  status = RDStatus.Requested
} = {}): IReceivableDiscountingDashboardBank => ({
  tradeId,
  requestDate: '2019-03-20',
  discountingDate: '2019-03-20',
  discountingDateType: 'Expected',
  seller: 'Mercuria',
  buyer: 'BP',
  paymentTerms: '4 days after BL',
  invoiceAmount: '1000',
  invoiceType: 'provisional',
  currency: 'USD',
  status: status as string,
  rd: { status, staticId: rdId }
})

export const fakeSubmitQuoteFormDetails = (
  requestType: RequestType = RequestType.Discount,
  discountingType: DiscountingType = DiscountingType.WithoutRecourse
): ISubmitQuoteFormDetails => {
  return {
    ...buildFakeQuoteBase({}, requestType, discountingType),
    rdId: 'RD-ID',
    comment: 'I am the comment of all comments.'
  }
}

export const fakeMemberMarketSelectionItem = ({
  counterparty = fakeCounterparty()
} = {}): IMemberMarketSelectionItem => ({
  counterparty,
  location: counterparty.x500Name.L,
  appetite: 'No',
  availability: 'Yes',
  creditLimit: '-',
  riskFee: '-',
  margin: '-',
  maxTenor: '-'
})

export const fakeITradeSnapshotHistory = (overrides: DeepPartial<IHistory<ITradeSnapshot>> = {}) =>
  _.merge(
    {
      historyEntry: {
        movements: [
          {
            id: '5d3ef4937f08eab94df3361b',
            historyEntry: {
              parcels: [
                {
                  id: '5d3ef4937f08ea9f07f3361c',
                  vesselIMO: [
                    { updatedAt: '2019-07-30T14:48:14.031Z', value: 455465 },
                    { updatedAt: '2019-07-30T09:03:02.456Z', value: 55465 },
                    { updatedAt: '2019-07-30T08:53:35.231Z', value: 5546 }
                  ],
                  laycanPeriod: {
                    historyEntry: {
                      startDate: [
                        { updatedAt: '2019-07-30T14:48:14.031Z', value: '2020-07-30T14:48:14.031Z' },
                        { updatedAt: '2019-08-30T14:48:14.031Z', value: '2020-07-30T14:48:14.031Z' }
                      ],
                      endDate: [
                        { updatedAt: '2019-07-30T14:48:14.031Z', value: '2020-07-30T14:48:14.031Z' },
                        { updatedAt: '2019-08-30T14:48:14.031Z', value: '2020-07-30T14:48:14.031Z' }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ],
        trade: {
          id: '5d3ef4937f08ea6adef3361a',
          historyEntry: {
            buyerEtrmId: [
              { updatedAt: '2019-07-30T14:48:13.604Z', value: 'hugh1' },
              { updatedAt: '2019-07-30T08:53:34.792Z', value: 'hugh' }
            ],
            quantity: [
              { updatedAt: '2019-07-30T14:48:13.604Z', value: 6664 },
              { updatedAt: '2019-07-30T09:03:02.049Z', value: 666 },
              { updatedAt: '2019-07-30T08:53:34.792Z', value: 77 }
            ],
            price: [
              { updatedAt: '2019-07-30T14:48:13.604Z', value: 44 },
              { updatedAt: '2019-07-30T09:03:02.049Z', value: 77 },
              { updatedAt: '2019-07-30T08:53:34.792Z', value: 99 }
            ]
          }
        }
      }
    },
    overrides
  )

export const fakeFormik: FormikProps<IReceivablesDiscountingBase> = {
  values: initialApplyForDiscountingData(
    RequestType.Discount,
    DiscountingType.WithoutRecourse
  ) as IReceivablesDiscountingBase,
  errors: {},
  touched: {},
  isValidating: false,
  isSubmitting: false,
  submitCount: 0,
  setStatus: jest.fn(),
  setError: jest.fn(),
  setErrors: jest.fn(),
  setSubmitting: jest.fn(),
  setTouched: jest.fn(),
  setValues: jest.fn(),
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  setFieldError: jest.fn(),
  validateForm: async () => ({}),
  validateField: async () => ({}),
  resetForm: jest.fn(),
  submitForm: jest.fn(),
  setFormikState: jest.fn(),
  handleSubmit: jest.fn(),
  handleReset: jest.fn(),
  handleBlur: () => jest.fn(),
  handleChange: () => jest.fn(),
  dirty: false,
  isValid: true,
  initialValues: initialApplyForDiscountingData(
    RequestType.Discount,
    DiscountingType.WithoutRecourse
  ) as IReceivablesDiscountingBase,
  registerField: jest.fn(),
  unregisterField: jest.fn()
}
