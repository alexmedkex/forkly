import * as React from 'react'
import renderer from 'react-test-renderer'
import ReviewDiscrepanciesSubtitle from './ReviewDiscrepanciesSubtitle'
import { fakePresentation } from '../../utils/faker'
import { LCPresentationStatus } from '../../store/presentation/types'

describe('ReviewDiscrepanciesSubtitle', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      presentation: fakePresentation({ status: LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank }),
      members: []
    }
  })

  it('should match snapshot when status=DiscrepanciesAdvisedByIssuingBank', () => {
    const tree = renderer.create(<ReviewDiscrepanciesSubtitle {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('should match snapshot when status=DiscrepanciesAdvisedByNominatedBank', () => {
    const presentation = {
      ...defaultProps.presentation,
      status: LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
    }
    const tree = renderer.create(<ReviewDiscrepanciesSubtitle {...defaultProps} presentation={presentation} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('should match snapshot when status=DiscrepanciesAcceptedByIssuingBank', () => {
    const presentation = {
      ...defaultProps.presentation,
      status: LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
    }
    const tree = renderer.create(<ReviewDiscrepanciesSubtitle {...defaultProps} presentation={presentation} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
