import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface WithStaticId {
  staticId: string
}

interface IProps<Item> {
  item: Item
  canCrud: boolean
  baseFeatureUrl: string
  handleRemove(item: Item): void
}

class ActionMenu<Item extends WithStaticId> extends React.Component<IProps<Item>> {
  constructor(props: IProps<Item>) {
    super(props)

    this.handleRemoveItem = this.handleRemoveItem.bind(this)
  }

  handleRemoveItem() {
    this.props.handleRemove(this.props.item)
  }

  render() {
    const { canCrud, item, baseFeatureUrl } = this.props
    return (
      <Dropdown inline={true} icon={'ellipsis horizontal'} direction={'left'}>
        <Dropdown.Menu>
          <Dropdown.Item data-test-id="view-details">
            <StyledLink className="link-as-text" to={`${baseFeatureUrl}/${item.staticId}`}>
              View details
            </StyledLink>
          </Dropdown.Item>
          {canCrud && (
            <Dropdown.Item data-test-id="edit">
              <StyledLink className="link-as-text" to={`${baseFeatureUrl}/${item.staticId}/edit`}>
                Edit
              </StyledLink>
            </Dropdown.Item>
          )}
          {canCrud && (
            <Dropdown.Item onClick={this.handleRemoveItem} data-test-id="remove">
              Remove
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

const StyledLink = styled(Link)`
  display: block;
`

export default ActionMenu
