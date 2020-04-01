import {
  getAllServiceURLs,
  serviceURLs,
  komgoOnlyServices,
  memberOnlyServices,
  getVerifStatus
} from './HealthcheckHelpers'

describe('HealthcheckHelpers test', () => {
  it('should return all serviceURLs from getAllServiceURLs', () => {
    const result = getAllServiceURLs('true')
    expect(result).toEqual({ ...serviceURLs, ...komgoOnlyServices })
  })

  it('should return basic serviceURLs from getAllServiceURLs', () => {
    const result = getAllServiceURLs('false')
    expect(result).toEqual({ ...serviceURLs, ...memberOnlyServices })
  })

  it('should return status from getVerifStatus', () => {
    const resultTrue = getVerifStatus(200)
    const resultFalse = getVerifStatus(100)
    expect(resultTrue).toBeTruthy()
    expect(resultFalse).toBeFalsy()
  })
})
