import { shallow } from 'enzyme'
import { List } from 'immutable'
import * as React from 'react'

import PermissionsTab, { processBulk } from './PermissionsTab'

const product: any = {
  id: 'kyc',
  label: 'KYC',
  actions: [
    {
      id: 'manageKyc',
      label: 'Manage KYC',
      permissions: [{ id: 'readOnly', label: 'Read' }, { id: 'createAndShare', label: 'Create And Share' }]
    },
    {
      id: 'manageSomethingElse',
      label: 'Manage Something Else',
      permissions: [{ id: 'readOnly', label: 'Read' }, { id: 'createAndShare', label: 'Create And Share' }]
    }
  ]
}

const props: any = {
  isAuthorized: jest.fn(() => true),
  role: {
    id: 'kycAdmin',
    label: 'KYC Admin',
    description: 'KYC Admin Role Description',
    permittedActions: [
      {
        product: {
          id: 'kyc',
          label: 'KYC'
        },
        action: {
          id: 'manageKyc',
          label: 'Manage KYC'
        },
        permission: { id: 'createAndShare', label: 'Create And Share' }
      }
    ]
  },
  products: List([
    product,
    {
      id: 'kyc2',
      label: 'KYC'
    }
  ]),
  formValues: {
    permissions: {
      'kyc:manageKyc': 'read'
    }
  }
}

const form: any = {
  values: {
    permissions: {}
  },
  setFieldValue(name: string, value: string) {
    this.values[name] = value
  }
}

describe('PermissionsTab', () => {
  it('renders permissions tab', () => {
    const component = shallow(<PermissionsTab {...props} />)
    expect(component.find('Styled(Tab)').props()).toMatchObject({
      menu: { fluid: true, vertical: true, tabular: true },
      renderActiveOnly: false,
      panes: expect.any(Array)
    })
  })
  it('correctly processes bulk action for form without actions selected', () => {
    processBulk(product, false, form, true)
    expect(form.values['permissions.kyc:manageKyc']).toBe('readOnly')
    expect(form.values['permissions.kyc:manageSomethingElse']).toBe('readOnly')
    expect(form.values['rowCheckboxes.kyc:manageKyc']).toBe(true)
    expect(form.values['rowCheckboxes.kyc:manageSomethingElse']).toBe(true)
  })
  it('correctly processes bulk action with a fully selected form', () => {
    processBulk(product, true, form, false)
    expect(form.values['permissions.kyc:manageKyc']).toBeUndefined()
    expect(form.values['permissions.kyc:manageSomethingElse']).toBeUndefined()
    expect(form.values['rowCheckboxes.kyc:manageKyc']).toBe(false)
    expect(form.values['rowCheckboxes.kyc:manageSomethingElse']).toBe(false)
  })
})
