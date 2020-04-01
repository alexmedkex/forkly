import { FEEDBACK_STATUS } from '../../business-layer/messaging/enums'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { IFullCategory } from '../../data-layer/models/category'
import { IOwner } from '../../data-layer/models/document'
import { IIncomingRequest } from '../../data-layer/models/incoming-request'
import { IFullOutgoingRequest } from '../../data-layer/models/outgoing-request'
import { IProduct } from '../../data-layer/models/product'
import { RECEIVED_DATE, DOCUMENT_ID2 } from '../../data-layer/models/test-entities'
import { IFullType, ITypeField } from '../../data-layer/models/type'
import { FieldType } from '../../FieldTypes'
import { Note } from '../../service-layer/request/outgoing-request/Note'
import { UpdateDocumentRequest } from '../request/document'
import { KeyValueRequest } from '../request/KeyValueRequest'
import { DocumentReviewUpdate, DocumentsReviewUpdate } from '../request/received-documents'
import { IContentResponse, IDocumentResponse } from '../responses/document'
import { IFullDocumentResponse } from '../responses/document/IFullDocumentResponse'
import { IFullIncomingRequestResponse } from '../responses/incoming-request/IFullIncomingRequestResponse'
import { IFullReceivedDocumentsResponse, IReceivedDocumentsAggregationResponse } from '../responses/received-documents'
import { IFullSharedDocumentsResponse } from '../responses/shared-documents'

export const PRODUCT_ID = 'product-id'
export const SUBPRODUCT_ID = 'subproduct-id'
export const CATEGORY_ID = 'category-id'
export const TYPE_ID = 'type-id'
export const TEMPLATE_ID = 'template-id'
export const REQUEST_ID = 'request-id'
export const DOCUMENT_ID = 'document-id'
export const DOCUMENT_NAME = 'document-name'

export const FILE_ID = 'file-id'
export const INCOMING_REQUEST_ID = 'incoming-request-id'
export const RECEIVED_DOCUMENTS_ID = 'received-documents-id'
export const SHARED_DOCUMENTS_ID = 'shared-documents-id'
export const MERKLE_HASH = 'merkle-hash'
export const CONTENT_HASH = 'content-hash'
export const EXPECTED_DATE = new Date(2018, 1, 1)

export const COMPANY_ID = 'company-id'

export const VAKT_ID = 'vakt-id'

export const COMMENT = 'string'

export const NOTE_FROM_CONTROLLER: Note = {
  date: new Date(0),
  sender: 'this-will-be-replaced-by-company-id',
  content: 'This is a note'
}

export function incomingRequest(): IIncomingRequest {
  return {
    id: INCOMING_REQUEST_ID,
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    types: [TYPE_ID],
    documents: [DOCUMENT_ID],
    sentDocumentTypes: [],
    sentDocuments: []
  }
}

function product(): IProduct {
  return {
    id: PRODUCT_ID,
    name: 'KYC'
  }
}
function category(): IFullCategory {
  return {
    id: CATEGORY_ID,
    product: product(),
    name: 'category-name'
  }
}

function field(): ITypeField {
  return {
    id: 'field-id',
    name: 'field-name',
    type: FieldType.STRING,
    isArray: false
  }
}

function fullType(): IFullType {
  return {
    id: TYPE_ID,
    product: {
      id: PRODUCT_ID,
      name: 'KYC'
    },
    category: category(),
    name: 'type-name',
    fields: [field()],
    vaktId: VAKT_ID,
    predefined: false
  }
}

export function documentResponse(): IDocumentResponse {
  return {
    id: DOCUMENT_ID,
    context: context(),
    productId: PRODUCT_ID,
    name: DOCUMENT_NAME,
    categoryId: CATEGORY_ID,
    typeId: TYPE_ID,
    owner: owner(),
    metadata: metadata(),
    content: fileContent(),
    hash: MERKLE_HASH,
    contentHash: CONTENT_HASH,
    komgoStamp: false,
    registrationDate: EXPECTED_DATE,
    sharedWith: [],
    sharedBy: COMPANY_ID,
    state: DocumentState.Pending,
    comment: COMMENT
  }
}

function context() {
  return {
    subProductId: SUBPRODUCT_ID
  }
}

export function owner(): IOwner {
  return {
    firstName: 'first-name',
    lastName: 'last-name',
    companyId: COMPANY_ID
  }
}

