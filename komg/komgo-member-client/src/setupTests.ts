import 'jest-localstorage-mock'
import 'jest-styled-components'
import '@testing-library/jest-dom/extend-expect'
import '@testing-library/react/cleanup-after-each'
import { toMatchDiffSnapshot } from 'snapshot-diff'
import enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { configure } from '@testing-library/react'

import axiosInstance from './utils/axios'

enzyme.configure({ adapter: new Adapter() })

// testing library data test ID
configure({ testIdAttribute: 'data-test-id' })

// snapshot-diff/extend-expect seems not to work
expect.extend({ toMatchDiffSnapshot })

// remove axios interceptor that refreshes JWT
axiosInstance.interceptors.request.eject(0)
