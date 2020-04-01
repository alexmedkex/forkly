import {
  IDocumentRegisterResponse,
  IProductResponse,
  ICategoryResponse,
  ITypeResponse,
  IOwnerResponse,
  KeyValueResponse,
  IContentResponse,
  IFieldResponse,
  FieldType
} from './documents/IDocumentRegisterResponse'
import IUser from './IUser'
import { IReceivedDocumentsResponse, IDocumentReviewResponse, DOCUMENT_STATUS } from './documents/IReceivedDocuments'
import { ISharedDocumentsResponse, IDocumentFedbackResponse } from './documents/ISharedDocumentsResponse'

export const PRODUCT_ID = 'product-id'
export const SUBPRODUCT_ID = 'subproduct-id'
export const CATEGORY_ID = 'category-id'
export const TYPE_ID = 'type-id'

export const DOCUMENT_ID = 'document-id'
export const FILE_ID = 'file-id'
export const RECEIVED_DOCUMENT_ID = 'received-document-id'

export const COMPANY_ID = 'company-id'
export const DOCUMENT_NAME = 'document-name'
export const EXPECTED_DATE = new Date(2018, 1, 1)
export const MERKLE_HASH = 'merkle-hash'

export function documentResponse(): IDocumentRegisterResponse {
  return {
    id: DOCUMENT_ID,
    context: {
      subProductId: SUBPRODUCT_ID
    },
    name: DOCUMENT_NAME,
    product: product(),
    category: category(),
    type: type(),
    owner: owner(),
    metadata: metadata(),
    hash: MERKLE_HASH,
    registrationDate: EXPECTED_DATE,
    content: content(),
    sharedWith: [],
    sharedBy: COMPANY_ID
  }
}

function product(): IProductResponse {
  return {
    id: PRODUCT_ID,
    name: 'KYC'
  }
}

function category(): ICategoryResponse {
  return {
    id: CATEGORY_ID,
    product: product(),
    name: 'category-name'
  }
}

function type(): ITypeResponse {
  return {
    id: TYPE_ID,
    product: product(),
    category: category(),
    name: 'type-name',
    fields: [field()],
    predefined: true
  }
}

function field(): IFieldResponse {
  return {
    id: 'field-id',
    name: 'field-name',
    type: FieldType.STRING,
    isArray: false
  }
}

function owner(): IOwnerResponse {
  return {
    firstName: 'first-name',
    lastName: 'last-name',
    companyId: COMPANY_ID
  }
}

function metadata(): KeyValueResponse[] {
  return [
    {
      name: 'key',
      value: 'value'
    }
  ]
}

function content(): IContentResponse {
  return {
    fileId: FILE_ID,
    signature: 'signature'
  }
}

export function user(): IUser {
  return {
    id: '1',
    firstName: 'Super',
    lastName: 'User',
    email: 'super@komgo.io'
  }
}

export function documentReceivedResponse(): IReceivedDocumentsResponse {
  return {
    id: RECEIVED_DOCUMENT_ID,
    context: {
      subProductId: SUBPRODUCT_ID
    },
    product: product(),
    companyId: COMPANY_ID,
    request: null,
    documents: [documentReviewResponse()],
    feedbackSent: false
  }
}

export function sharedDocumentsResponse(): ISharedDocumentsResponse {
  return {
    id: RECEIVED_DOCUMENT_ID,
    context: {
      subProductId: SUBPRODUCT_ID
    },
    product: product(),
    companyId: COMPANY_ID,
    documents: [documentFeedbackResponse()],
    feedbackReceived: true
  }
}

export function documentReviewResponse(): IDocumentReviewResponse {
  return {
    document: documentResponse(),
    status: DOCUMENT_STATUS.Accepted,
    note: 'test-note'
  }
}

export function documentFeedbackResponse(): IDocumentFedbackResponse {
  return {
    document: documentResponse(),
    status: DOCUMENT_STATUS.Accepted,
    note: 'test-note'
  }
}
