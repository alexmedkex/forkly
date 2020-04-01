import { isApplicantOnTrade } from './isApplicant'
import { ITrade, TradeSource } from '@komgo/types'
import { fakeTrade } from '../../letter-of-credit-legacy/utils/faker'

const exampleTrade: ITrade = {
  ...fakeTrade(),
  sourceId: '1',
  source: TradeSource.Vakt,
  buyer: 'companyA'
}
describe('isApplicantOnTrade', () => {
  it('returns true when we are buyer of the trade', () => {
    expect(isApplicantOnTrade(exampleTrade, 'companyA')).toBeTruthy()
  })
  it('returns false when we are not buyer of the trade', () => {
    expect(isApplicantOnTrade(exampleTrade, 'companyB')).toBeFalsy()
  })
  it('returns false when no buyer field is present', () => {
    expect(isApplicantOnTrade({ ...fakeTrade(), sourceId: '1', source: TradeSource.Vakt }, 'myComp')).toBeFalsy()
  })
})
