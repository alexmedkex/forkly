import * as React from 'react'
import * as renderer from 'react-test-renderer'
import ReviewFeedbackDocumentCounter from './ReviewFeedbackDocumentCounter'

describe('ReviewFeedbackDocumentCounter component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      numberOfDiscrepant: 1,
      total: 2
    }
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<ReviewFeedbackDocumentCounter {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
