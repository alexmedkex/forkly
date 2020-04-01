import { Request, Product } from '../types'

const anonProduct: Product = { id: 'kyc', name: 'KYC' }
const mock1: Request = {
  product: anonProduct,
  id: 'mock1',
  name: 'EU Clients',
  types: [],
  companyId: '-1',
  sentDocuments: [],
  documents: [],
  notes: []
}

const mock2: Request = {
  product: anonProduct,
  id: 'mock2',
  name: 'Swiss Clients',
  types: [],
  companyId: '-1',
  sentDocuments: [],
  documents: [],
  notes: []
}

const mock3: Request = {
  product: anonProduct,
  id: 'mock3',
  name: 'Non-EU Clients',
  types: [],
  companyId: '-1',
  sentDocuments: [],
  documents: [],
  notes: []
}

export const mockRequest: Request[] = [mock1, mock2, mock3]
