import React from 'react'
import { render } from '@testing-library/react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { FormikProvider } from 'formik'
import { InterestType } from '@komgo/types'
import { IInterestTypeFieldProps, InterestTypeField } from './InterestTypeField'

describe('InterestTypeField', () => {
  let testProps: IInterestTypeFieldProps

  beforeEach(() => {
    testProps = {
      formik: fakeFormikContext({}) as any,
      interestType: InterestType.CostOfFunds,
      defaultCofDate: new Date('2019-08-08')
    }
  })

  it('should render correctly for InterestType = COF', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <InterestTypeField {...testProps} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render correctly for PricingType = Libor', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <InterestTypeField {...testProps} interestType={InterestType.Libor} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render correctly for PricingType = AddOnLibor', () => {
    const formik = fakeFormikContext({}) as any

    expect(
      render(
        <FormikProvider value={formik}>
          <InterestTypeField {...testProps} interestType={InterestType.AddOnLibor} />
        </FormikProvider>
      ).asFragment()
    ).toMatchSnapshot()
  })
})
