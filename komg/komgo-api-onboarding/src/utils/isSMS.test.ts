import isSMS from './isSMS'

describe('isSMS', () => {
  it('should return true if memberType is SMS', () => {
    expect(isSMS('SMS')).toBeTruthy()
  })

  it('should return false if memberType is FMS', () => {
    expect(isSMS('FMS')).toBeFalsy()
  })

  it('should return false if memberType is LMS', () => {
    expect(isSMS('LMS')).toBeFalsy()
  })

  it('should return false if memberType is undefined', () => {
    let memberType
    expect(isSMS(memberType)).toBeFalsy()
  })

  it('should return false if memberType is something else', () => {
    expect(isSMS('test')).toBeFalsy()
  })
})
