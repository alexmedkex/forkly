import { IDocumentServiceClient } from '../../src/business-layer/documents/DocumentServiceClient'
import { IRegisterDocument } from '../../src/business-layer/documents/IRegisterDocument'
import { IDocumentRegisterResponse } from '../../src/business-layer/documents/IDocumentRegisterResponse'
import { IShareDocument } from '../../src/business-layer/documents/IShareDocument'
import { IReceivedDocumentsResponse } from '../../src/business-layer/documents/IReceivedDocuments'
import { ISharedDocumentsResponse } from '../../src/business-layer/documents/ISharedDocumentsResponse'

export class DocumentServiceClientMock implements IDocumentServiceClient {
  public static DOCUMENT_HASH = '0xbe961f7b88c54a3430f7180dc6b4099573bc9784e0aa61c084ae00a8f8907fab'

  registerDocument(document: IRegisterDocument): Promise<IDocumentRegisterResponse> {
    return Promise.resolve({
      id: 'documentId',
      context: {},
      name: 'documentName',
      product: {
        id: 'id',
        name: 'name'
      },
      category: {
        id: 'id',
        product: {
          id: 'id',
          name: 'name'
        },
        name: 'category'
      },
      registrationDate: new Date(),
      content: undefined,
      type: undefined,
      owner: undefined,
      hash: DocumentServiceClientMock.DOCUMENT_HASH,
      metadata: undefined,
      sharedWith: ['guy'],
      sharedBy: 'yup'
    })
  }
  shareDocument(documentShare: IShareDocument) {
    throw new Error('Method not implemented.')
  }
  deleteDocument(productId: string, documentId: string) {
    throw new Error('Method not implemented.')
  }
  getDocumentById(productId: string, documentId: string): Promise<IDocumentRegisterResponse> {
    throw new Error('Method not implemented.')
  }
  getDocument(productId: string, typeid: string, context: any) {
    throw new Error('Method not implemented.')
  }
  getDocumentContent(productId: string, documentId: string) {
    throw new Error('Method not implemented.')
  }
  getDocumentTypes(productId: string) {
    throw new Error('Method not implemented.')
  }
  getDocuments(productId: any, context: object): Promise<IDocumentRegisterResponse[]> {
    throw new Error('Method not implemented.')
  }
  sendDocumentFeedback(productId: string, receivedDocumentsId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getReceivedDocuments(productId: string, context: object): Promise<IReceivedDocumentsResponse[]> {
    throw new Error('Method not implemented.')
  }
  getSendDocumentFeedback(productId: string, context: object): Promise<ISharedDocumentsResponse[]> {
    throw new Error('Method not implemented.')
  }
}
