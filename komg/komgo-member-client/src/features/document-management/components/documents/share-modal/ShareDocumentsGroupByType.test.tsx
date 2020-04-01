import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { fakeDocument } from '../../../utils/faker'
import ShareDocumentsGroupByType from './ShareDocumentsGroupByType'
import { DocumentWithAlreadyShared } from './ConfirmShareStep'

describe('ShareDocumentsGroupByType', () => {
  const doc1 = fakeDocument() as DocumentWithAlreadyShared

  const defaultProps = {
    docsByType: {
      'Passports of UBOs': [doc1]
    }
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<ShareDocumentsGroupByType {...defaultProps} />).toJSON()).toMatchSnapshot()
  })
})
