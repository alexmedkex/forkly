import { MemberType } from '@komgo/types'
import * as renderer from 'react-test-renderer'
import * as React from 'react'
import { EditCompany } from './EditCompany'
import { createMemoryHistory } from 'history'
import { shallow, mount } from 'enzyme'
import { ModalPrompt } from '../../../components/modal-prompt/ModalPrompt'
import { Button } from 'semantic-ui-react'

const push = jest.fn()
const updateCompany = jest.fn()
const company = {
  x500Name: {
    PC: 'PC',
    CN: 'CN',
    C: 'C',
    STREET: 'STREET',
    L: 'L',
    O: 'O'
  },
  isFinancialInstitution: true,
  hasSWIFTKey: true,
  isMember: true,
  memberType: MemberType.FMS,
  staticId: 'staticId',
  vaktStaticId: ''
}
const testProps = {
  getCompany: () => jest.fn(),
  updateCompany,
  createCompany: () => jest.fn(),
  clearError: () => jest.fn(),
  staticId: 'staticId',
  isModification: true,
  company,
  history: { ...createMemoryHistory(), push },
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
    params: {
      id: 'id'
    }
  },
  staticContext: undefined,
  isFetching: false
}

describe('Edit company', () => {
  it('should match snapshot edit', () => {
    const tree = renderer.create(<EditCompany {...testProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('should match snapshot view', () => {
    const newProps = { ...testProps, isModification: false }
    const tree = renderer.create(<EditCompany {...newProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('should match snapshot add new company', () => {
    const newProps = { ...testProps, staticId: undefined }
    const tree = renderer.create(<EditCompany {...newProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('should match snapshot render errors', () => {
    const error = {
      message: 'message',
      errorCode: 'EVAL01',
      requestId: 'requestId',
      origin: 'api-onboarding',
      fields: { isFinancialInstitution: ['is empty'] }
    }
    const newProps = { ...testProps, errors: [error] }
    const tree = renderer.create(<EditCompany {...newProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('should redirect to new page on submit', () => {
    const wrapper = shallow(<EditCompany {...testProps} />)
    const instance = wrapper.instance() as EditCompany
    instance.handleSubmit(company)
    expect(updateCompany).toHaveBeenCalled()
  })
  it('should redirect to new page on close', () => {
    const wrapper = shallow(<EditCompany {...testProps} />)
    const instance = wrapper.instance() as EditCompany
    instance.onClose()
    expect(push).toHaveBeenCalled()
  })
  it('should redirect to new page on edit', () => {
    const wrapper = shallow(<EditCompany {...testProps} />)
    const instance = wrapper.instance() as EditCompany
    instance.onEditClick()
    expect(push).toHaveBeenCalled()
  })
  it('should call submit when button for submit is pressed', () => {
    const wrapper = mount(<EditCompany {...testProps} />)

    wrapper.setState({ openModalDeleteVakt: true })
    wrapper
      .find(ModalPrompt)
      .find(Button)
      .at(1)
      .simulate('click')

    expect(testProps.updateCompany).toHaveBeenCalled()
  })

  it('should call cancelSubmit when button for submit is pressed', () => {
    const wrapper = mount(<EditCompany {...testProps} />)

    wrapper.setState({ openModalDeleteVakt: true })
    wrapper
      .find(ModalPrompt)
      .find(Button)
      .at(0)
      .simulate('click')

    expect(wrapper.state().open).toBeFalsy()
  })

  it('should render correct VAKT messaging key info from ENS', () => {
    const key = '{"kty":"RSA","kid":"kid-1","e":"e-1","n":"n-1"}'
    const termDate = 1593017035000
    const props = {
      ...testProps,
      company: {
        ...testProps.company,
        vaktStaticId: 'test-vakt-id',
        vaktMnid: 'test-vakt-mnid',
        vaktMessagingPubKeys: [
          {
            current: false,
            key: '{"kty":"RSA","kid":"kid-0","e":"e-0","n":"n-0"}',
            revoked: true,
            termDate: 1593017035001
          },
          {
            current: true,
            key,
            revoked: false,
            termDate
          }
        ]
      }
    }
    const expectedKey = {
      key: JSON.parse(key),
      validTo: new Date(termDate).toISOString()
    }

    const wrapper = mount(<EditCompany {...props} />)
    const keyText = wrapper
      .find('[data-test-id="vakt-info-messagingPublicKey"] textarea')
      .at(0)
      .text()
    const actualKey = JSON.parse(keyText)

    expect(actualKey).toMatchObject(expectedKey)
  })
})
