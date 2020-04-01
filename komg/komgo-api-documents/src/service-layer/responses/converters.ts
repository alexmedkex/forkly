import { ICategory } from '../../data-layer/models/category'
import { IFullCategory } from '../../data-layer/models/category/IFullCategory'
import { IContent, IDocument, ISharedWith } from '../../data-layer/models/document'
import { IDocumentTemplate } from '../../data-layer/models/document-template'
import { IFullDocument } from '../../data-layer/models/document/IFullDocument'
import IUploadInfo from '../../data-layer/models/document/UploadInfo'
import { IFullIncomingRequest } from '../../data-layer/models/incoming-request'
import { IFullOutgoingRequest, IOutgoingRequest } from '../../data-layer/models/outgoing-request'
import { IProduct } from '../../data-layer/models/product'
import {
  IDocumentReview,
  IFullDocumentReview,
  IFullReceivedDocuments,
  IReceivedDocuments
} from '../../data-layer/models/received-documents'
import { IFullSharedDocuments, IFullDocumentFeedback } from '../../data-layer/models/shared-documents'
import { ITemplate } from '../../data-layer/models/template'
import { IFullTemplate } from '../../data-layer/models/template/IFullTemplate'
import { IFullType } from '../../data-layer/models/type/IFullType'
import { IType } from '../../data-layer/models/type/IType'
import { ITypeField } from '../../data-layer/models/type/ITypeField'

import { ICategoryResponse } from './category'
import { IFullCategoryResponse } from './category/IFullCategoryResponse'
import { IContentResponse } from './document'
import { IStoreTemplateResponse } from './document-template/IStoreTemplateResponse'
import { IDocumentResponse } from './document/IDocumentResponse'
import { IFullDocumentResponse } from './document/IFullDocumentResponse'
import { ISharedWithResponse } from './document/ISharedWithResponse'
import IUploadInfoResponse from './document/IUploadInfoResponse'
import { IFullIncomingRequestResponse } from './incoming-request/IFullIncomingRequestResponse'
import { IProductResponse } from './product'
import {
  IDocumentReviewResponse,
  IReceivedDocumentsResponse,
  IReceivedDocumentsAggregationResponse
} from './received-documents'
import { IFullDocumentReviewResponse } from './received-documents/IFullDocumentReviewResponse'
import { IFullReceivedDocumentsResponse } from './received-documents/IFullReceivedDocumentsResponse'
import { IOutgoingRequestResponse } from './request'
import { IFullOutgoingRequestResponse } from './request/IFullRequestResponse'
import { IFullSharedDocumentsResponse, IFullDocumentFeedbackResponse } from './shared-documents'
import { ITemplateResponse } from './template'
import { IFullTemplateResponse } from './template/IFullTemplateResponse'
import { ITypeResponse } from './type'
import { IFullTypeResponse } from './type/IFullTypeResponse'
import { ITypeFieldResponse } from './type/ITypeFieldResponse'

export function convertCategory(category: ICategory): ICategoryResponse {
  return {
    id: category.id,
    productId: category.productId,
    name: category.name
  }
}

export function convertFullCategory(category: IFullCategory): IFullCategoryResponse {
  return {
    id: category.id,
    product: convertProduct(category.product),
    name: category.name
  }
}

export function convertProduct(product: IProduct): IProductResponse {
  return {
    id: product.id,
    name: product.name
  }
}

export function convertType(type: IType): ITypeResponse {
  return {
    id: type.id,
    productId: type.productId,
    categoryId: type.categoryId,
    name: type.name,
    vaktId: type.vaktId,
    fields: convertFields(type.fields),
    predefined: type.predefined
  }
}

export function convertFullType(type: IFullType): IFullTypeResponse {
  return {
    id: type.id,
    product: convertProduct(type.product),
    category: convertFullCategory(type.category),
    name: type.name,
    vaktId: type.vaktId,
    fields: convertFields(type.fields),
    predefined: type.predefined
  }
}

export function convertFullTypes(types: IFullType[]): IFullTypeResponse[] {
  return types.map(t => convertFullType(t))
}

