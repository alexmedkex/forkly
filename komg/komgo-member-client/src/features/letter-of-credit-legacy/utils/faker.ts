import {
  IDiff,
  PaymentTermsEventBase,
  PaymentTermsWhen,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  Currency,
  PriceUnit,
  InvoiceQuantity,
  CreditRequirements,
  buildFakeCargo,
  Grade,
  PaymentTermsOption
} from '@komgo/types'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { IStateTransition } from '../../letter-of-credit-legacy/store/types'
import { IMember } from '../../members/store/types'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { ITrade, ICargo } from '@komgo/types'
import { Document, Product } from '../../document-management/store/types'
import {
  findTasksByLetterOfCreditId,
  findTaskStatusByLetterOfCreditId,
  findLatestShipment
} from '../../letter-of-credit-legacy/utils/selectors'
import { findParticipantCommonNames, findRole } from '../../financial-instruments/utils/selectors'
import { ILetterOfCreditEnriched } from '../../letter-of-credit-legacy/containers/LetterOfCreditDashboard'
import { Task, TaskStatus } from '../../tasks/store/types'
import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'
import * as immutable from 'immutable'
import { CouneterpartyStatus, Counterparty } from '../../counterparties/store/types'
import {
  TEMPLATE_TYPE_OPTIONS,
  INVOICE_REQUIREMENT_OPTIONS,
  BILL_OF_LADING_ENDORSEMENT_OPTIONS,
  FEES_PAYABLE_BY_OPTIONS,
  AVAILABLE_WITH_OPTIONS
} from '../constants'
import { ITradeAndCargoSnapshot } from '../../letter-of-credit-legacy/types/ITradeAndCargoSnapshot'
import { mapActionsToTaskType } from './selectors'
import { initialLetterOfCreditValues } from '../constants'
import { ModeOfTransport, Law, TradeSource } from '@komgo/types'
import { ILCPresentation } from '../types/ILCPresentation'
import { LCPresentationStatus } from '../store/presentation/types'
import { LOC_CATEGORIES, TradingRole } from '../../trades/constants'
import { ITimer } from '../../../store/common/types'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'
import { ITradeEnriched } from '../../trades/store/types'

const APPLICANT_ID = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
const BENEFICIARY_ID = '08e9f8e3-94e5-459e-8458-ab512bee6e2c'
const SOME_DATE = '2019-02-04T14:47:26.988Z'

export const fakeLetterOfCredit = ({
  _id = '08e9f8',
  transactionHash = '0x001',
  reference = 'LC18-MER-1',
  issuingBankReference = 'BK18-XX-1',
  applicantId = APPLICANT_ID,
  beneficiaryId = BENEFICIARY_ID,
  issuingBankId = '1bc05a66-1eba-44f7-8f85-38204e4d3516',
  beneficiaryBankId = 'ecc3b179-00bc-499c-a2f9-f8d1cc58e9db',
  amount = 1000000,
  status = ILetterOfCreditStatus.REQUESTED,
  beneficiaryBankRole = Roles.ADVISING_BANK,
  tradeAndCargoSnapshot = fakeTradeAndCargoSnapshot(),
  updatedAt = '2018-11-13T00:00:00.000Z'
} = {}): ILetterOfCredit => ({
  _id,
  transactionHash,
  applicantId,
  applicantContactPerson: 'Donald Duck',
  beneficiaryId,
  beneficiaryContactPerson: 'string',
  issuingBankId,
  issuingBankContactPerson: 'Scrooge',
  issuingBankReference,
  direct: false,
  beneficiaryBankId,
  // advisingBankId,
  // negotiatingBankId,
  beneficiaryBankContactPerson: 'Mickey Mouse',
  beneficiaryBankRole,
  tradeId: '5bc70b98a4d2e71359efd4ab',
  tradeAndCargoSnapshot,
  type: 'IRREVOCABLE',
  applicableRules: 'UCP latest version',
  feesPayableBy: FEES_PAYABLE_BY_OPTIONS.APPLICANT,
  currency: 'EUR',
  amount,
  expiryDate: '2020-12-31',
  expiryPlace: Roles.ISSUING_BANK,
  availableWith: AVAILABLE_WITH_OPTIONS.ISSUING_BANK,
  availableBy: 'DEFERRED_PAYMENT',
  partialShipmentAllowed: true,
  transhipmentAllowed: false,
  documentPresentationDeadlineDays: 21,
  comments: 'a comment',
  reference,
  status,
  freeTextLc: 'a template',
  billOfLadingEndorsement: BILL_OF_LADING_ENDORSEMENT_OPTIONS.ISSUING_BANK,
  invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE,
  templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT,

  LOI: 'template',
  updatedAt
})

