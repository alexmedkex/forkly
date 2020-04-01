import React from 'react'
import { render } from '@testing-library/react'
import { IHistoryPopupProps, HistoryPopup } from './HistoryPopup'

describe('HistoryPopup', () => {
  let testProps: IHistoryPopupProps
  beforeEach(() => {
    testProps = {
      fieldName: 'test',
      currentFieldValue: 'value',
      historyValues: [{ updatedAt: new Date().toJSON(), values: ['value1'] }]
    }
  })
  it('should render correctly', () => {
    expect(render(<HistoryPopup {...testProps} />).asFragment()).toMatchSnapshot()
  })
})