function metadata(): KeyValueRequest[] {
  return [
    {
      name: 'key',
      value: 'value'
    }
  ]
}

export function fileContent(): IContentResponse {
  return {
    signature: 'signature',
    size: 0
  }
}

export function fullDocumentResponse(): IFullDocumentResponse {
  return {
    id: DOCUMENT_ID,
    context: context(),
    name: DOCUMENT_NAME,
    product: product(),
    category: category(),
    type: fullType(),
    owner: owner(),
    metadata: metadata(),
    content: fileContent(),
    hash: MERKLE_HASH,
    contentHash: CONTENT_HASH,
    komgoStamp: false,
    registrationDate: EXPECTED_DATE,
    receivedDate: RECEIVED_DATE,
    sharedWith: [],
    sharedBy: COMPANY_ID,
    state: DocumentState.Pending,
    comment: COMMENT
  }
}

export function fullIncomingRequest(): IFullIncomingRequestResponse {
  return {
    id: INCOMING_REQUEST_ID,
    product: {
      id: PRODUCT_ID,
      name: 'KYC'
    },
    companyId: COMPANY_ID,
    types: [fullType()],
    documents: [fullDocumentResponse()],
    sentDocumentTypes: [],
    sentDocuments: []
  }
}

export function fullOutgoingRequest(): IFullOutgoingRequest {
  return {
    id: REQUEST_ID,
    product: product(),
    companyId: COMPANY_ID,
    types: [fullType()],
    createdAt: new Date(2019, 1, 1)
  }
}

export function fullReceivedDocuments(): IFullReceivedDocumentsResponse {
  return {
    id: RECEIVED_DOCUMENTS_ID,
    context: context(),
    product: product(),
    companyId: COMPANY_ID,
    request: fullOutgoingRequest(),
    documents: [
      {
        document: fullDocumentResponse(),
        status: FEEDBACK_STATUS.Rejected,
        note: '',
        reviewerId: ''
      }
    ],
    feedbackSent: false
  }
}

export function receivedDocumentsAggregation(): IReceivedDocumentsAggregationResponse {
  return {
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    requestId: REQUEST_ID,
    documents: [
      {
        documentId: DOCUMENT_ID,
        status: FEEDBACK_STATUS.Pending,
        note: '',
        reviewerId: ''
      },
      {
        documentId: DOCUMENT_ID2,
        status: FEEDBACK_STATUS.Rejected,
        note: '',
        reviewerId: ''
      }
    ]
  }
}

export function documentReviewUpdate(): DocumentReviewUpdate {
  return {
    documentId: 'document-id',
    status: FEEDBACK_STATUS.Rejected,
    note: ''
  }
}

export function documentsReviewUpdate(): DocumentsReviewUpdate {
  return { documents: [documentReviewUpdate()] }
}

export function fullReceivedDocumentsResponse(): IFullReceivedDocumentsResponse {
  return {
    id: RECEIVED_DOCUMENTS_ID,
    context: { subProductId: SUBPRODUCT_ID },
    product: product(),
    companyId: COMPANY_ID,
    request: {
      id: REQUEST_ID,
      product: product(),
      companyId: 'company-id',
      types: [fullType()],
      createdAt: new Date(2019, 1, 1)
    },
    documents: [{ document: fullDocumentResponse(), status: FEEDBACK_STATUS.Rejected, note: '', reviewerId: '' }],
    feedbackSent: false
  }
}

export function documentRequest(): UpdateDocumentRequest {
  return {
    id: DOCUMENT_ID,
    context: {
      subProductId: SUBPRODUCT_ID
    },
    productId: PRODUCT_ID,
    categoryId: CATEGORY_ID,
    typeId: TYPE_ID,
    name: DOCUMENT_NAME,
    registrationDate: EXPECTED_DATE,
    metadata: [
      {
        name: 'key',
        value: 'value'
      }
    ],
    owner: owner(),
    sharedWith: [],
    state: DocumentState.Pending
  }
}

export function fullSharedDocumentsResponse(): IFullSharedDocumentsResponse {
  return {
    id: SHARED_DOCUMENTS_ID,
    context: { subProductId: SUBPRODUCT_ID },
    product: product(),
    companyId: COMPANY_ID,
    documents: [{ document: fullDocumentResponse(), status: FEEDBACK_STATUS.Rejected, note: '', reviewerId: '' }],
    feedbackReceived: false
  }
}
