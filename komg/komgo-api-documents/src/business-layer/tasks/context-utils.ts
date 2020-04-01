import { IReceivedDocuments, IFullReceivedDocuments } from '../../data-layer/models/received-documents'

import { IDocumentRequestContext } from './IDocumentRequestContext'
import { IReceivedDocumentsContext } from './IReceivedDocumentsContext'

export function receivedDocumentsContext(
  receivedDocuments: IReceivedDocuments | IFullReceivedDocuments
): IReceivedDocumentsContext {
  return {
    receivedDocumentsId: receivedDocuments.id
  }
}

export function documentRequestContext(requestId: string): IDocumentRequestContext {
  return {
    requestId
  }
}
