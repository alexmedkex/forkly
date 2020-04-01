import * as React from 'react'
import LCPresentationDetailsHeader from './LCPresentationDetailsHeader'
import { fakeMember, fakePresentation } from '../../utils/faker'
import * as renderer from 'react-test-renderer'

describe('LCPresentationDetailsHeader', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      members: [fakeMember({ staticId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c', commonName: 'Applicant Name' })],
      presentation: fakePresentation({ staticId: '123', reference: '123' })
    }
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<LCPresentationDetailsHeader {...defaultProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
