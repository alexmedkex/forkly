import * as React from 'react'

interface IProps {
  numberOfDiscrepant: number
  total: number
}

const ReviewFeedbackDocumentCounter: React.FC<IProps> = (props: IProps) => {
  const { numberOfDiscrepant, total } = props
  return (
    <p>
      Total documents - {total} <br />
      Number of discrepant documents - {numberOfDiscrepant}
    </p>
  )
}

export default ReviewFeedbackDocumentCounter