export function convertTemplate(template: ITemplate): ITemplateResponse {
  return {
    id: template.id,
    productId: template.productId,
    name: template.name,
    types: template.types,
    metadata: template.metadata
  }
}

export function convertFullTemplate(template: IFullTemplate): IFullTemplateResponse {
  return {
    id: template.id,
    product: convertProduct(template.product),
    name: template.name,
    types: convertFullTypes(template.types),
    metadata: template.metadata
  }
}

export function convertRequest(request: IOutgoingRequest): IOutgoingRequestResponse {
  return {
    id: request.id,
    productId: request.productId,
    companyId: request.companyId,
    types: request.types,
    forms: request.forms,
    deadline: request.deadline
  }
}

export function convertFullRequest(request?: IFullOutgoingRequest): IFullOutgoingRequestResponse {
  if (!request) return null

  return {
    id: request.id,
    product: convertProduct(request.product),
    companyId: request.companyId,
    types: convertFullTypes(request.types),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    deadline: request.deadline
  }
}

export function convertDocument(document: IDocument): IDocumentResponse {
  return {
    id: document.id,
    context: document.context,
    name: document.name,
    productId: document.productId,
    categoryId: document.categoryId,
    typeId: document.typeId,
    owner: document.owner,
    hash: document.hash,
    contentHash: document.contentHash,
    komgoStamp: document.komgoStamp,
    content: convertContent(document.content),
    registrationDate: document.registrationDate,
    metadata: document.metadata,
    sharedBy: document.sharedBy,
    sharedWith: convertSharedWith(document.sharedWith),
    comment: document.comment,
    state: document.state
  }
}

function convertSharedWith(shared: ISharedWith[]): ISharedWithResponse[] {
  return shared.map(d => convertSharedWithCounterpaty(d))
}

function convertSharedWithCounterpaty(d: ISharedWith) {
  return {
    counterpartyId: d.counterpartyId,
    sharedDates: d.sharedDates
  }
}

function convertContent(content: IContent): IContentResponse {
  return {
    signature: content.signature,
    size: content.size
  }
}

export function convertDocumentTemplate(document: IDocumentTemplate): IStoreTemplateResponse {
  return {
    id: document.id
  }
}

export function convertDocuments(documents: IDocument[]): IDocumentResponse[] {
  return documents.map(d => convertDocument(d))
}

export function convertFullDocument(document: IFullDocument): IFullDocumentResponse {
  return {
    id: document.id,
    name: document.name,
    context: document.context,
    product: convertProduct(document.product),
    category: convertFullCategory(document.category),
    type: convertFullType(document.type),
    owner: document.owner,
    hash: document.hash,
    contentHash: document.contentHash,
    komgoStamp: document.komgoStamp,
    content: convertContent(document.content),
    registrationDate: document.registrationDate,
    receivedDate: document.createdAt,
    sharedWith: convertSharedWith(document.sharedWith),
    metadata: document.metadata,
    sharedBy: document.sharedBy,
    comment: document.comment,
    state: document.state,
    uploadInfo: convertUploadInfo(document.uploadInfo),
    downloadInfo: document.downloadInfo
  }
}

export function convertFullDocuments(documents: IFullDocument[]): IFullDocumentResponse[] {
  return documents.map(d => convertFullDocument(d))
}

function convertUploadInfo(uploadInfo?: IUploadInfo): IUploadInfoResponse {
  if (!uploadInfo) return undefined

  return {
    uploaderUserId: uploadInfo.uploaderUserId
  }
}

function convertFields(fields: ITypeField[]): ITypeFieldResponse[] {
  return fields
    ? fields.map(field => {
        return {
          id: field.id,
          name: field.name,
          type: field.type,
          isArray: field.isArray
        }
      })
    : fields
}

export function convertFullIncomingRequest(request: IFullIncomingRequest): IFullIncomingRequestResponse {
  return {
    id: request.id,
    product: convertProduct(request.product),
    companyId: request.companyId,
    types: convertFullTypes(request.types),
    documents: convertFullDocuments(request.documents),
    sentDocumentTypes: request.sentDocumentTypes,
    sentDocuments: request.sentDocuments,
    deadline: request.deadline,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    dismissedTypes: request.dismissedTypes,
    notes: request.notes
  }
}

