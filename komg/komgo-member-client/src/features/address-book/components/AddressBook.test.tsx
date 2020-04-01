import { Status, MemberType } from '@komgo/types'
import * as React from 'react'
import { shallow } from 'enzyme'
import { Button } from 'semantic-ui-react'

import {
  AddressBook,
  AddressBookProps,
  combineMembers,
  getMenuItem,
  getActionsMenu,
  getCompanyStatus,
  getConfirmContent,
  IProps
} from './AddressBook'
import * as renderer from 'react-test-renderer'
import { createMemoryHistory } from 'history'

const defaultProps: AddressBookProps = {
  companies: [],
  isFetching: false,
  isAuthorized: jest.fn(() => true),
  errors: [],
  getCompanies: jest.fn(),
  addCompanyToENS: jest.fn(),
  generateMember: jest.fn(),
  configureMQ: jest.fn(),
  toggleActivationMember: jest.fn(),
  history: {
    ...createMemoryHistory(),
    push: jest.fn()
  },
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  match: {
    isExact: true,
    path: '',
    url: '',
    params: {}
  },
  staticContext: undefined
}

const ensMembers = {
  1: {
    staticId: 1,
    x500Name: 'name1'
  },
  2: {
    staticId: 2,
    x500Name: 'name2'
  },
  3: {
    staticId: 3
  }
}

const onboardMembers = [
  {},
  {
    staticId: 2,
    x500Name: 'invalidName',
    someOtherProperty: true
  }
]

const props: IProps = {
  companies: [],
  onEdit: jest.fn(),
  onRowClick: jest.fn(),
  onGenerateMember: jest.fn(),
  onDeactivateCompany: jest.fn(),
  onOnboard: jest.fn(),
  onRegister: jest.fn(),
  onToggelConfirm: jest.fn()
}

