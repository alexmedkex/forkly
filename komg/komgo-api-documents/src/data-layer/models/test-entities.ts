import { ObjectId } from 'bson'

import { FEEDBACK_STATUS } from '../../business-layer/messaging/enums'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { FieldType } from '../../FieldTypes'
import { COMMENT, VAKT_ID } from '../../service-layer/utils/test-entities'
import IFileBuffer from '../data-agents/interfaces/IFileBuffer'

import { ICategory } from './category'
import { IFullCategory } from './category/IFullCategory'
import { IContent, IDocument, IFullDocument, IOwner } from './document'
import { IDocumentTemplate } from './document-template'
import { IKeyValue } from './IKeyValue'
import { IFullIncomingRequest, IIncomingRequest } from './incoming-request'
import { IFullOutgoingRequest, IOutgoingRequest } from './outgoing-request'
import { IProduct } from './product'
import { IDocumentReview, IFullReceivedDocuments, IReceivedDocuments } from './received-documents'
import { IDocumentFeedback, IFullSharedDocuments, ISharedDocuments } from './shared-documents'
import { ITemplate } from './template'
import { IFullTemplate } from './template/IFullTemplate'
import { IFullType, IType, ITypeField } from './type'

export const PRODUCT_ID = 'product-id'
export const EXTERNALLY_SHARED_DOCUMENT_ID = 'externally-shared-document-id'
export const SESSION_ID = 'session-id'
export const SUBPRODUCT_ID = 'subproduct-id'
export const CATEGORY_ID = 'category-id'
export const TYPE_ID = 'type-id'
export const TYPE_ID1 = 'type-id-1'
export const TEMPLATE_ID = 'template-id'
export const REQUEST_ID = 'request-id'
export const DOCUMENT_ID = 'document-id'
export const DOCUMENT_ID1 = 'document-id-1'
export const DOCUMENT_ID2 = 'document-id-2'
export const DOCUMENT_TEMPLATE_ID = 'template-id'
export const FILE_ID = 'file-id'
export const FILE_NAME = 'file-name'
export const TEMPLATE_FILE_ID = 'file-id'
export const INCOMING_REQUEST_ID = 'incoming-request-id'
export const RECEIVED_DOCUMENTS_ID = 'received-documents-id'
export const RECEIVED_DOCUMENTS_ID2 = 'received-documents-id-2'
export const SHARE_ID = 'shared-documents-id'
export const SHARE_ID2 = 'shared-documents-id-2'

export const DOCUMENT_NAME = 'document-name'

export const MERKLE_HASH = 'merkle-hash'
export const CONTENT_HASH = 'content-hash'
export const SIGNATURE = 'signature'
export const TX_ID = new ObjectId().toHexString()

export const COMPANY_ID = 'company-id'
export const COMPANY_MNID = 'company-mnid'
export const COMPANY_NAME = 'company-name'

export const RECEIVED_DATE = new Date(2019, 1, 1)
export const EXPECTED_DATE = new Date(2018, 1, 1)

export const FILE_DATA = Buffer.from('BUIDL', 'utf8')
export const FILE_DATA_BASE64 = FILE_DATA.toString('base64')

export const CONTENT_TYPE = 'text/plain'

export const KOMGO_WEB_APP_URL = 'http://somewhere'
export const AUTH_HEADER = 'Bearer string'

export const USER_ID = 'user-id'

export function product(): IProduct {
  return {
    id: PRODUCT_ID,
    name: 'KYC'
  }
}

export function category(): ICategory {
  return {
    id: CATEGORY_ID,
    productId: PRODUCT_ID,
    name: 'category-name'
  }
}

export function fullCategory(): IFullCategory {
  return {
    id: CATEGORY_ID,
    product: product(),
    name: 'category-name'
  }
}

export function type(): IType {
  return {
    id: TYPE_ID,
    productId: PRODUCT_ID,
    categoryId: CATEGORY_ID,
    name: 'type-name',
    vaktId: VAKT_ID,
    fields: [field()],
    predefined: false
  }
}

