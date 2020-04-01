import reducer from './reducer'
import * as immutable from 'immutable'
import { IMember, MemberAction, MemberActionType, MembersUpdateStatusAction } from './types'
import { productKYC, productLC, allProducts, IProduct } from '@komgo/products'

const exampleTrades: IMember[] = [
  {
    _id: '5bbdef2d4822ac05cbc0e7cd',
    node: '0xd485f3a5243c8a6635d537368aa67c5713d0b3bdf8b42da1b715f2a79d52b6d9',
    parentNode: '0x9c19ca3566862e19c7779f1af09f5b2883d8880917cedcbf4ae505a775fa518a',
    label: '0x7640a31cf318b304fbc5c2e054fa2e83ca63d70f79731a7b674d7cf23c3162af',
    owner: '0x8304cB99e989EE34af465Db1CF15E369D8402870',
    ethPubKeys: [
      {
        key:
          '0x2854a26bce5ce2485078857627232379d5a1c99757705716a3cdfde6ab7bda350ffbdfbb06c959bff8193f36c42d9f101dbc25922ade0368212d73ef7f816072',
        termDate: 1569709390000.0,
        address: '0x7447FCB38b13a8A833B6e2eD4CCE6a7fd26E2E26',
        current: true,
        revoked: false
      }
    ],
    komgoMessagingPubKeys: [
      {
        key:
          '{"kty":"RSA","kid":"aCub51pujc5LHOHyIe4pDA0AgoSWpV3AxprJ_Hqzwr0","e":"AQAB","n":"moTV8CnWDGBvTiJ7IfXfmAf46I6c_hfqA8zmCWmrZjDdaGdZdzMu46o68uA9-jScv3I6a7enL9cNeZtaP1n4GmqbVJlNBGMAuyw0N-osGnGsLdmfm-XQDYTiGN8kWA6XzW4CqTgvNuOmniFaiOBnJZuW6ldPBu7dfz_HkXg_5xHrOz885aqX74nSc1sfmXjdnVTdrACI0KLkNZAZufXzmDSeWOv-JFvgVcVxGMmO5jT0F5JSjIhH0Tkc-r06KTF60eG9v7DSG6-I4JSxe4MJ7whwpEiAQvZHdZL8exrDIrbtd5AGYjmTuVyLjeFBlI4Gf1OUmjn8dgQu5c9kdZB-DQ"}',
        termDate: 1569709390000.0,
        current: true,
        revoked: false
      }
    ],
    vaktMessagingPubKeys: [
      {
        key:
          '{"kty":"RSA","kid":"1a30daea-63b0-479d-b43b-f9b04ea329a9","n":"yVPbAY_OjJryDkhwQoRFu8bkj41EHzWyeekdb_NKDNbIgleSx4oSkxa1DQNRQujrYPaKkRTppYTgoLXElmqTP743XIU_yKAtNQGWApCcFXBez1ZCJ2PgkXRBJ2YemxvO83APlwMEO9fAuwYSlL-2FjR004l4lwZGE8BKw9wgMRU1dew8gX0wy6H98ZH-aTtC1oLwdm0xGvxXuLbvFNCmhWdaI1HrCnU2dPzIKK4mrutyxif8p-Y6qRW_3r3a---pft_1t6OMkjRr1uEUZ8Q4nC9Aokc75tDrvT1U2_SheTBBUwDR9l3nI0c1NZyoS3sLBo9dfe_0eZ2Aw_ckCzG8KQ","e":"AQAB"}',
        termDate: 1569709390000.0,
        current: true,
        revoked: false
      }
    ],
    resolver: '0x09e125969567EadeC83491916f198acA91F9bEf7',
    staticId: '0b5ad248-6159-47ca-9ac7-610c22877186',
    komgoMnid: '3a47e1d9-0aa6-4cf3-8579-7f6fb083013b',
    x500Name: {
      CN: 'Gunvor SA',
      O: 'Gunvor SA',
      C: 'CH',
      L: 'Geneva',
      STREET: '80-84 Rue du Rhône',
      PC: '1204'
    },
    vaktStaticId: '95267',
    vaktMnid: 'GUNVOR_SA_95267',
    hasSWIFTKey: false,
    isFinancialInstitution: false,
    isMember: true,
    komgoProducts: immutable.fromJS([productKYC, productLC]) // List<immutableMap<IProduct>>
  }
]

describe('Member Reducer', () => {
  describe('defaults', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined as any, { type: 'NONE' })).toMatchSnapshot()
    })
  })

  describe('MEMBERS_SUCCESS', () => {
    it('adds new counterparties', () => {
      const action: MemberAction = {
        type: MemberActionType.FetchMembersSuccess,
        payload: exampleTrades
      }
      expect(reducer(undefined as any, action)).toMatchSnapshot()
    })

    it('update a member', () => {
      const action1: MemberAction = {
        type: MemberActionType.FetchMembersSuccess,
        payload: exampleTrades
      }
      const update = {
        CN: 'Gunvor SA updated',
        O: 'Gunvor SA updated',
        C: 'CH updated',
        L: 'Geneva updated',
        STREET: '80-84 Rue du Rhône updated',
        PC: '1204 updated'
      }
      const [member] = exampleTrades
      const action2: MemberAction = {
        type: MemberActionType.FetchMembersSuccess,
        payload: [
          {
            ...member,
            x500Name: update
          }
        ]
      }
      const initialState = reducer(undefined as any, action1)
      const state = reducer(initialState, action2)
      const members: immutable.Map<string, IMember> = state.get('byId').toJS()
      expect(members[member._id!].x500Name).toEqual(update)
    })
  })

  describe('UPDATE_MEMBER_PRODUCTS', () => {
    it('remove product from member', () => {
      const memberStaticId = '0b5ad248-6159-47ca-9ac7-610c22877186'
      const action1: MemberAction = {
        type: MemberActionType.FetchMembersSuccess,
        payload: [...exampleTrades]
      }
      const action2: MembersUpdateStatusAction = {
        type: MemberActionType.UpdateMemberProducts,
        payload: { memberStaticId, memberProducts: [productKYC] }
      }

      const initialState = reducer(undefined as any, action1)
      const oldKomgoProducts = initialState.getIn(['byStaticId', memberStaticId, 'komgoProducts']).toJS()

      expect([productKYC, productLC]).toEqual(oldKomgoProducts)

      const state = reducer(initialState, action2)
      const newKomgoProducts = state.getIn(['byStaticId', memberStaticId, 'komgoProducts']).toJS()

      expect([productKYC]).toEqual(newKomgoProducts)
    })

    it('add product to member', () => {
      const memberStaticId = '0b5ad248-6159-47ca-9ac7-610c22877186'
      const action1: MemberAction = {
        type: MemberActionType.FetchMembersSuccess,
        payload: [...exampleTrades]
      }
      const action2: MembersUpdateStatusAction = {
        type: MemberActionType.UpdateMemberProducts,
        payload: { memberStaticId, memberProducts: allProducts }
      }

      const initialState = reducer(undefined as any, action1)
      const oldKomgoProducts = initialState.getIn(['byStaticId', memberStaticId, 'komgoProducts']).toJS()

      expect([productKYC, productLC]).toEqual(oldKomgoProducts)

      const state = reducer(initialState, action2)
      const newKomgoProducts = state.getIn(['byStaticId', memberStaticId, 'komgoProducts']).toJS()

      expect(allProducts).toEqual(newKomgoProducts)
    })
  })
})
