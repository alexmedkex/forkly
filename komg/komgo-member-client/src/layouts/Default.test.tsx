import { shallow } from 'enzyme'
import * as React from 'react'
import * as ShallowRenderer from 'react-test-renderer/shallow'

jest.mock('../utils/is-authorized', () => ({ isAuthorized: () => true }))

import { DefaultLayout, StyledError } from './Default'
import { LoadingTransition } from '../components/loading-transition'

const defaultProps: any = {
  sidebarExtended: false,
  profile: true,
  location: '',
  children: 'test',
  isFetching: false,
  errors: [],
  getProfile: () => null,
  fetchMembers: () => null
}

describe('DefaultLayout Component', () => {
  it('should render DefaultLayout component', () => {
    // Arrange
    const wrapper = shallow(<DefaultLayout {...defaultProps} />)

    // Act
    const result = wrapper.exists()

    // Assert
    expect(result).toBe(true)
  })

  it('should render a DefaultLayout match to snapshot', () => {
    // Arrange
    const renderer = ShallowRenderer.createRenderer()
    renderer.render(<DefaultLayout {...defaultProps} />)

    // Act
    const DefaultLayoutToJson = renderer.getRenderOutput()

    // Assert
    expect(DefaultLayoutToJson).toMatchSnapshot()
  })

  it('should call profileSuccess when mounted', () => {
    // Arrange
    const mockGetProfile = jest.fn()
    const wrapper = shallow(<DefaultLayout {...defaultProps} getProfile={mockGetProfile} />)

    // Assert
    expect(wrapper).toBeDefined()
    expect(mockGetProfile).toHaveBeenCalled()
  })

  it('should render loading', () => {
    // Arrange
    const defaultLoadingProps = { ...defaultProps, isFetching: true }
    const defaultLayout = shallow(<DefaultLayout {...defaultLoadingProps} />)

    // Assert
    expect(defaultLayout.find(LoadingTransition).prop('title')).toEqual('Loading profile')
    expect(defaultLayout.find(LoadingTransition).prop('imageSize')).toEqual('tiny')
  })

  it('should render error', () => {
    // Arrange
    const defaultLayout = shallow(<DefaultLayout {...defaultProps} errors={[{ message: 'Error' }]} />)

    // Assert
    expect(defaultLayout.find(StyledError).length).toBe(1)
  })

  it('should render "Loading companies" message', () => {
    // Arrange
    const defaultLoadingProps = { ...defaultProps, companyListIsEmpty: true }
    const defaultLayout = shallow(<DefaultLayout {...defaultLoadingProps} />)

    // Assert
    expect(defaultLayout.find(LoadingTransition).prop('title')).toEqual('Loading companies')
    expect(defaultLayout.find(LoadingTransition).prop('imageSize')).toEqual('tiny')
  })
})
