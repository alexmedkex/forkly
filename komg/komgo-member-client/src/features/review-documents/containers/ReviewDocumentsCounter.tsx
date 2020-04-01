import * as React from 'react'

export interface ReviewDocumentsCounterProps {
  numTotalDocs: number
  numDocsReviewed: number
  style?: any
}

const ReviewDocumentsCounter: React.SFC<ReviewDocumentsCounterProps> = (props: ReviewDocumentsCounterProps): any => (
  <h4 style={props.style}>
    <b>
      {props.numDocsReviewed}/{props.numTotalDocs}
    </b>{' '}
    documents reviewed
  </h4>
)

export default ReviewDocumentsCounter
