import { gradeIsAllowedValue } from './checkGrade'
import uuid from 'uuid'
import { Grade } from '@komgo/types'

describe('checkGrade', () => {
  it('returns true for allowed values of grade', () => {
    expect(gradeIsAllowedValue('brent')).toEqual(true)
    expect(gradeIsAllowedValue('OSEBERG')).toEqual(true)
    expect(gradeIsAllowedValue('tRoLl')).toEqual(true)
    expect(gradeIsAllowedValue('eKOFISK')).toEqual(true)
    expect(gradeIsAllowedValue('forties')).toEqual(true)
    expect(gradeIsAllowedValue(Grade.Brent)).toEqual(true)
  })
  it('returns false for other values', () => {
    expect(gradeIsAllowedValue(uuid())).toEqual(false)
    expect(gradeIsAllowedValue(undefined)).toEqual(false)
  })
})
