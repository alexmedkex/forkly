import * as React from 'react'
import { mount, shallow } from 'enzyme'

import { Verification, VerificationProps } from './Verification'
import { createMemoryHistory } from 'history'

import * as renderer from 'react-test-renderer'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

const testProps: VerificationProps = {
  errors: [],
  updatingErrors: [],
  isFetching: false,
  location: {
    search: '',
    pathname: 'test',
    state: '',
    hash: ''
  },
  history: createMemoryHistory(),
  match: {
    isExact: true,
    path: '',
    url: '',
    params: null
  },
  staticContext: undefined,
  registeredAt: 100,
  companyName: 'company name',
  metadataHash: 'metadata',
  getSession: () => jest.fn(),
  verifyDocument: () => jest.fn()
}

describe('Verification', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<Verification {...testProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('renders correct loading', () => {
    const props = { ...testProps, isFetching: true }
    const component = shallow(<Verification {...props} />)
    expect(component.find('[title="Verifying the document"]')).toHaveLength(1)
  })
  it('call calculate hash on file upload', () => {
    const props = { ...testProps, isFetching: true }
    const component = mount(<Verification {...props} />)
    const calculateHash = jest.fn()
    const instance: Verification = component.instance() as Verification
    instance.calculateHash = calculateHash
    component.find('#upload').simulate('change')
    expect(calculateHash).toHaveBeenCalledTimes(1)
  })
})
