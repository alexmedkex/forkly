import { Document } from '../store/types'

export const isSharedDocument = (doc: Document): boolean => {
  return doc.sharedBy !== 'none'
}

/**
 * It checks if a document have been already reviewed or it returns
 * false if it is pending to be reviewed yet.
 */
export const isReviewed = (doc: Document): boolean => {
  if (isSharedDocument(doc)) {
    return doc.sharedInfo && doc.sharedInfo.status && doc.sharedInfo.status !== 'pending'
  }
}

export const isReviewCompleted = (doc: Document): boolean => {
  if (doc.sharedInfo) {
    return doc.sharedInfo.completedReview
  }
}
