import { tranformToRdBankDashboardData } from './rdBankDashboardSelectors'
import { fakeReceivablesDiscounting } from '../utils/faker'
import { IReceivablesDiscountingInfo, RDStatus, PaymentTermsOption } from '@komgo/types'
import { NOTENOUGHINFO } from '../../trades/constants'

describe('tranformToRdBankDashboardData', () => {
  it('should return formatted RD data', () => {
    expect(tranformToRdBankDashboardData(fakeRds)).toMatchSnapshot()
  })

  it('should have no invoice amount if not specified', () => {
    const fakeRd = { ...fakeRds[0] } // copy, don't modify
    fakeRd.rd.invoiceAmount = undefined

    expect(tranformToRdBankDashboardData([fakeRd])[0].invoiceAmount).not.toBeDefined()
  })

  it('should have no invoice type if not specified', () => {
    const fakeRd = { ...fakeRds[0] } // copy, don't modify
    fakeRd.rd.invoiceType = undefined

    expect(tranformToRdBankDashboardData([fakeRd])[0].invoiceType).toBe('')
  })

  it('should show expected discounting date if requested status', () => {
    const fakeRd = { ...fakeRds[0], status: RDStatus.Requested }

    expect(tranformToRdBankDashboardData([fakeRd])[0].discountingDateType).toEqual('Expected')
  })

  it('should return empty if there are no RDs', () => {
    expect(tranformToRdBankDashboardData([])).toEqual([])
  })

  it('should not show payment terms if there is no value and is Deferred', () => {
    const fakeRd = { ...fakeRds[0] } // copy, don't modify
    delete fakeRd.tradeSnapshot.trade.paymentTerms

    expect(tranformToRdBankDashboardData([fakeRd])[0].paymentTerms).toBe('-')
  })

  it('should not show payment terms if there is no payment term option', () => {
    const fakeRd = { ...fakeRds[0] } // copy, don't modify
    delete fakeRd.tradeSnapshot.trade.paymentTermsOption

    expect(tranformToRdBankDashboardData([fakeRd])[0].paymentTerms).toBe('-')
  })

  it('should show sight payment terms if is Sight', () => {
    const fakeRd = { ...fakeRds[0] } // copy, don't modify
    fakeRd.tradeSnapshot.trade.paymentTermsOption = PaymentTermsOption.Sight

    expect(tranformToRdBankDashboardData([fakeRd])[0].paymentTerms).toBe('Sight')
  })
})

const fakeRds: IReceivablesDiscountingInfo[] = [
  fakeReceivablesDiscounting({
    status: RDStatus.Requested,
    sourceId: 'trade-source-id'
  }),
  fakeReceivablesDiscounting({
    status: RDStatus.Requested,
    sourceId: 'trade-source-id'
  })
]
