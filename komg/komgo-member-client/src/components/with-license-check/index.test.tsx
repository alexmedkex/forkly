import * as React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { shallow } from 'enzyme'
import { withLicenseCheck, WithLicenseCheckProps } from './index'
import { fromJS, Map } from 'immutable'
import { productLC } from '@komgo/products'

const mockStore = configureMockStore([thunk])

describe('withLicenseCheck', () => {
  let store

  beforeEach(() => {
    const initialState = fromJS({
      uiState: Map({ profile: { company: 'bank' } }),
      members: fromJS({
        byStaticId: {
          bank: { komgoProducts: [productLC] }
        }
      })
    })
    store = mockStore(initialState)
  })

  it('should return true', () => {
    const WrappedComponent = withLicenseCheck(() => <div />)
    const component = shallow(<WrappedComponent />, { context: { store } })
    const hasLicense = component
      .dive<WithLicenseCheckProps, any>()
      .props()
      .isLicenseEnabled(productLC)
    expect(hasLicense).toEqual(true)
  })
})
