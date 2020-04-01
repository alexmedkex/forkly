import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { buildFakeDepositLoanResponse } from '@komgo/types'

import ConfirmSubmitContent from './ConfirmSubmitContent'

describe('ConfirmSubmitContent', () => {
  const depositWithShared = buildFakeDepositLoanResponse()
  const depositWithoutShared = { ...depositWithShared, sharedWith: [] }

  it('should match default snaptshout edit=false, sharedWith exists', () => {
    expect(
      renderer.create(<ConfirmSubmitContent isEdit={false} depositLoan={depositWithShared} />).toJSON()
    ).toMatchSnapshot()
  })

  it('should match default snaptshout edit=false, sharedWith not exists', () => {
    expect(
      renderer.create(<ConfirmSubmitContent isEdit={false} depositLoan={depositWithoutShared} />).toJSON()
    ).toMatchSnapshot()
  })

  it('should match default snaptshout edit=true, sharedWith exists', () => {
    expect(
      renderer.create(<ConfirmSubmitContent isEdit={true} depositLoan={depositWithShared} />).toJSON()
    ).toMatchSnapshot()
  })

  it('should match default snaptshout edit=true, sharedWith not exists', () => {
    expect(
      renderer.create(<ConfirmSubmitContent isEdit={true} depositLoan={depositWithoutShared} />).toJSON()
    ).toMatchSnapshot()
  })
})
