import { Document } from '../types'
import { mockProduct } from '../products/mock-data'
import { mockCategories } from '../categories/mock-data'
import { mockDocumentTypes } from '../document-types/mock-data'
import { fakeDocument } from '../../utils/faker'

const recentRandomDate = (minutesAgo: number): Date => {
  const now = new Date().getTime()
  return new Date(now - minutesAgo)
}

const mockedDate = new Date('December 17, 1995 03:24:00')

const MOCK_COMPANY_ID = 'company-id'

const anonDocument1: Document = fakeDocument({
  id: '1',
  documentId: 'document-id',
  name: 'AML Letter - test',
  product: mockProduct,
  category: mockCategories[0],
  type: mockDocumentTypes[0],
  owner: {
    firstName: 'Owner',
    lastName: 'Owner',
    companyId: MOCK_COMPANY_ID
  },
  hash: 'hash',
  registrationDate: recentRandomDate(Math.random() * 1000 * 3600),
  metadata: [],
  content: undefined,
  sharedWith: [{ counterpartyId: 'societegenerale', sharedDates: [mockedDate] }],
  sharedBy: ''
})

const anonDocument2: Document = fakeDocument({
  id: '2',
  documentId: 'document-id-2',
  name: 'Bank Lines - test',
  product: mockProduct,
  category: mockCategories[1],
  type: mockDocumentTypes[1],
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
    { counterpartyId: 'societegenerale', sharedDates: [recentRandomDate(Math.random() * 1000 * 3600)] },
    { counterpartyId: 'bnpparibas', sharedDates: [recentRandomDate(Math.random() * 1000 * 3600)] }
  ],
  sharedBy: ''
})

const anonDocument3: Document = fakeDocument({
  id: '3',
  documentId: 'document-id-3',
  name: 'Board Resolution - test',
  product: mockProduct,
  category: mockCategories[2],
  type: mockDocumentTypes[2],
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

export const anonDocument4: Document = fakeDocument({
  id: '3',
  documentId: 'document-id-4',
  name: 'Board Resolution - test.pdf',
  product: mockProduct,
  category: mockCategories[2],
  type: mockDocumentTypes[2],
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

export const mockDocuments: Document[] = [anonDocument1, anonDocument2, anonDocument3]
