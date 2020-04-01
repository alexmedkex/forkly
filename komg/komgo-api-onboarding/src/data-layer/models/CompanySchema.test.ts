import { Status } from '@komgo/types'

import { virtualStatus } from './CompanySchema'

describe('CompanySchema', () => {
  it('returns status Registered if a non-member was added to ENS', () => {
    const context = { isMember: false, addedToENS: true }
    expect(virtualStatus.call(context)).toEqual(Status.Registered)
  })
  it('returns status Draft if member package is not generated for a member company', () => {
    const context = { isMember: true, memberType: 'SMS' }
    expect(virtualStatus.call(context)).toEqual(Status.Draft)
  })
  it('returns status Pending if member package is generated but public keys are missing', () => {
    const context = { isMember: true, memberType: 'SMS', harborUser: 'abc' }
    expect(virtualStatus.call(context)).toEqual(Status.Pending)
  })
  it('returns status Ready if member package and public keys are ready for a member', () => {
    const context = { isMember: true, memberType: 'SMS', harborUser: 'abc', messagingPublicKey: {} }
    expect(virtualStatus.call(context)).toEqual(Status.Ready)
  })
  it('returns status Ready if a non-member is not added to ENS yet', () => {
    const context = { isMember: false, addedToENS: false }
    expect(virtualStatus.call(context)).toEqual(Status.Ready)
  })
  it('returns status Ready if it is an FMS member', () => {
    const context = { isMember: true, memberType: 'FMS' }
    expect(virtualStatus.call(context)).toEqual(Status.Ready)
  })
  it('returns status Onboarded if a member is in ENS and common MQ is configured', () => {
    const context = { isMember: true, memberType: 'SMS', addedToENS: true, addedToMQ: true }
    expect(virtualStatus.call(context)).toEqual(Status.Onboarded)
  })
})
