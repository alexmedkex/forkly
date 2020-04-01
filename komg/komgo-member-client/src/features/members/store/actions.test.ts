import { fetchMembers } from './actions'
import { initialTradeState } from './reducer'
import { MemberActionType } from './types'

describe('Member actions', () => {
  let dispatchMock: any
  let apiMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => dummyAction)
    }
  })

  describe('fetchMembers', () => {
    it('calls api.get with the correct arguments', () => {
      fetchMembers()(dispatchMock, () => initialTradeState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('/registry/v0/registry/cache?companyData=%7B%7D', {
        onError: MemberActionType.FetchMembersFailure,
        onSuccess: MemberActionType.FetchMembersSuccess,
        type: MemberActionType.FetchMembersRequest
      })
    })
  })
})
