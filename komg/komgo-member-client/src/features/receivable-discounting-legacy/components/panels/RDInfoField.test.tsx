import React from 'react'
import { RDInfoField, IRDInfoFieldProps } from './RDInfoField'
import { render } from '@testing-library/react'

describe('RDInfoField', () => {
  let testProps: IRDInfoFieldProps
  beforeEach(() => {
    testProps = {
      fieldName: 'invoiceAmount',
      value: 100000
    }
  })

  it('renders correctly', () => {
    expect(render(<RDInfoField {...testProps} />).asFragment()).toMatchSnapshot()
  })
})
