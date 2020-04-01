import { DocumentContentMessageData } from './DocumentContentMessageData'
import { InternalDocumentMessageData } from './InternalDocumentMessageData'
import { MetadataMessageData } from './MetadataMessageData'

export class DocumentMessageData extends InternalDocumentMessageData {
  metadata: MetadataMessageData[]
  content: DocumentContentMessageData
}
