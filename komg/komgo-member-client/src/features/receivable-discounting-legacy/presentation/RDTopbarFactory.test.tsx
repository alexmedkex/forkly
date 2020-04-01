import { RDTopbarFactory } from './RDTopbarFactory'
import { ITradeEnriched } from '../../trades/store/types'
import { fakeTrade, fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { IReceivablesDiscountingInfo, CreditRequirements, RDStatus } from '@komgo/types'
import { fakeRdInfo } from '../utils/faker'
import { IMember } from '../../members/store/types'
import { ReceivablesDiscountingRole } from '../utils/constants'
import { render } from '@testing-library/react'

const trade: ITradeEnriched = fakeTrade({
  _id: '123',
  creditRequirement: CreditRequirements.OpenCredit,
  sellerEtrmId: '1234'
})
const members: IMember[] = [
  fakeMember(),
  fakeMember({ isFinancialInstitution: false, isMember: true, staticId: 'abc', commonName: 'A Trader' })
]

describe('RDTopbarFactory', () => {
  describe('createTopbarInfoItems', () => {
    it('should return 4 items if not ifFinancialInstitution, but status not accepted', () => {
      const discountingRequest: IReceivablesDiscountingInfo = fakeRdInfo()
      expect(
        RDTopbarFactory.createTopbarInfoItems(trade, discountingRequest, members, ReceivablesDiscountingRole.Trader)
          .length
      ).toEqual(4)
    })

    it('should return 5 items if not ifFinancialInstitution and status accepted', () => {
      const discountingRequest: IReceivablesDiscountingInfo = fakeRdInfo({
        acceptedParticipantStaticId: 'asdas',
        status: RDStatus.QuoteAccepted
      })
      expect(
        RDTopbarFactory.createTopbarInfoItems(trade, discountingRequest, members, ReceivablesDiscountingRole.Trader)
          .length
      ).toEqual(5)
    })

    it('should return 0 items if values undefined', () => {
      expect(
        RDTopbarFactory.createTopbarInfoItems(undefined, undefined, undefined, ReceivablesDiscountingRole.Trader).length
      ).toEqual(0)
    })
  })

  describe('createApplyForDiscountingTopBarItems', () => {
    it('should return 3 items', () => {
      expect(RDTopbarFactory.createApplyForDiscountingTopBarInfoItems(trade).length).toEqual(3)
    })
  })
})
