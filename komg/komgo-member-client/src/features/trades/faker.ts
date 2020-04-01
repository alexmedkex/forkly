import { Document, Product } from '../document-management'
import { Products } from '../document-management/constants/Products'
import { fakeDocument } from '../document-management/utils/faker'

export const fakeUploadedDocument = ({ id = '1', name = 'documentName', typeName = 'commercialContract' } = {}) => {
  const mockProduct: Product = { name: 'TRADE FINANCE', id: Products.TradeFinance }
  const mockCategory = { id: 'commercial-contract', name: 'commercial-contract', product: mockProduct }
  const mockType = {
    id: '2',
    name: typeName,
    product: mockProduct,
    category: mockCategory,
    fields: [],
    predefined: true
  }
  const COMPANY_ID = 'societegenerale'
  const doc: Document = fakeDocument({
    id,
    documentId: 'document-id',
    name,
    product: mockProduct,
    category: mockCategory,
    type: mockType,
    owner: { firstName: 'Owner', lastName: 'Owner', companyId: 'company-id' },
    hash: 'hash',
    registrationDate: new Date('2019-02-04T14:47:26.988Z'),
    metadata: [],
    content: undefined,
    sharedWith: [{ counterpartyId: COMPANY_ID, sharedDates: [new Date('2019-02-04T14:47:26.988Z')] }],
    sharedBy: ''
  })
  return doc
}
