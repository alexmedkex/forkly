import { Document } from '../store/types'
import { mockProduct } from '../store/products/mock-data'
import { mockCategories } from '../store/categories/mock-data'
import { mockDocumentTypes } from '../store/document-types/mock-data'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'
import { DropdownOption } from '../components/documents/my-documents/DocumentListDropdownOptions'

export const MOCK_COMPANY_ID = 'company-id'

export const anonDocument: Document = {
  id: '-1',
  documentId: 'anonDocumentId',
  name: 'anon document',
  product: mockProduct,
  category: mockCategories[2],
  type: mockDocumentTypes[2],
  owner: {
    firstName: 'Owner',
    lastName: 'Owner',
    companyId: MOCK_COMPANY_ID
  },
  hash: 'hash',
  receivedDate: new Date('2000-12-31'),
  registrationDate: new Date('2000-12-31'),
  metadata: [],
  content: undefined,
  sharedWith: [],
  sharedBy: '',
  state: BottomSheetStatus.PENDING
}

export const fakeDocument = (partialDocument?: Partial<Document>): Document => {
  const partial = partialDocument || {}
  return { ...anonDocument, ...partial }
}

const defaultDropdownOption: DropdownOption = {
  key: 'anon',
  text: '',
  value: 'anon',
  content: 'Anon',
  onClick: () => void 0
}

export const fakeDropdownOption = (partial: Partial<DropdownOption>): DropdownOption => {
  return { ...defaultDropdownOption, ...partial }
}
