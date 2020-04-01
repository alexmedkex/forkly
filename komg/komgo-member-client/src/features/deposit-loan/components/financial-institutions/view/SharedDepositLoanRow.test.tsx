import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { buildFakeShareDepositLoan } from '@komgo/types'

import SharedDepositLoanRow from './SharedDepositLoanRow'
import { IExtendedSharedWith } from '../../../store/types'

describe('SharedDepositLoanRow', () => {
  const sharedDepositLoan: IExtendedSharedWith = {
    ...buildFakeShareDepositLoan(),
    sharedWithCompanyName: 'Company Name'
  }

  it('should match snapshot when appetite and pricing are shared', () => {
    expect(renderer.create(<SharedDepositLoanRow sharedDepositLoan={sharedDepositLoan} />).toJSON()).toMatchSnapshot()
  })

  it('should match snapshot when appetite is shared but pricing is not shared', () => {
    expect(
      renderer
        .create(
          <SharedDepositLoanRow
            sharedDepositLoan={{ ...sharedDepositLoan, pricing: { pricing: null, shared: false } }}
          />
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
