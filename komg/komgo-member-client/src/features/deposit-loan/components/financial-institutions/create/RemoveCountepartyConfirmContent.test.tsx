import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { buildFakeShareDepositLoan } from '@komgo/types'

import RemoveCounterpartyConfirmContent from './RemoveCounterpartyConfirmContent'
import { fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'

describe('RemoveCounterpartyConfirmContent', () => {
  const fakeSharedWith = buildFakeShareDepositLoan({ sharedWithStaticId: '123' })
  const fakeCounterparties = [fakeCounterparty({ staticId: '123', commonName: 'Test name' })]

  it('should match snapshot when removing already shared info', () => {
    expect(
      renderer
        .create(
          <RemoveCounterpartyConfirmContent sharedWithData={fakeSharedWith} counterparties={fakeCounterparties} />
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot when removing not shared info', () => {
    const newSharedWith = { ...fakeSharedWith, staticId: null }
    expect(
      renderer
        .create(<RemoveCounterpartyConfirmContent sharedWithData={newSharedWith} counterparties={fakeCounterparties} />)
        .toJSON()
    ).toMatchSnapshot()
  })
})
