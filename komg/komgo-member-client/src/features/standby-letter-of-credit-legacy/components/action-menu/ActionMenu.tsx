import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { IStandByLetterOfCreditEnriched } from '../../containers/StandByLetterOfCreditDashboard'

interface IProps {
  letter: IStandByLetterOfCreditEnriched
}

class ActionMenu extends React.Component<IProps> {
  render() {
    const { letter } = this.props
    return (
      <Dropdown inline={true} icon={'ellipsis horizontal'} direction={'left'}>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link className="link-as-text" to={`/financial-instruments/standby-letters-of-credit/${letter.staticId}`}>
              View SBLC details
            </Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default ActionMenu
