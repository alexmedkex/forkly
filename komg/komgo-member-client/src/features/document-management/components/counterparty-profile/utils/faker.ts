import { CounterpartyProfile, RiskLevel } from '../../../../counterparties/store/types'

const defaultProfile: CounterpartyProfile = {
  id: 'anon-profile-id',
  counterpartyId: 'anon-counterparty-id',
  renewalDate: new Date('2019-07-16').toISOString(),
  riskLevel: RiskLevel.unspecified,
  managedById: 'anon-user-id'
}

export const fakeProfile = (partial?: Partial<CounterpartyProfile>) => {
  return partial ? { ...defaultProfile, ...partial } : defaultProfile
}

export const mockDate = () => {
  const RealDate = Date
  const _GLOBAL: any = global // we love typescript!

  return {
    freeze: (isoDate: string | number | Date) => {
      _GLOBAL.Date = class extends RealDate {
        constructor(...args: any) {
          super()
          return new RealDate(isoDate)
        }
      }
    },
    restore: () => {
      global.Date = RealDate
    }
  }
}
