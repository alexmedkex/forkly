import * as React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { shallow } from 'enzyme'
import { withLoaders } from './index'
import { fromJS } from 'immutable'
import { ErrorsState } from '../../store/common/types'
import { buildFakeError } from '../../store/common/faker'

const Label = props => <p>{props.errors}</p>

const mockStore = configureMockStore([thunk])

describe('withLoaders', () => {
  let store
  const type = 'DO_SOMETHING'
  const action = `${type}_REQUEST`
  const error = buildFakeError({ message: 'something failed' })

  beforeEach(() => {
    const initialState: ErrorsState = fromJS({
      errors: {
        byAction: {
          [type]: error
        }
      },
      loader: {
        requests: {
          [action]: true
        }
      }
    })
    store = mockStore(initialState)
  })

  it('injects errors', () => {
    const LabelWithError = withLoaders({ actions: [action] })(<Label />)
    const wrapper = shallow(<LabelWithError />, { context: { store } })
    expect(wrapper.props().errors).toEqual([error])
  })

  it('injects isFetching', () => {
    const LabelWithError = withLoaders({ actions: [action] })(<Label />)
    const wrapper = shallow(<LabelWithError />, { context: { store } })
    expect(wrapper.props().isFetching).toEqual(true)
  })

  describe('unmount', () => {
    it('clears errors', () => {
      const LabelWithError = withLoaders({ actions: [action] })(<Label />)
      const wrapper = shallow(<LabelWithError />, { context: { store } })
      wrapper
        .dive()
        .instance()
        .componentWillUnmount()
      expect(store.getActions()).toEqual([{ type: `${type}_CLEAR_ERROR` }])
    })
  })
})
