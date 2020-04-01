import * as React from 'react'

import { RemoveLicenseModal } from './RemoveLicenseModal'
import * as renderer from 'react-test-renderer'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

const testProps = {
  updatingLicense: {
    productId: 'productId',
    productName: 'productName',
    memberId: 'memberId',
    memberName: 'memberName',
    enable: false
  },
  onClose: () => jest.fn(),
  removeLicense: () => jest.fn()
}

describe('Licenses', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<RemoveLicenseModal {...testProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
