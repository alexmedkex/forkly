import * as React from 'react'
import { shallow } from 'enzyme'
import { productKYC, productLC } from '@komgo/products'

import { Licenses, ILicensesProps, memberLicenseSelector } from './Licenses'
import { SearchProps } from 'semantic-ui-react'
import { ServerError } from '../../../store/common/types'
import { fromJS, List } from 'immutable'

const testProps: ILicensesProps = {
  errors: [],
  updatingErrors: [],
  updating: false,
  isFetching: false,
  products: [productKYC, productLC],
  customers: [
    {
      staticId: 'staticId-1',
      x500Name: { O: 'Company Name 1' },
      enabledProductIds: ['LC'],
      licenses: [
        {
          productId: 'KYC',
          productName: 'KYC',
          enabled: false
        },
        {
          productId: 'LC',
          productName: 'LC',
          enabled: true
        }
      ]
    }
  ],
  enableLicense: (memberStaticId: string, productId: string) => jest.fn(),
  disableLicense: (memberStaticId: string, productId: string) => jest.fn(),
  isAuthorized: () => true
}

describe('Licenses', () => {
  it('renders correct company name', () => {
    const component = shallow(<Licenses {...testProps} />)

    expect(
      component
        .find('[data-test-id] Styled(TableCell)')
        .at(0)
        .prop('children')
    ).toBe('Company Name 1')
  })

  it('renders correct checkbox value', () => {
    const component = shallow(<Licenses {...testProps} />)

    expect(
      component
        .find('[data-test-id="company-static-id.staticId-1"] Checkbox')
        .at(1)
        .props()
    ).toMatchObject({ checked: true, disabled: false })
  })

  it('renders company Gunvor if search state is "gun"', async () => {
    const props = {
      ...testProps,
      customers: [
        {
          ...testProps.customers[0],
          staticId: 'staticId-2',
          x500Name: { O: 'Gunvor' }
        },
        ...testProps.customers
      ]
    }

    const component = shallow(<Licenses {...props} />).setState({ search: 'gun' })

    expect(component.find('TableRow[data-test-id]').length).toBe(1)
    expect(
      component
        .find('[data-test-id] Styled(TableCell)')
        .at(0)
        .prop('children')
    ).toBe('Gunvor')
  })

  it('updates state on search input', async () => {
    const component = shallow(<Licenses {...testProps} />)
    const handleSearchCallback: any = component.find('CustomSearch').prop('handleSearch')
    const data: SearchProps = {
      value: 'gunvor'
    }
    handleSearchCallback(null, data)

    expect(component.state('search')).toBe('gunvor')
  })

  it('renders an error on update', async () => {
    const updatingErrors = [{ message: 'Oops', errorCode: 'E1', requestId: '123', origin: 'my-api' }]
    const props: ILicensesProps = {
      ...testProps,
      updatingErrors
    }

    const component = shallow(<Licenses {...props} />)

    expect(component.find('ErrorMessage').prop('error')).toBe('Oops')
  })

  it('renders an error page load', async () => {
    const error: ServerError = { message: 'Oops', errorCode: 'E1', requestId: '123', origin: 'my-api' }
    const props = {
      ...testProps,
      errors: [error]
    }

    const component = shallow(<Licenses {...props} />)

    expect(component.find('ErrorMessage').prop('error')).toBe('Oops')
  })
  it('should call toggleVisible with false param when Cancel is clicked', () => {
    const wrapper = shallow(<Licenses {...testProps} />)
    wrapper
      .find('Checkbox')
      .at(0)
      .simulate('change', {}, { checked: true })
    expect(wrapper.state().mode).toEqual(0)
  })
})

describe('memberLicenseSelector', () => {
  it('should return customerLicenses from memberLicenseSelector', () => {
    const products = [productKYC, productLC]

    const members = fromJS([
      {
        staticId: '1',
        isMember: true,
        isFinancialInstitution: true,
        vaktStaticId: '01',
        komgoProducts: products,
        x500Name: {
          CN: 'common name 1',
          O: 'Company Name 1',
          C: 'country 1',
          L: 'locality city 1',
          STREET: 'street 1',
          PC: '00001'
        }
      },
      {
        staticId: '2',
        isMember: false,
        isFinancialInstitution: true,
        vaktStaticId: '02',
        komgoProducts: products,
        x500Name: {
          CN: 'common name 2',
          O: 'Company Name 2',
          C: 'country 2',
          L: 'locality city 2',
          STREET: 'street 2',
          PC: '00002'
        }
      }
    ])

    const customerLicenses = memberLicenseSelector(members)

    const expCustomerLicenses = List([
      {
        enabledProductIds: ['KYC', 'LC'],
        licenses: [
          { enabled: true, productId: 'KYC', productName: 'KYC' },
          { enabled: true, productId: 'LC', productName: 'LC / SBLC' },
          { enabled: false, productId: 'RD', productName: 'Receivables discounting' },
          { enabled: false, productId: 'CA', productName: 'Credit Appetite' }
        ],
        staticId: '1',
        x500Name: {
          C: 'country 1',
          CN: 'common name 1',
          L: 'locality city 1',
          O: 'Company Name 1',
          PC: '00001',
          STREET: 'street 1'
        }
      }
    ])

    expect(customerLicenses).toEqual(expCustomerLicenses)
  })
})
