import { mockCategories } from '../../../document-management/store/categories/mock-data'
import { mockProduct } from '../../../document-management/store/products/mock-data'
import { DocumentType } from '../../../document-management/store/types/document-type'

const fakeCommercialContractDocumentType: DocumentType = {
  product: mockProduct,
  category: mockCategories[0],
  name: 'Commercial Contract',
  id: 'commercialContract',
  fields: [],
  predefined: false
}

export const fakeCommercialContractDocumentTypes: DocumentType[] = [fakeCommercialContractDocumentType]

export const fakeCommercialContractDocumentWithoutExtension = {
  _id: 'document0',
  file: {
    size: 5000
  },
  name: 'documentName',
  fileName: 'documentFileName',
  typeId: 'commercialContract',
  fileType: 'application/something',
  type: {
    id: 'commercialContract'
  }
}

export const fakeCommercialContractDocumentWithExtension = {
  _id: 'document1',
  file: {
    size: 5000
  },
  name: 'documentName1',
  fileName: 'documentFileName1.pdf',
  typeId: 'commercialContract',
  fileType: 'application/pdf',
  type: {
    id: 'commercialContract'
  }
}