describe('AddressBook', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<AddressBook {...defaultProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should merge companies', () => {
    expect(combineMembers(ensMembers, onboardMembers)).toEqual([
      { staticId: 1, x500Name: 'name1' },
      {
        staticId: 2,
        x500Name: 'name2',
        someOtherProperty: true
      }
    ])
  })

  it('should call history push when click on button Add New', () => {
    const wrapper = shallow(<AddressBook {...defaultProps} />)

    wrapper.find(Button).simulate('click')

    expect(defaultProps.history.push).toHaveBeenCalledWith('/address-book/new')
  })

  it('should call onEditClick when click on Edit item from dropdown', () => {
    const wrapper = shallow(<AddressBook {...defaultProps} />)
    const instance = wrapper.instance() as any

    instance.onEditClick(ensMembers[1].staticId)

    expect(defaultProps.history.push).toHaveBeenCalledWith(`/address-book/${ensMembers[1].staticId}?edit=true`)
  })

  it('should call onGenerateMemberClick when click on Genrate item from dropdown', () => {
    const wrapper = shallow(<AddressBook {...defaultProps} />)
    const instance = wrapper.instance() as any

    instance.onGenerateMemberClick(ensMembers[1].staticId)

    expect(defaultProps.generateMember).toHaveBeenCalledWith(ensMembers[1].staticId)
  })

  it('should call onOnboardClick when click on Onbording/Register item from dropdown', () => {
    const wrapper = shallow(<AddressBook {...defaultProps} />)
    const instance = wrapper.instance() as any

    instance.onOnboardClick('test', 'test')

    expect(defaultProps.addCompanyToENS).toHaveBeenCalledWith('test', 'test', 'Onboarding')
  })

  it("should render Unauthorized component if user doesn't have appropriate permissions", () => {
    const isAuthorized = jest.fn(() => false)
    const wrapper = shallow(<AddressBook {...defaultProps} isAuthorized={isAuthorized} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should unset staticId if onToggleConfirm was executed without param', () => {
    const wrapper = shallow(<AddressBook {...defaultProps} />)
    const instance = wrapper.instance() as AddressBook
    instance.setState({ staticId: 'test', showDiactivatingModal: true })

    instance.onToggelConfirm()

    expect(instance.state.staticId).toBe(null)
  })

  it('should trigger addCompanyToENS if was run onRegisterClick', () => {
    const wrapper = shallow(<AddressBook {...defaultProps} />)
    const instance = wrapper.instance() as AddressBook

    instance.onRegisterClick('test', 'test')

    expect(defaultProps.addCompanyToENS).toHaveBeenCalledWith('test', 'test', 'Onboarding')
  })

  describe('getMenuItem', () => {
    it('should render Dropdown.Item', () => {
      const action = jest.fn()
      const component = shallow(
        getMenuItem({
          menuName: 'Edit',
          staticId: 'static-id-1',
          action,
          label: 'label',
          companyName: 'companyName'
        })
      )
      expect(component.props()).toMatchObject({
        'data-test-id': 'Edit-static-id-1',
        name: 'Edit',
        children: 'label'
      })
    })

    it('should call action on click', () => {
      const action = jest.fn()
      const component = shallow(
        getMenuItem({
          menuName: 'Edit',
          staticId: 'static-id-1',
          action,
          label: 'label',
          companyName: 'companyName'
        })
      )

      component.prop('onClick')()

      expect(action).toHaveBeenCalledWith('static-id-1', 'companyName')
    })
  })

  describe('getActionsMenu', () => {
    it('should render Edit and Generate Member Package menu items for companies with status Draft', () => {
      const menu = getActionsMenu(
        {
          staticId: 'static-id-1',
          status: Status.Draft,
          isMember: 'Yes',
          companyName: 'company name',
          memberType: MemberType.Empty
        },
        props
      )

      const menuItemNames = menu.map(item => shallow(item).prop('children'))

      expect(menuItemNames).toEqual(['Edit', 'Generate Member Package'])
    })

    it('should render Edit and Onboard menu items for companies with status Ready and isMember=true', () => {
      const menu = getActionsMenu(
        {
          staticId: 'static-id-1',
          status: Status.Ready,
          isMember: 'Yes',
          companyName: 'company name',
          memberType: MemberType.Empty
        },
        props
      )

      const menuItemNames = menu.map(item => shallow(item).prop('children'))

      expect(menuItemNames).toEqual(['Edit', 'Onboard'])
    })

    it('should render Edit and Register menu items for companies with status Ready and isMember=false', () => {
      const menu = getActionsMenu(
        {
          staticId: 'static-id-1',
          status: Status.Ready,
          isMember: 'No',
          companyName: 'company name',
          memberType: MemberType.Empty
        },
        props
      )

      const menuItemNames = menu.map(item => shallow(item).prop('children'))

      expect(menuItemNames).toEqual(['Edit', 'Register'])
    })
  })

  describe('getActionsMenu - Deactivation', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV }
      process.env.REACT_APP_ALLOW_FEATURE_TOGGLES = 'true'
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = 'deactivation'
    })

    afterEach(() => {
      process.env = OLD_ENV
    })

    it('should render Edit and Deactivate company menu items for companies with status Onboarded and isMember=yes', () => {
      const menu = getActionsMenu(
        {
          staticId: 'static-id-1',
          status: Status.Onboarded,
          isMember: 'yes',
          companyName: 'company name',
          memberType: MemberType.Empty
        },
        props
      )

      const menuItemNames = menu.map(item => shallow(item).prop('children'))
      expect(menuItemNames).toEqual(['Edit', 'Deactivate company'])
    })

    it('should render Edit and Deactivate company menu items for companies with status Registered and isMember=false', () => {
      const menu = getActionsMenu(
        {
          staticId: 'static-id-1',
          status: Status.Registered,
          isMember: 'false',
          companyName: 'company name',
          memberType: MemberType.Empty
        },
        props
      )

      const menuItemNames = menu.map(item => shallow(item).prop('children'))
      expect(menuItemNames).toEqual(['Edit', 'Deactivate company'])
    })
  })

  describe('getCompanyStatus', () => {
    it('should return status as is if status was set for company', () => {
      expect(getCompanyStatus('No', Status.Ready)).toEqual(Status.Ready)
      expect(getCompanyStatus('No', Status.Draft)).toEqual(Status.Draft)
    })

    it('should return status Onboarded for member without status', () => {
      const status = getCompanyStatus('Yes')
      expect(status).toEqual(Status.Onboarded)
    })

    it('should return status Registered for none member without status', () => {
      const status = getCompanyStatus('No')
      expect(status).toEqual(Status.Registered)
    })
  })

  describe('getConfirmContent', () => {
    it('should return message with company name', () => {
      const name = 'TEST'
      const modalMessage = <div className="content">Do you really want to deactivate {name}?</div>
      expect(getConfirmContent(name)).toEqual(modalMessage)
    })
  })

  describe('Deactivation member', () => {
    it('should call onDeactivateCompanyClick when click on Deactivation Company button', () => {
      const wrapper = shallow(<AddressBook {...defaultProps} />)
      const instance = wrapper.instance() as AddressBook
      instance.setState({ staticId: 'test' })
      instance.onToggelConfirm = jest.fn()

      instance.onDeactivateCompanyClick()

      expect(instance.onToggelConfirm).toHaveBeenCalled()
      expect(defaultProps.toggleActivationMember).toHaveBeenCalledWith('test', false)
    })

    it('should hide Confirmation when click on Cancel', () => {
      const wrapper = shallow(<AddressBook {...defaultProps} />)
      const instance = wrapper.instance() as AddressBook
      instance.setState({ staticId: '', showDiactivatingModal: true })

      instance.onToggelConfirm()

      expect(instance.state.showDiactivatingModal).toBe(false)
    })

    it('should show Confirmation when click on Deactivate', () => {
      const wrapper = shallow(<AddressBook {...defaultProps} />)
      const instance = wrapper.instance() as AddressBook
      instance.setState({ staticId: '', showDiactivatingModal: false })

      instance.onToggelConfirm()

      expect(instance.state.showDiactivatingModal).toBe(true)
    })

    it('should set staticId if onToggelConfirm was executed with param', () => {
      const wrapper = shallow(<AddressBook {...defaultProps} />)
      const instance = wrapper.instance() as AddressBook
      instance.setState({ staticId: '', showDiactivatingModal: false })

      instance.onToggelConfirm('test')

      expect(instance.state.staticId).toBe('test')
    })
  })
})