export const fakeLetterOfCreditTemplate = (fields: object = {}) => ({
  ...initialLetterOfCreditValues,
  applicant: { name: '', locality: '' },
  beneficiary: { name: '', locality: '' },
  beneficiaryBank: { name: '', locality: '' },
  issuingBank: { name: '', locality: '' },
  cargo: {},
  cargoIds: [],
  direct: false,
  LOIAllowed: false,
  LOI: '',
  applicableRules: '',
  availableBy: '',
  ...fields
})

export const fakeMember = ({
  staticId = APPLICANT_ID,
  commonName = 'Applicant Name',
  isMember = true,
  isFinancialInstitution = false,
  country = 'country'
} = {}): IMember => {
  return {
    staticId,
    isMember,
    isFinancialInstitution,
    vaktStaticId: 'V234',
    hasSWIFTKey: false,
    x500Name: {
      CN: commonName,
      O: `${commonName} ltd`,
      C: country,
      L: 'city',
      STREET: 'street',
      PC: 'postal code'
    }
  }
}

export const fakeCounterparty = ({
  staticId = APPLICANT_ID,
  commonName = 'Applicant Name',
  isMember = true,
  isFinancialInstitution = false,
  status = 'Onboarded',
  country = 'country'
} = {}): Counterparty => {
  return {
    covered: status === CouneterpartyStatus.COMPLETED ? true : false,
    status,
    ...fakeMember({ staticId, commonName, isMember, isFinancialInstitution, country })
  }
}

export const fakeTrade = ({
  _id = '123',
  source = TradeSource.Vakt,
  sourceId = 'E1243',
  buyer = 'BP-id',
  buyerEtrmId = 'E222',
  seller = 'Mercuria-d',
  sellerEtrmId = '',
  price = 73.1415,
  creditRequirement = CreditRequirements.DocumentaryLetterOfCredit,
  deliveryLocation = 'Weymouth',
  tradingRole = TradingRole.BUYER
} = {}): ITradeEnriched => ({
  _id,
  source,
  sourceId,
  status: LOC_CATEGORIES.TO_BE_FINANCED,
  buyer,
  seller,
  price,
  deliveryPeriod: {
    startDate: '2020-12-1',
    endDate: '2020-12-31'
  },
  buyerEtrmId,
  sellerEtrmId,
  dealDate: '2018-10-29',
  paymentTerms: {
    eventBase: 'BL',
    when: PaymentTermsWhen.From,
    time: 30,
    timeUnit: PaymentTermsTimeUnit.Days,
    dayType: PaymentTermsDayType.Calendar
  },
  currency: Currency.USD,
  priceUnit: PriceUnit.BBL,
  quantity: 600000,
  deliveryTerms: 'FOB',
  minTolerance: 1,
  maxTolerance: 1,
  invoiceQuantity: InvoiceQuantity.Load,
  generalTermsAndConditions: 'SUKO90',
  laytime: 'as per GT&Cs',
  demurrageTerms: 'as per GT&Cs',
  law: Law.EnglishLaw,
  commodity: 'BFOET',
  creditRequirement,
  requiredDocuments: [
    'BILL_OF_LADING',
    'CERTIFICATE_OF_ORIGIN',
    'QUALITY_AND_QUANTITY_REPORT',
    'CERTIFICATE_OF_INSURANCE'
  ],
  deliveryLocation,
  createdAt: '',
  updatedAt: '',
  tradingRole
})

