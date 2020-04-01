import * as immutable from 'immutable'
import { Reducer, AnyAction } from 'redux'

import { MemberActionType, MemberState, MemberStateProperties, IMember } from './types'
import { memberLicenseSelector } from '../../licenses/components/Licenses'

const initialTradeStateProps: MemberStateProperties = {
  byId: immutable.Map(),
  byStaticId: immutable.Map(),
  ids: immutable.List(),
  error: null
}

export const initialTradeState: MemberState = immutable.Map(initialTradeStateProps)

const reducer: Reducer<MemberState> = (state: MemberState = initialTradeState, action: AnyAction): MemberState => {
  switch (action.type) {
    case MemberActionType.FetchMembersSuccess: {
      const update = action.payload.reduce(
        (memo: object, item: IMember) => ({
          ...memo,
          [item._id]: item
        }),
        {}
      )
      const members = state.get('byId').mergeDeep(immutable.fromJS(update))
      const updateStaticId = action.payload.reduce(
        (memo: object, item: IMember) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      const byStaticId = state.get('byStaticId').mergeDeep(immutable.fromJS(updateStaticId))
      const ids = action.payload.map((member: IMember) => member._id)

      return state
        .set('byId', members)
        .set('byStaticId', byStaticId)
        .set('ids', immutable.List(ids))
        .set('error', null)
    }

    case MemberActionType.DeactivateMemberSuccess: {
      const byStaticId = state
        .get('byStaticId')
        .filter(member => member.get('staticId') !== action.payload.id)
        .toMap()

      return state.set('byStaticId', byStaticId)
    }

    case MemberActionType.FetchMembersFailure:
      return state.set('error', action.payload)

    case MemberActionType.UpdateMemberProducts: {
      const { memberStaticId, memberProducts } = action.payload
      const memberByStaticId = state
        .get('byStaticId')
        .get(memberStaticId)
        .toJS()
      const updatedMember = { ...memberByStaticId, komgoProducts: memberProducts }
      const newByStaticId = state.get('byStaticId').set(memberStaticId, immutable.fromJS(updatedMember))

      return state.set('byStaticId', newByStaticId)
    }

    default:
      return state
  }
}

export default reducer
