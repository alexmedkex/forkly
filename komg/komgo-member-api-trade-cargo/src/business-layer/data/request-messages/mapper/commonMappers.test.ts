import { mapPeriod, mapDate } from './commonMappers'

describe('commonMappers', () => {
  it('mapPeriod mapper', () => {
    expect(mapPeriod(null)).toBeNull()
  })

  it('mapDate mapper', () => {
    const date = new Date()
    expect(mapDate(null)).toBeNull()
  })
})
