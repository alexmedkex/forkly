// TODO: Provide a correct list of predefined templates
import { Template, DocumentType } from '../../../document-management/store/types'
import { mockProduct } from '../products/mock-data'
import { mockCategories } from '../categories/mock-data'

const createdBy = 'createdBy'
const createdOn = 'createdOn'

const passport = 'passport'
const license = 'license'

const expiryDate = 'expiry-date'
const expiresOn = 'expiresOn'

const value = 'value'
const str = 'string'
const date = 'date'

const test = 'test'

const passportType: DocumentType = {
  id: '1',
  fields: [
    { id: createdBy, name: createdBy, type: str, isArray: false },
    { id: createdOn, name: createdOn, type: date, isArray: false },
    { id: value, name: value, type: str, isArray: false },
    { id: expiresOn, name: expiryDate, type: date, isArray: false }
  ],
  name: passport,
  predefined: true,
  product: mockProduct,
  category: mockCategories[0]
}
const licenseType: DocumentType = {
  id: '2',
  fields: [
    { id: createdBy, name: createdBy, type: str, isArray: false },
    { id: createdOn, name: createdOn, type: date, isArray: false },
    { id: value, name: value, type: str, isArray: false },
    { id: expiresOn, name: expiryDate, type: date, isArray: false }
  ],
  name: license,
  predefined: true,
  product: mockProduct,
  category: mockCategories[6]
}

const bankStatement: DocumentType = {
  id: '1125234',
  fields: [
    { id: createdBy, name: createdBy, type: str, isArray: false },
    { id: createdOn, name: createdOn, type: date, isArray: false },
    { id: value, name: value, type: str, isArray: false },
    { id: expiresOn, name: expiryDate, type: date, isArray: false }
  ],
  name: 'bank statement',
  predefined: true,
  product: mockProduct,
  category: mockCategories[5]
}

const bankStatementType: DocumentType = {
  id: '1125234',
  fields: [
    { id: createdBy, name: createdBy, type: str, isArray: false },
    { id: createdOn, name: createdOn, type: date, isArray: false },
    { id: value, name: value, type: str, isArray: false },
    { id: expiresOn, name: expiryDate, type: date, isArray: false }
  ],
  name: 'bank statement',
  predefined: true,
  product: mockProduct,
  category: mockCategories[5]
}
export const mockData: Template[] = [
  {
    id: '123',
    product: mockProduct,
    predefined: false,
    name: 'Mock Clients',
    types: [passportType, licenseType, bankStatement],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '1',
    name: 'EU Clients',
    product: mockProduct,
    predefined: false,
    types: [passportType],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '2',
    name: 'Non-EU Clients',
    product: mockProduct,
    predefined: false,
    types: [passportType, bankStatementType, licenseType],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '3',
    name: 'Swiss Clients',
    product: mockProduct,
    predefined: false,
    types: [passportType, licenseType, bankStatement],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '4',
    product: mockProduct,
    predefined: true,
    name: 'NL Clients',
    types: [passportType, licenseType, bankStatement],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '5',
    product: mockProduct,
    predefined: true,
    name: 'ES Clients',
    types: [licenseType],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '6',
    product: mockProduct,
    predefined: true,
    name: 'EMEA Clients',
    types: [passportType, licenseType, bankStatement],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '7',
    name: 'US Clients',
    product: mockProduct,
    predefined: true,
    types: [passportType, licenseType, bankStatement],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '8',
    name: 'FR Clients',
    product: mockProduct,
    predefined: true,
    types: [passportType, licenseType, bankStatement],
    metadata: [{ name: test, value: test }]
  },
  {
    id: '9',
    name: 'IE Clients',
    product: mockProduct,
    predefined: true,
    types: [passportType, licenseType, bankStatement],
    metadata: []
  }
]