export const fakeTradeSeller = ({
  _id = '123',
  source = TradeSource.Vakt,
  sourceId = 'E1243',
  seller = 'BP-id',
  sellerEtrmId = 'E111',
  buyer = 'Mercuria-d',
  price = 73.1415,
  deliveryLocation = 'Weymouth',
  tradingRole = TradingRole.SELLER
} = {}): ITradeEnriched => ({
  _id,
  source,
  sourceId,
  status: 'OK',
  buyer,
  seller,
  price,
  deliveryPeriod: {
    startDate: '2019-01-02',
    endDate: '2019-01-05'
  },
  buyerEtrmId: '',
  sellerEtrmId,
  dealDate: '2018-10-29',
  paymentTerms: {
    eventBase: 'BL',
    when: PaymentTermsWhen.From,
    time: 30,
    timeUnit: PaymentTermsTimeUnit.Days,
    dayType: PaymentTermsDayType.Calendar
  },
  currency: Currency.USD,
  priceUnit: PriceUnit.BBL,
  quantity: 600000,
  deliveryTerms: 'FOB',
  deliveryLocation,
  minTolerance: 1,
  maxTolerance: 1,
  invoiceQuantity: InvoiceQuantity.Load,
  generalTermsAndConditions: 'SUKO90',
  law: Law.EnglishLaw,
  commodity: 'BFOET',
  creditRequirement: CreditRequirements.OpenCredit,
  requiredDocuments: [],
  createdAt: '',
  updatedAt: '',
  tradingRole
})

export const fakeLetterOfCreditEnriched = ({
  _id = '08e9f8',
  transactionHash = '0x001',
  reference = 'LC18-MER-1',
  companyStaticId = APPLICANT_ID,
  members = [],
  tasks = [],
  trades = {},
  userId = '',
  status = ILetterOfCreditStatus.REQUESTED
} = {}): ILetterOfCreditEnriched => {
  const letter = fakeLetterOfCredit({ _id, transactionHash, reference, status })
  const role = findRole(letter, companyStaticId)
  return {
    ...letter,
    role,
    ...findParticipantCommonNames(letter, members),
    ...findLatestShipment(letter),
    actionStatus: findTaskStatusByLetterOfCreditId(tasks, letter._id),
    tasks: findTasksByLetterOfCreditId(tasks, letter._id)
  }
}

export const fakeLetterOfCreditWithLegacyVaktIdOnly = (args: any) => {
  const withVaktIdOnly = fakeLetterOfCreditWithLegacyVaktId(args)
  delete withVaktIdOnly.tradeAndCargoSnapshot.trade.sourceId
  delete withVaktIdOnly.tradeAndCargoSnapshot.cargo.sourceId

  return withVaktIdOnly
}

export const fakeLetterOfCreditWithLegacyVaktId = ({ vaktId = '1234', sourceId, ...args }) => {
  const withVaktId = fakeLetterOfCredit(args) as any
  withVaktId.tradeAndCargoSnapshot.trade.vaktId = vaktId
  withVaktId.tradeAndCargoSnapshot.cargo.vaktId = vaktId
  withVaktId.tradeAndCargoSnapshot.trade.source = TradeSource.Vakt
  if (sourceId) {
    withVaktId.tradeAndCargoSnapshot.trade.sourceId = sourceId
    withVaktId.tradeAndCargoSnapshot.cargo.sourceId = sourceId
  }
  return withVaktId
}

