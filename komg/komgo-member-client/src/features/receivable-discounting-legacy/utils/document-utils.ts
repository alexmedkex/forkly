import { Document } from '../../document-management'
import { isLaterThan } from '../../../utils/date'

export type ModifiedDocument = Document & { lastModifiedAt: Date }

const latestModified = (doc1?: ModifiedDocument, doc2?: ModifiedDocument): ModifiedDocument => {
  if (doc1 && doc2) {
    return isLaterThan(doc1.lastModifiedAt, doc2.lastModifiedAt) ? doc1 : doc2
  }
  return doc1 ? doc1 : doc2
}

export const latestDocument = (docs: Document[]): ModifiedDocument | undefined =>
  docs
    .map(doc => ({
      ...doc,
      lastModifiedAt: doc.receivedDate || doc.registrationDate
    }))
    .reduce(latestModified, undefined as any)
