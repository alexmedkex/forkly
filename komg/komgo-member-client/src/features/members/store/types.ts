import { ImmutableMap } from '../../../utils/types'
import { Map, List } from 'immutable'

import { stringOrNull } from '../../../utils/types'

import { Action } from 'redux'
import { IProduct } from '@komgo/products'
import { IX500Name, IEthPubKey, IMessagingPubKey, IVakt, MemberType } from '@komgo/types'

export enum MemberActionType {
  FetchMembersRequest = '@@members/FETCH_MEMBERS_REQUEST',
  FetchMembersSuccess = '@@members/FETCH_MEMBERS_SUCCESS',
  FetchMembersFailure = '@@members/FETCH_MEMBERS_FAILURE',
  DeactivateMemberRequest = '@@members/DEACTIVATE_MEMBER_REQUEST',
  DeactivateMemberSuccess = '@@members/DEACTIVATE_MEMBER_SUCCESS',
  DeactivateMemberFailure = '@@members/DEACTIVATE_MEMBER_FAILURE',
  UpdateMemberProducts = '@@members/UPDATE_MEMBER_PRODUCTS'
}

export interface MemberStateProperties {
  byId: Map<string, ImmutableMap<IMember>>
  byStaticId: Map<string, ImmutableMap<IMember>>
  ids: List<string>
  error: stringOrNull
}

export type MemberState = ImmutableMap<MemberStateProperties>

export interface MembersReceivedAction extends Action {
  type: MemberActionType.FetchMembersSuccess
  payload: IMember[]
}

export interface DeactivateMemberRequest extends Action {
  type: MemberActionType.DeactivateMemberSuccess
  payload: IMember
}

export interface MembersError extends Action {
  type: MemberActionType.FetchMembersFailure
  payload: stringOrNull
}

export interface MembersUpdateStatusAction extends Action {
  type: MemberActionType.UpdateMemberProducts
  payload: {
    memberStaticId: string
    memberProducts: IProduct[]
  }
}

export interface IMember {
  _id?: string
  node?: string
  parentNode?: string
  label?: string
  owner?: string
  resolver?: string
  abi?: string
  nodeKeys?: string
  staticId: string
  isMember: boolean
  isFinancialInstitution: boolean
  vaktStaticId?: string
  komgoMnid?: string
  vaktMnid?: string
  komgoProducts?: List<ImmutableMap<IProduct>>
  x500Name: IX500Name
  text?: object
  ethPubKeys?: IEthPubKey[]
  komgoMessagingPubKeys?: IMessagingPubKey[]
  vaktMessagingPubKeys?: IMessagingPubKey[]
  hasSWIFTKey: boolean
  memberType?: MemberType
  status?: string
  isDeactivated?: boolean
  vakt?: IVakt
}

export type MemberAction = MembersReceivedAction | MembersError | DeactivateMemberRequest | MembersUpdateStatusAction

/* TODO LS evaluate Record rather than generic map
export class Member extends Record({}) {
  constructor(params: IMember) {
    params ? super(params) : super();
  }

  with(values: IMember) {
    return this.merge(values) as this;
  }
}*/