export const fakeTask = ({
  summary = 'fake task',
  status = TaskStatus.ToDo,
  type = LetterOfCreditTaskType.REVIEW_APPLICATION,
  actions = [] as string[],
  context = {},
  assignee = ''
} = {}): Task => {
  return {
    _id: '123',
    summary,
    taskType: type,
    status,
    counterpartyName: '(counterpartyName) remove it',
    assignee, // user ID from Keycloak or null if unassigned
    actions: mapActionsToTaskType(type),
    requiredPermission: {
      productId: 'tradeFinance',
      actionId: 'read'
    },
    context,
    outcome: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const fakeCargo = ({
  cargoId = '100',
  source = TradeSource.Vakt,
  sourceId = 'vakt123',
  grade = Grade.Brent as string,
  parcels = [],
  status = 'ok'
} = {}): ICargo => ({
  _id: '123',
  sourceId,
  source,
  grade,
  cargoId,
  parcels,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status
})

export const fakeTradeAndCargoSnapshot = ({
  source = 'VAKT',
  sourceId = 'EV111',
  trade = fakeTrade(),
  cargo = buildFakeCargo()
} = {}): ITradeAndCargoSnapshot => ({
  source,
  sourceId,
  trade,
  cargo
})

export const mapOfFakeCargo = immutable.Map<string, ICargo>({
  cargo1: buildFakeCargo,
  cargo2: buildFakeCargo
})

export const mockDate = () => {
  const RealDate = Date
  const _GLOBAL: any = global // we love typescript!

  return {
    freeze: (isoDate: string | number | Date) => {
      _GLOBAL.Date = class extends RealDate {
        constructor(...args: any) {
          super()
          return new RealDate(isoDate)
        }
      }
    },
    restore: () => {
      global.Date = RealDate
    }
  }
}

export const allLCStatusFetched = (): IStateTransition[] => {
  return [
    {
      fromState: '',
      toState: ILetterOfCreditStatus.REQUESTED,
      performer: 'Mer',
      date: '1-11-2018'
    },
    {
      fromState: ILetterOfCreditStatus.REQUESTED,
      toState: ILetterOfCreditStatus.REQUEST_REJECTED,
      performer: 'SC',
      date: '1-11-2018'
    }
  ]
}

export const fakeParcel = ({ _id = '123', id = '1234', timestamp = '2019-01-03T13:14:28.025Z' } = {}) => ({
  _id,
  id,
  laycanPeriod: {
    startDate: timestamp,
    endDate: timestamp
  },
  modeOfTransport: ModeOfTransport.Vessel,
  vesselIMO: 1,
  vesselName: 'Test',
  loadingPort: 'Test',
  dischargeArea: 'Test',
  inspector: 'Test',
  deemedBLDate: timestamp,
  quantity: 1
})

export const fakePresentation = ({
  staticId = '123',
  LCReference = '2018-BP-16',
  applicantId = 'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85',
  beneficiaryId = BENEFICIARY_ID,
  documents = [],
  reference = '123',
  status = LCPresentationStatus.Draft
} = {}): ILCPresentation => ({
  staticId,
  reference,
  LCReference,
  applicantId,
  beneficiaryId,
  issuingBankId: 'a28b8dc3-8de9-4559-8ca1-272ccef52b47',
  nominatedBankId: 'a28b8dc3-8de9-4559-8ca1-272ccef52b48',
  status,
  stateHistory: [
    {
      toState: 'DRAFT',
      performer: BENEFICIARY_ID,
      date: '2019-02-19T08:22:47.686Z'
    }
  ],
  documents:
    documents.length === 0
      ? [
          {
            documentId: 'bddd54e3-4369-4627-9a9c-4f0ed186eab4',
            documentHash: 'tradedasdsadaFinance',
            status: 'DRAFT',
            documentTypeId: 'tradeFinance',
            dateProvided: SOME_DATE
          }
        ]
      : documents,
  beneficiaryComments: '',
  nominatedBankComments: '',
  issuingBankComments: ''
})

export const fakeDocument = ({
  context = {
    productId: 'tradeFinance',
    subProductId: 'lc',
    lcPresentationStaticId: '5c5441638d960da68ca87b81'
  },
  id = '1',
  name = 'AML Letter - test'
} = {}): Document => {
  const mockProduct: Product = { name: 'TRADE FINANCE', id: 'tradeFinance' }
  const mockCategory = { id: 'banking-documents', name: 'banking-documents', product: mockProduct }
  const mockType = {
    id: '2',
    name: 'type-name',
    product: mockProduct,
    category: mockCategory,
    fields: [],
    predefined: true
  }
  const COMPANY_ID = 'societegenerale'
  return {
    id,
    documentId: 'document-id',
    name,
    product: mockProduct,
    category: mockCategory,
    type: mockType,
    owner: { firstName: 'Owner', lastName: 'Owner', companyId: 'company-id' },
    hash: 'hash',
    receivedDate: new Date(SOME_DATE),
    registrationDate: new Date(SOME_DATE),
    metadata: [],
    content: undefined,
    sharedWith: [{ counterpartyId: COMPANY_ID, sharedDates: [new Date(SOME_DATE)] }],
    sharedBy: '',
    context,
    state: BottomSheetStatus.REGISTERED
  }
}

export const fakeLetterOfCreditDiff = ({
  value = 'SPLIT' as any,
  oldValue = 'OTHER' as any,
  path = '/feesPayableBy',
  op = 'replace' as any,
  type = 'ILC'
} = {}): IDiff => ({ value, oldValue, path, op, type })

export const fakeTimer = ({ time = '2019-03-30T11:10:32.523Z' } = {}): ITimer => ({
  submissionDateTime: '2019-03-20T11:10:32.523Z',
  timerData: [
    {
      id: '123',
      timerId: '123',
      time,
      status: '',
      retry: 1
    }
  ]
})
