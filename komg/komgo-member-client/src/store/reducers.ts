import { reducer as form } from 'redux-form/immutable'
import { combineReducers } from 'redux-immutable'

import { ImmutableMap } from '../utils/types'
import { NotificationState } from '../features/notifications/store/types'
import NotificationReducer from '../features/notifications/store/reducer'

import RoleManagementReducer from '../features/role-management/store/reducer'
import { RoleManagementState } from '../features/role-management/store/types'

import TaskManagementReducer from '../features/tasks/store/reducer'
import { TaskManagementState } from '../features/tasks/store/types'

import ReviewDocumentsReducer from '../features/review-documents/store/reducer'
import { ReviewDocumentsState } from '../features/review-documents/store/types'

import { ErrorReportReducer } from '../features/error-report/store'
import { ErrorReportState } from '../features/error-report/store/types'

import {
  TemplatesReducer,
  TemplateState,
  CategoriesReducer,
  CategoryState,
  DocumentTypesReducer,
  DocumentTypeState,
  ProductsReducer,
  ProductState,
  RequestsReducer,
  RequestState,
  DocumentsReducer,
  DocumentsState,
  DocumentState,
  ModalsState,
  ModalsReducer
} from '../features/document-management/store'

import UiReducer from './common/reducer'
import { ErrorsState, LoaderState, UIState } from './common/types'

import { loaderReducer } from './common/loader'

import { errorReducer } from './common/reducers/errors'

import { UserState } from '../fixtures/user/types'
import UserReducer from '../fixtures/user/reducer'

import TradesReducer from '../features/trades/store/reducer'
import { TradeState } from '../features/trades/store/types'

import CounterpartyReducer from '../features/counterparties/store/reducer'
import { CounterpartiesState } from '../features/counterparties/store/types'

import MemberReducer from '../features/members/store/reducer'
import { MemberState } from '../features/members/store/types'

import LettersOfCreditReducer from '../features/letter-of-credit-legacy/store/reducer'
import { LetterOfCreditState } from '../features/letter-of-credit-legacy/store/types'
import { DocumentReducer } from '../features/document-management/store/document'
import { LCPresentationReducer } from '../features/letter-of-credit-legacy/store/presentation'
import { LCPresentationState } from '../features/letter-of-credit-legacy/store/presentation/types'
import LetterOfCreditAmendmentReducer from '../features/letter-of-credit-legacy/store/amendments/reducer'
import { LetterOfCreditAmendmentState } from '../features/letter-of-credit-legacy/store/amendments/types'
import { LicenseState } from '../features/licenses/store/types'
import LicenseReducer from '../features/licenses/store/reducer'
import OnboardingReducer from '../features/address-book/store/reducer'
import DocumentVerificationReducer from '../features/document-verification/store/reducer'
import DocVerificationReducer from '../features/doc-verification/store/reducer'

import ReceivableDiscountingReducer from '../features/receivable-discounting-legacy/store/reducer'
import ReceivableDiscountingApplicationReducer from '../features/receivable-discounting-legacy/store/application/reducer'

import ReceivableDiscountingQuoteReducer from '../features/receivable-discounting-legacy/store/quote/reducer'
import { ReceivableDiscountingState } from '../features/receivable-discounting-legacy/store/types'
import { DocVerificationState } from '../features/doc-verification/store/types'
import { DocumentVerificationState } from '../features/document-verification/store/types'

import { ToastState } from '../features/toasts/store/types'

import { BottomSheetState } from '../features/bottom-sheet/store/types'
import BottomSheetReducer from '../features/bottom-sheet/store/reducer'

import StandByLettersOfCreditReducer from '../features/standby-letter-of-credit-legacy/store/reducer'
import { StandbyLetterOfCreditState } from '../features/standby-letter-of-credit-legacy/store/types'

import CreditLinesReducer from '../features/credit-line/store/reducer'
import { CreditLinesState } from '../features/credit-line/store/types'

import { AddressBookState } from '../features/address-book/store/types'
import { ReceivableDiscountingApplicationState } from '../features/receivable-discounting-legacy/store/application/types'
import { QuoteState as ReceivableDiscountingQuoteState } from '../features/receivable-discounting-legacy/store/quote/types'

