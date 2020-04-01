export interface IDocumentEventData {
  messageType: string
  contents: string
  documentType: string
  vaktId: string
  lcId?: string
  parcelId?: string
  filename: string
  metadata?: object
}
