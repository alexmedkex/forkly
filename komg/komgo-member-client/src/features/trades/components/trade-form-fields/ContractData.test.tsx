import * as React from 'react'
import * as renderer from 'react-test-renderer'
import ContractData from './ContractData'
import { FormikProvider, FormikContext } from 'formik'
import { ICreateOrUpdateTrade } from '../../store/types'
import { fakeFormikContext } from '../../../../store/common/faker'
import { buildFakeTrade, buildFakeCargo, buildFakeParcel, ITrade, Law } from '@komgo/types'

const contractDataTrade: ITrade = {
  ...buildFakeTrade(),
  contractReference: 'MY_REF',
  contractDate: '2019-07-19',
  generalTermsAndConditions: 'MY_t&cs',
  law: Law.NewYorkLaw
}

describe('ContractData component', () => {
  let formikContext: FormikContext<ICreateOrUpdateTrade>

  beforeEach(() => {
    formikContext = fakeFormikContext<ICreateOrUpdateTrade>({
      trade: contractDataTrade,
      cargo: buildFakeCargo({
        parcels: [
          buildFakeParcel({
            destinationPlace: 'Test',
            loadingPlace: 'Test',
            deemedBLDate: '2019-01-03',
            quantity: 1
          })
        ]
      }),
      documents: []
    })
  })

  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <FormikProvider value={formikContext}>
            <ContractData isDisabled={() => false} />
          </FormikProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
