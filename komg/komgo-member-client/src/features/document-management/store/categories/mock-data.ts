import { Category } from '../types'
import { mockProduct } from '../products/mock-data'

export const mockCategories: Category[] = [
  {
    id: 'company-details',
    product: mockProduct,
    name: 'Company Details'
  },
  {
    id: 'management-and-directors',
    product: mockProduct,
    name: 'Management and directors'
  },
  {
    id: 'shareholders',
    product: mockProduct,
    name: 'Shareholders - Ultimate Beneficiary Owners (UBOs)'
  },
  {
    id: 'business-description',
    product: mockProduct,
    name: 'Business description'
  },
  {
    id: 'regulation-and-compliance',
    product: mockProduct,
    name: 'Regulation/Compliance'
  },
  {
    id: 'banking-documents',
    product: mockProduct,
    name: 'Banking documents'
  },
  {
    id: 'miscellaneous',
    product: mockProduct,
    name: 'Miscellaneous'
  }
]
