import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'

const RemoveDropdown: React.SFC = () => (
  <Dropdown icon="ellipsis horizontal" style={{ float: 'right' }}>
    <Dropdown.Menu direction="left">
      {' '}
      <Dropdown.Item text="Remove" />{' '}
    </Dropdown.Menu>
  </Dropdown>
)

export default RemoveDropdown
