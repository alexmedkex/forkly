import { getErrorForSpecificField } from './validation'
import { ICreateOrEditCreditLineForm } from '../store/types'
import { fakeFormikContext } from '../../../store/common/faker'
import { truncateSync } from 'fs'
import { createInitialCreditLine } from './factories'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'

const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

describe('getErrorForSpecificField', () => {
  it('should return empty string', () => {
    const fakeFormik = fakeFormikContext<ICreateOrEditCreditLineForm>(initialRiskCoverValues)

    expect(getErrorForSpecificField('creditLimit', fakeFormik)).toBe('')
  })

  it('should return error', () => {
    const fakeFormik = fakeFormikContext<ICreateOrEditCreditLineForm>(initialRiskCoverValues, {
      errors: { creditLimit: "'creditLimit' error" },
      touched: { creditLimit: truncateSync },
      setFieldValue: () => null
    })

    expect(getErrorForSpecificField('creditLimit', fakeFormik)).toBe('Error')
  })
})
