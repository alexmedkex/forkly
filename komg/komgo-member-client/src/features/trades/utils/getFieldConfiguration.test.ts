import { getFieldConfiguration } from './getFieldConfiguration'

describe('getFieldConfiguration function', () => {
  it('should return null if description is undefined', () => {
    expect(getFieldConfiguration(undefined)).toBe(null)
  })
  it('should return configuration appropriate configuration object', () => {
    expect(getFieldConfiguration('Test')).toEqual({ tooltipValue: 'Test', maxLengthOfValue: 1000 })
  })
  it('should return configuration appropriate configuration object', () => {
    expect(getFieldConfiguration('Test', 300)).toEqual({ tooltipValue: 'Test', maxLengthOfValue: 300 })
  })
})