export function convertReceivedDocuments(receivedDocuments: IReceivedDocuments): IReceivedDocumentsResponse {
  return {
    id: receivedDocuments.id,
    productId: receivedDocuments.productId,
    companyId: receivedDocuments.companyId,
    requestId: receivedDocuments.requestId,
    context: receivedDocuments.context,
    documents: receivedDocuments.documents.map(documentReview => convertDocumentReview(documentReview)),
    feedbackSent: receivedDocuments.feedbackSent
  }
}

export function convertReceivedDocumentsAggregated(
  receivedDocumentsArray: IReceivedDocuments[]
): IReceivedDocumentsAggregationResponse {
  return {
    productId: receivedDocumentsArray[0].productId,
    companyId: receivedDocumentsArray[0].companyId,
    requestId: receivedDocumentsArray[0].requestId,
    documents: aggregateDocumentReviews(receivedDocumentsArray)
  }
}

function aggregateDocumentReviews(receivedDocumentsArray: IReceivedDocuments[]): IDocumentReviewResponse[] {
  let reviewResponses: IDocumentReviewResponse[] = []
  for (const receivedDocument of receivedDocumentsArray) {
    const documentReviews: IDocumentReviewResponse[] = receivedDocument.documents.map(documentReview =>
      convertDocumentReview(documentReview)
    )
    reviewResponses = reviewResponses.concat(documentReviews)
  }

  return reviewResponses
}

function convertDocumentReview(documentReview: IDocumentReview): IDocumentReviewResponse {
  return {
    documentId: documentReview.documentId,
    status: documentReview.status,
    note: documentReview.note,
    reviewerId: documentReview.reviewerId
  }
}

export function convertFullReceivedDocuments(
  receivedDocuments: IFullReceivedDocuments
): IFullReceivedDocumentsResponse {
  const receivedDocumentsResponse: IFullReceivedDocumentsResponse = {
    id: receivedDocuments.id,
    context: receivedDocuments.context,
    product: convertProduct(receivedDocuments.product),
    companyId: receivedDocuments.companyId,
    request: convertFullRequest(receivedDocuments.request),
    documents: convertDocumentReviews(receivedDocuments.documents),
    feedbackSent: receivedDocuments.feedbackSent
  }

  return receivedDocumentsResponse
}

export function convertDocumentReviews(documentReviews: IFullDocumentReview[]): IFullDocumentReviewResponse[] {
  return documentReviews.map(review => convertFullDocumentReview(review))
}

export function convertFullDocumentReview(documentReview: IFullDocumentReview): IFullDocumentReviewResponse {
  return {
    document: convertFullDocument(documentReview.document),
    status: documentReview.status,
    note: documentReview.note,
    reviewerId: documentReview.reviewerId
  }
}
export function convertFullSharedDocuments(sharedDocument: IFullSharedDocuments): IFullSharedDocumentsResponse {
  const sharedDocumentResponse: IFullSharedDocumentsResponse = {
    id: sharedDocument.id,
    context: sharedDocument.context,
    product: convertProduct(sharedDocument.product),
    companyId: sharedDocument.companyId,
    documents: convertDocumentFeedbacks(sharedDocument.documents),
    feedbackReceived: sharedDocument.feedbackReceived
  }
  return sharedDocumentResponse
}

export function convertDocumentFeedbacks(documentFeedbacks: IFullDocumentFeedback[]): IFullDocumentFeedbackResponse[] {
  return documentFeedbacks.map(feedback => convertFullDocumentFeedback(feedback))
}

export function convertFullDocumentFeedback(documentFeedback: IFullDocumentFeedback): IFullDocumentFeedbackResponse {
  return {
    document: convertFullDocument(documentFeedback.document),
    status: documentFeedback.status,
    note: documentFeedback.note,
    reviewerId: documentFeedback.reviewerId
  }
}
