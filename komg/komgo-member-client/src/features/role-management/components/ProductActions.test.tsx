import { shallow } from 'enzyme'
import { List } from 'immutable'
import * as React from 'react'

import ProductActions from './ProductActions'

const props: any = {
  product: {
    id: 'kyc',
    label: 'KYC',
    actions: [
      {
        id: 'manageKyc',
        label: 'Manage KYC',
        permissions: [{ id: 'createAndShare', label: 'Create And Share' }]
      },
      {
        id: 'readKyc',
        label: 'read KYC',
        permissions: [{ id: 'read', label: 'Read' }]
      }
    ]
  },
  formValues: {
    rowCheckboxes: {
      'kyc:manageKyc': false,
      'kyc:readKyc': true
    }
  }
}

describe('ProductActions', () => {
  it('renders two actions', () => {
    const component = shallow(<ProductActions {...props} />)
    expect(component.find({ productId: 'kyc' }).length).toEqual(2)
  })

  it('renders two actions', () => {
    const component = shallow(<ProductActions {...props} />)
    expect(
      component
        .find({ productId: 'kyc' })
        .first()
        .props()
    ).toMatchObject({
      productId: 'kyc',
      action: {
        id: 'manageKyc',
        label: 'Manage KYC',
        permissions: [{ id: 'createAndShare', label: 'Create And Share' }]
      }
    })
  })
})