export function fullType(): IFullType {
  return {
    id: TYPE_ID,
    product: product(),
    category: fullCategory(),
    name: 'type-name',
    fields: [field()],
    vaktId: VAKT_ID,
    predefined: false
  }
}

export function predefinedType(): IType {
  return {
    ...type(),
    predefined: true
  }
}

export function field(): ITypeField {
  return {
    id: 'field-id',
    name: 'field-name',
    type: FieldType.STRING,
    isArray: false
  }
}

export function template(): ITemplate {
  return {
    id: TEMPLATE_ID,
    name: 'template-name',
    productId: 'product-id',
    types: ['type-id'],
    metadata: [
      {
        name: 'key',
        value: 'value'
      }
    ]
  }
}

export function fullTemplate(): IFullTemplate {
  return {
    id: TEMPLATE_ID,
    name: 'template-name',
    product: product(),
    types: [fullType()],
    metadata: [
      {
        name: 'key',
        value: 'value'
      }
    ]
  }
}

export function document(): IDocument {
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
    createdAt: RECEIVED_DATE,
    registrationDate: EXPECTED_DATE,
    sharedWith: [],
    sharedBy: COMPANY_ID,
    state: DocumentState.Pending,
    comment: COMMENT
  }
}

export function context() {
  return {
    subProductId: SUBPRODUCT_ID
  }
}

export function documentTemplate(): IDocumentTemplate {
  return {
    id: DOCUMENT_TEMPLATE_ID,
    metadata: metadata(),
    content: { fileId: TEMPLATE_FILE_ID }
  }
}

export function owner(): IOwner {
  return {
    firstName: 'first-name',
    lastName: 'last-name',
    companyId: COMPANY_ID
  }
}

export function metadata(): IKeyValue[] {
  return [
    {
      name: 'key',
      value: 'value'
    }
  ]
}

export function fileContent(): IContent {
  return {
    fileId: FILE_ID,
    signature: SIGNATURE,
    size: 0
  }
}

