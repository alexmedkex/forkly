import { DocumentType, Field } from '../types'
import { mockProduct } from '../products/mock-data'
import { mockCategories } from '../categories/mock-data'

const defaultFields: Field[] = [
  {
    id: 'createdBy',
    name: 'createdBy',
    type: 'string',
    isArray: false
  },
  {
    id: 'createdOn',
    name: 'createdOn',
    type: 'date',
    isArray: false
  },
  {
    id: 'value',
    name: 'value',
    type: 'string',
    isArray: false
  },
  {
    id: 'expiresOn',
    name: 'expiry-date',
    type: 'date',
    isArray: false
  }
]

const anonDocumentType1: DocumentType = {
  product: mockProduct,
  category: mockCategories[0],
  name: 'Certificate of Incorporation',
  id: 'certificate-of-incorporation',
  fields: defaultFields,
  predefined: false
}

const anonDocumentType2: DocumentType = {
  product: mockProduct,
  category: mockCategories[1],
  name: 'List of Directors',
  id: 'list-of-directors',
  fields: defaultFields,
  predefined: false
}

const anonDocumentType3: DocumentType = {
  product: mockProduct,
  category: mockCategories[2],
  name: 'Passports of UBOs',
  id: 'passports-of-ubos',
  fields: defaultFields,
  predefined: false
}

export const mockDocumentTypes: DocumentType[] = [anonDocumentType1, anonDocumentType2, anonDocumentType3]
