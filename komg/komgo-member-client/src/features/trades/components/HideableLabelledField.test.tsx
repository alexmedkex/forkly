import React from 'react'
import { IHistoryEntry, TRADE_SCHEMA } from '@komgo/types'
import { fakeITradeSnapshotHistory } from '../../receivable-discounting-legacy/utils/faker'
import { HideableLabelledField } from './HideableLabelledField'
import { render, fireEvent } from '@testing-library/react'

interface HideableLabelledFieldProps {
  field: any
  fieldName: string
  schema: any
  historyEntry?: IHistoryEntry<any>
  formatter?: (input: any) => string
}

describe('HideableLabelledField', () => {
  let testProps: HideableLabelledFieldProps

  beforeEach(() => {
    testProps = {
      field: 'hugh1',
      fieldName: 'testField',
      schema: TRADE_SCHEMA,
      historyEntry: {
        testField: [
          { updatedAt: '2019-07-30T14:48:13.604Z', value: 'hugh1' },
          { updatedAt: '2019-07-30T08:53:34.792Z', value: 'hugh' }
        ]
      }
    }
  })

  it('should render correctly without history', () => {
    expect(render(<HideableLabelledField {...testProps} />).asFragment()).toMatchSnapshot()
  })
})