export function fullDocument(): IFullDocument {
  return {
    id: DOCUMENT_ID,
    context: context(),
    name: DOCUMENT_NAME,
    product: product(),
    category: fullCategory(),
    type: fullType(),
    owner: owner(),
    metadata: metadata(),
    content: fileContent(),
    hash: MERKLE_HASH,
    contentHash: CONTENT_HASH,
    komgoStamp: false,
    registrationDate: EXPECTED_DATE,
    createdAt: RECEIVED_DATE,
    sharedWith: [],
    sharedBy: COMPANY_ID,
    state: DocumentState.Pending,
    comment: COMMENT
  }
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

export function incomingRequestInProgress(): IIncomingRequest {
  return {
    id: INCOMING_REQUEST_ID,
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    types: [TYPE_ID, TYPE_ID1],
    documents: [DOCUMENT_ID],
    sentDocumentTypes: [TYPE_ID],
    sentDocuments: [DOCUMENT_ID]
  }
}

export function incomingRequestComplete(): IIncomingRequest {
  return {
    id: INCOMING_REQUEST_ID,
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    types: [TYPE_ID, TYPE_ID1],
    documents: [DOCUMENT_ID],
    sentDocumentTypes: [TYPE_ID, TYPE_ID1],
    sentDocuments: [DOCUMENT_ID]
  }
}

export function fullIncomingRequest(): IFullIncomingRequest {
  return {
    id: INCOMING_REQUEST_ID,
    product: product(),
    companyId: COMPANY_ID,
    types: [fullType()],
    documents: [fullDocument()],
    sentDocumentTypes: [],
    sentDocuments: []
  }
}

export function outgoingRequest(): IOutgoingRequest {
  return {
    id: REQUEST_ID,
    productId: PRODUCT_ID,
    companyId: 'company-id',
    types: [TYPE_ID]
  }
}

export function outgoingRequestWithForms(): IOutgoingRequest {
  return {
    id: REQUEST_ID,
    productId: PRODUCT_ID,
    companyId: 'company-id',
    types: [TYPE_ID],
    forms: [DOCUMENT_ID]
  }
}

export function fullOutgoingRequest(): IFullOutgoingRequest {
  return {
    id: REQUEST_ID,
    product: product(),
    companyId: 'company-id',
    types: [fullType()],
    createdAt: new Date(2019, 1, 1)
  }
}

export function documentReview(): IDocumentReview {
  return {
    documentId: DOCUMENT_ID,
    status: FEEDBACK_STATUS.Pending,
    note: '',
    reviewerId: ''
  }
}

export function secondDocumentReview(): IDocumentReview {
  return {
    documentId: DOCUMENT_ID2,
    status: FEEDBACK_STATUS.Rejected,
    note: '',
    reviewerId: ''
  }
}

export function documentFeedback(): IDocumentFeedback {
  return {
    documentId: DOCUMENT_ID,
    status: FEEDBACK_STATUS.Pending,
    note: '',
    newVersionRequested: false
  }
}

export function receivedDocuments(): IReceivedDocuments {
  return {
    id: RECEIVED_DOCUMENTS_ID,
    context: context(),
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    shareId: SHARE_ID,
    documents: [documentReview()],
    feedbackSent: false
  }
}

export function secondReceivedDocuments(): IReceivedDocuments {
  return {
    id: RECEIVED_DOCUMENTS_ID2,
    context: context(),
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    shareId: SHARE_ID2,
    documents: [secondDocumentReview()],
    feedbackSent: false
  }
}

export function receivedDocumentsArrayWithRequestId(): IReceivedDocuments[] {
  return [
    {
      ...receivedDocuments(),
      requestId: REQUEST_ID
    },
    secondReceivedDocuments()
  ]
}

export function sharedDocuments(): ISharedDocuments {
  return {
    id: SHARE_ID,
    context: context(),
    productId: PRODUCT_ID,
    companyId: COMPANY_ID,
    requestId: REQUEST_ID,
    documents: [documentFeedback()],
    feedbackReceived: false
  }
}

export function fullSharedDocuments(): IFullSharedDocuments {
  return {
    id: SHARE_ID,
    context: context(),
    product: product(),
    companyId: COMPANY_ID,
    documents: [
      {
        document: fullDocument(),
        status: FEEDBACK_STATUS.Rejected,
        note: '',
        newVersionRequested: false,
        reviewerId: ''
      }
    ],
    feedbackReceived: false
  }
}

export function fullReceivedDocuments(): IFullReceivedDocuments {
  return {
    id: RECEIVED_DOCUMENTS_ID,
    context: context(),
    product: product(),
    companyId: COMPANY_ID,
    shareId: SHARE_ID,
    request: fullOutgoingRequest(),
    documents: [
      {
        document: fullDocument(),
        status: FEEDBACK_STATUS.Rejected,
        note: '',
        reviewerId: ''
      }
    ],
    feedbackSent: false
  }
}

export function fullReceivedDocumentsWithThreeDocsStatus(): IFullReceivedDocuments {
  return {
    id: RECEIVED_DOCUMENTS_ID,
    context: context(),
    product: product(),
    companyId: COMPANY_ID,
    shareId: SHARE_ID,
    request: fullOutgoingRequest(),
    documents: [
      {
        document: fullDocument(),
        status: FEEDBACK_STATUS.Rejected,
        note: '',
        reviewerId: ''
      },
      {
        document: fullDocument(),
        status: FEEDBACK_STATUS.Accepted,
        note: '',
        reviewerId: ''
      },
      {
        document: fullDocument(),
        status: FEEDBACK_STATUS.Pending,
        note: '',
        reviewerId: ''
      }
    ],
    feedbackSent: false
  }
}

export function fileBuffer(): IFileBuffer {
  return {
    id: FILE_ID,
    fileName: FILE_NAME,
    file: FILE_DATA,
    contentType: CONTENT_TYPE
  }
}
