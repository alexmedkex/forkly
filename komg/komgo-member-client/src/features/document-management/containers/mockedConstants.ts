import { Dropdown } from 'semantic-ui-react'
import { Category, Document, DocumentType, Product } from '../store/types'
import { fakeDocument } from '../utils/faker'
const recentRandomDate = (minutesAgo: number): Date => {
  const now = new Date().getTime()
  return new Date(now - minutesAgo)
}
const MOCK_PRODUCT: Product = { name: 'KYC', id: 'kyc' }
const MOCK_COMPANY_ID = 'company-id'

const CAT_BANKING: Category = {
  name: 'banking-documents',
  id: 'banking-documents',
  product: MOCK_PRODUCT
}
const CAT_BUSINESS: Category = { name: 'business-name', id: 'business-id', product: MOCK_PRODUCT }

const cp1 = {
  id: 'societegenerale',
  name: 'Societe Generale'
}

const cp2 = {
  id: 'bnpparibas',
  name: 'BNP Paribas'
}

const cp3 = {
  id: 'abnamro',
  name: 'ABN AMRO'
}

const cp4 = {
  id: 'citibank',
  name: 'Citibank'
}

const cp5 = {
  id: 'ing',
  name: 'ING'
}

export const mockCounterparties = [cp1, cp2, cp3, cp4, cp5]

const anonDocumentType1: DocumentType = {
  product: MOCK_PRODUCT,
  category: { name: 'business-description', id: 'business-description', product: MOCK_PRODUCT },
  name: 'Identity Documents',
  id: '1',
  fields: [],
  predefined: false
}

const anonDocumentType2: DocumentType = {
  product: MOCK_PRODUCT,
  category: { name: 'management-documents', id: 'management-documents', product: MOCK_PRODUCT },
  name: 'Management Documents',
  id: '2',
  fields: [],
  predefined: false
}

const anonDocumentType3: DocumentType = {
  product: MOCK_PRODUCT,
  category: { name: 'compliance', id: 'compliance', product: MOCK_PRODUCT },
  name: 'Compliance',
  id: '3',
  fields: [],
  predefined: false
}
const anonDocument1: Document = fakeDocument({
  id: '1',
  documentId: 'document-id',
  name: 'AML Letter - test',
  product: MOCK_PRODUCT,
  category: CAT_BANKING,
  type: anonDocumentType1,
  owner: {
    firstName: 'Owner',
    lastName: 'Owner',
    companyId: 'company-id'
  },
  hash: 'hash',
  registrationDate: recentRandomDate(Math.random() * 1000 * 3600),
  metadata: [],
  content: undefined,
  sharedWith: [{ counterpartyId: 'societegenerale', sharedDates: [] }],
  sharedBy: ''
})

const anonDocument2: Document = fakeDocument({
  id: '2',
  documentId: 'document-id-2',
  name: 'Bank Lines - test',
  product: MOCK_PRODUCT,
  category: CAT_BUSINESS,
  type: anonDocumentType2,
  owner: {
    firstName: 'Owner',
    lastName: 'Owner',
    companyId: MOCK_COMPANY_ID
  },
  hash: 'hash',
  registrationDate: recentRandomDate(Math.random() * 1000 * 3600),
  metadata: [],
  content: undefined,
  sharedWith: [
    { counterpartyId: 'societegenerale', sharedDates: [] },
    { counterpartyId: 'bnpparibas', sharedDates: [] }
  ],
  sharedBy: ''
})

const anonDocument3: Document = fakeDocument({
  id: '3',
  documentId: 'document-id-3',
  name: 'Board Resolution - test',
  product: MOCK_PRODUCT,
  category: CAT_BANKING,
  type: anonDocumentType3,
  owner: {
    firstName: 'Owner',
    lastName: 'Owner',
    companyId: MOCK_COMPANY_ID
  },
  hash: 'hash',
  registrationDate: recentRandomDate(Math.random() * 1000 * 3600),
  metadata: [],
  content: undefined,
  sharedWith: [],
  sharedBy: ''
})

export const mockDocs: Document[] = [anonDocument1, anonDocument2, anonDocument3]

const ALL_DOCUMENTS_TEXT = 'All Documents'
const SHARED_WITH_TEXT = 'Shared with:'
const CITIBANK_TEXT = 'Citibank'
const BNP_PARIBAS_TEXT = 'BNP Paribas'
const MERCURIA_TEXT = 'Mercuria'

// Placeholder to figure out what will happen with various view library options (i.e. Views by Couterparty etc.)
export const viewLibraryOptions = [
  {
    key: 'all documents',
    text: ALL_DOCUMENTS_TEXT,
    value: ALL_DOCUMENTS_TEXT,
    content: ALL_DOCUMENTS_TEXT
  },
  {
    as: Dropdown.Divider,
    key: SHARED_WITH_TEXT,
    text: SHARED_WITH_TEXT,
    content: SHARED_WITH_TEXT,
    value: SHARED_WITH_TEXT
  },
  {
    key: 'citibank',
    text: CITIBANK_TEXT,
    value: CITIBANK_TEXT,
    content: CITIBANK_TEXT
  },
  {
    key: 'bnp paribas',
    text: BNP_PARIBAS_TEXT,
    value: BNP_PARIBAS_TEXT,
    content: BNP_PARIBAS_TEXT
  },
  {
    key: 'mercuria',
    text: MERCURIA_TEXT,
    value: MERCURIA_TEXT,
    content: MERCURIA_TEXT
  }
]