import DepositLoanReducer from '../features/deposit-loan/store/reducer'
import { DepositLoanState } from '../features/deposit-loan/store/types'

import EditorTemplatesReducer from '../features/templates/store/templates/reducer'
import { EditorTemplatesState } from '../features/templates/store/templates/types'

import EditorTemplateBindingsReducer from '../features/templates/store/template-bindings/reducer'
import { EditorTemplateBindingsState } from '../features/templates/store/template-bindings/types'

import TemplatedLettersOfCreditReducer from '../features/letter-of-credit/store/reducer'
import { TemplatedLetterOfCreditState } from '../features/letter-of-credit/store/types'

// The Application state object represents the global application
// state at the top level, combining state from all redux modules.

export interface ApplicationStateFields {
  uiState: UIState
  loader: LoaderState
  errors: ErrorsState
  notifications: NotificationState
  reviewDocuments: ReviewDocumentsState
  users: UserState
  templates: TemplateState
  categories: CategoryState
  documentTypes: DocumentTypeState
  roleManagement: RoleManagementState
  products: ProductState
  requests: RequestState
  document: DocumentState
  documents: DocumentsState
  modals: ModalsState
  trades: TradeState
  members: MemberState
  tasks: TaskManagementState
  counterparties: CounterpartiesState
  errorReport: ErrorReportState
  lettersOfCredit: LetterOfCreditState
  lCPresentation: LCPresentationState
  lcAmendments: LetterOfCreditAmendmentState
  receivableDiscounting: ReceivableDiscountingState
  receivableDiscountingApplication: ReceivableDiscountingApplicationState
  receivableDiscountingQuote: ReceivableDiscountingQuoteState
  licenses: LicenseState
  onboarding: AddressBookState
  documentVerification: DocumentVerificationState
  docVerification: DocVerificationState
  standByLettersOfCredit: StandbyLetterOfCreditState
  bottomSheet: BottomSheetState
  toastState: ToastState
  creditLines: CreditLinesState
  depositsAndLoans: DepositLoanState
  editorTemplates: EditorTemplatesState
  editorTemplateBindings: EditorTemplateBindingsState
  templatedLettersOfCredit: TemplatedLetterOfCreditState
}

export type ApplicationState = ImmutableMap<ApplicationStateFields>

const rootReducer = combineReducers<ApplicationState>({
  form,
  uiState: UiReducer,
  loader: loaderReducer,
  errors: errorReducer,
  reviewDocuments: ReviewDocumentsReducer,
  notifications: NotificationReducer,
  users: UserReducer,
  templates: TemplatesReducer,
  categories: CategoriesReducer,
  documentTypes: DocumentTypesReducer,
  roleManagement: RoleManagementReducer,
  products: ProductsReducer,
  requests: RequestsReducer,
  documents: DocumentsReducer,
  document: DocumentReducer,
  modals: ModalsReducer,
  trades: TradesReducer,
  members: MemberReducer,
  tasks: TaskManagementReducer,
  counterparties: CounterpartyReducer,
  lettersOfCredit: LettersOfCreditReducer,
  errorReport: ErrorReportReducer,
  lCPresentation: LCPresentationReducer,
  lcAmendments: LetterOfCreditAmendmentReducer,
  receivableDiscounting: ReceivableDiscountingReducer,
  receivableDiscountingApplication: ReceivableDiscountingApplicationReducer,
  receivableDiscountingQuote: ReceivableDiscountingQuoteReducer,
  licenses: LicenseReducer,
  onboarding: OnboardingReducer,
  documentVerification: DocumentVerificationReducer,
  docVerification: DocVerificationReducer,
  standByLettersOfCredit: StandByLettersOfCreditReducer,
  bottomSheet: BottomSheetReducer,
  creditLines: CreditLinesReducer,
  depositsAndLoans: DepositLoanReducer,
  editorTemplates: EditorTemplatesReducer,
  editorTemplateBindings: EditorTemplateBindingsReducer,
  templatedLettersOfCredit: TemplatedLettersOfCreditReducer
})

export default rootReducer
