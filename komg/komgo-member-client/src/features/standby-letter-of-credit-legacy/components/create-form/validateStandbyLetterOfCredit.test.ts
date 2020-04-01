import { validateStandbyLetterOfCredit, isStandbyLetterOfCreditValid } from './validateStandbyLetterOfCredit'
import { buildFakeStandByLetterOfCreditBase, IStandbyLetterOfCreditBase } from '@komgo/types'

describe('validateStandbyLetterOfCredit', () => {
  let fakeSBLCBase: IStandbyLetterOfCreditBase
  beforeEach(() => {
    fakeSBLCBase = buildFakeStandByLetterOfCreditBase()
  })
  it('returns empty object with a fakeSBLCBase', () => {
    expect(validateStandbyLetterOfCredit(fakeSBLCBase)).toEqual({})
  })
  it('returns a validation error if the amount is below 0.01', () => {
    fakeSBLCBase.amount = 0
    expect(validateStandbyLetterOfCredit(fakeSBLCBase)).toEqual({
      amount: "'amount' should be greater than or equal to 0.01"
    })
  })
  it('returns a validation error if the contract reference is empty', () => {
    fakeSBLCBase.contractReference = ''
    expect(validateStandbyLetterOfCredit(fakeSBLCBase)).toEqual({
      contractReference: "'contractReference' should NOT be shorter than 1 characters"
    })
  })
  it('returns a validation error if the expiry date is empty', () => {
    fakeSBLCBase.expiryDate = ''
    expect(validateStandbyLetterOfCredit(fakeSBLCBase)).toEqual({
      expiryDate: '\'expiryDate\' should match format "date"'
    })
  })
  it('returns a validation error if the contract date is empty', () => {
    fakeSBLCBase.contractDate = ''
    expect(validateStandbyLetterOfCredit(fakeSBLCBase)).toEqual({
      contractDate: '\'contractDate\' should match format "date"'
    })
  })
  it('returns a validation error if the override template data is empty', () => {
    fakeSBLCBase.overrideStandardTemplate = ''
    expect(validateStandbyLetterOfCredit(fakeSBLCBase)).toEqual({
      overrideStandardTemplate: "'overrideStandardTemplate' should NOT be shorter than 1 characters"
    })
  })
})

describe('isStandbyLetterOfCreditValid', () => {
  let fakeSBLCBase: IStandbyLetterOfCreditBase
  beforeEach(() => {
    fakeSBLCBase = buildFakeStandByLetterOfCreditBase()
    fakeSBLCBase.expiryDate = '2099-10-11' // TODO to the poor sod who is changing this code in 2099, update the date or mock moment
  })

  it('returns true for a valid SBLC', () => {
    expect(isStandbyLetterOfCreditValid(fakeSBLCBase)).toEqual(true)
  })
  it('returns false for an invalid SBLC', () => {
    fakeSBLCBase.amount = -3
    expect(isStandbyLetterOfCreditValid(fakeSBLCBase)).toEqual(false)
  })
  it('returns false when date is in the past', () => {
    fakeSBLCBase.expiryDate = '2000-10-11'
    expect(isStandbyLetterOfCreditValid(fakeSBLCBase)).toEqual(false)
  })
})
