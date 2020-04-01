import React from 'react'
import { Dropdown, Header } from 'semantic-ui-react'
import { SPACES, Table, violetBlue } from '@komgo/ui-components'
import { IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'
import { RouteComponentProps } from 'react-router'
import { displayDate } from '../../../utils/date'
import { NavLink } from 'react-router-dom'
import { Spacer } from '../../../components/spacer/Spacer'

import { TopHeader } from '../../templates/components/TopHeader'
import { formatMonetaryAmount } from '../../receivable-discounting-legacy/utils/formatters'
import { ActionStatus } from './ActionStatus'
import { Status } from './Status'
import { Task, TaskStatus } from '../../tasks/store/types'
import { ILetterOfCreditEnriched, LETTER_OF_CREDIT_TYPE_LABELS } from '../store/types'
import RoleInfo from './RoleInfo'
import { hasSomeCounterpartiesOffPlatform } from '../utils/hasSomeCounterpartiesOffPlatform'

export interface LetterOfCreditDashboardProps extends RouteComponentProps<any> {
  tasks: Task[]
  standbyLetters: number
  documentaryLetters: number
  lettersOfCredit: ILetterOfCreditEnriched[]
}

export const Link = props => {
  return (
    <NavLink
      style={{ color: '#000', fontWeight: '700', marginRight: `${SPACES.SMALL}` }}
      activeStyle={{ color: violetBlue, textDecoration: 'none' }}
      isActive={(_, { search, pathname }) => {
        return `${pathname}${search}` === `${props.to}`
      }}
      {...props}
    />
  )
}

export const LetterOfCreditDashboard = ({
  history,
  lettersOfCredit,
  documentaryLetters,
  standbyLetters,
  tasks
}: LetterOfCreditDashboardProps) => {
  const buildColumns = () => {
    const columns = [
      {
        accessor: 'reference',
        title: 'Reference',
        cell: (letter: ILetterOfCreditEnriched) => {
          return <span>{letter.reference}</span>
        }
      },
      {
        accessor: 'issuingBankReference',
        title: 'Issuing bank reference',
        cell: (letter: ILetterOfCreditEnriched) => {
          return <span>{letter.templateInstance.data.issuingBankReference}</span>
        }
      },
      {
        accessor: 'expiry',
        title: 'Expiry',
        cell: (letter: ILetterOfCredit<IDataLetterOfCredit>) => {
          return <span>{hasSomeCounterpartiesOffPlatform(letter) ? '-' : letter.templateInstance.data.expiryDate}</span>
        }
      },
      {
        accessor: 'latestShipment',
        title: 'Latest shipment / delivery',
        cell: (letter: ILetterOfCreditEnriched) => {
          return <span>{displayDate(letter.latestShipment)}</span>
        }
      },
      {
        accessor: 'role',
        title: 'role',
        cell: (letter: ILetterOfCreditEnriched) => {
          return <RoleInfo letter={letter} />
        }
      },
      {
        accessor: 'amount',
        title: 'amount',
        cell: (letter: ILetterOfCredit<IDataLetterOfCredit>) => {
          const { amount, currency } = letter.templateInstance.data
          return <span>{hasSomeCounterpartiesOffPlatform(letter) ? '-' : formatMonetaryAmount(amount, currency)}</span>
        }
      },
      {
        accessor: 'status',
        title: 'status',
        cell: (letter: ILetterOfCredit<IDataLetterOfCredit>) => {
          return <Status status={letter.status} />
        }
      },
      {
        accessor: 'action',
        title: 'action',
        cell: (letter: ILetterOfCreditEnriched) => {
          return <ActionStatus actionStatus={letter.actionStatus} />
        }
      }
    ]

    return columns
  }
  const buildActionsMenu = (tasks: Task[]) => {
    return letter => {
      const [task] = tasks.filter(t => t.context.staticId === letter.staticId && t.status !== TaskStatus.Done)
      const defaultCommand = task ? LETTER_OF_CREDIT_TYPE_LABELS[task.taskType] : 'View SBLC'
      return [
        <Dropdown.Item
          date-test-id={`open-${letter.staticId}`}
          key={`${letter.staticId}-open`}
          onClick={() => history.push(`/letters-of-credit/${letter.staticId}`)}
        >
          {defaultCommand}
        </Dropdown.Item>
      ]
    }
  }

  // TODO LS to use toArray() we need to make dataTestId a getter function
  // const data = lettersOfCredit.toJS()

  return (
    <>
      <TopHeader>
        <Header as="h1" style={{ margin: 0 }}>
          {/* TODO LS keep until we decide <Breadcrumb as="small">Financial Instruments</Breadcrumb>*/}
          Financial Instruments
        </Header>
      </TopHeader>

      <Spacer marginBottom={SPACES.DEFAULT} paddingRight={SPACES.DEFAULT} paddingLeft={SPACES.DEFAULT}>
        {/* TODO LS activate once we have new LC
         <Link to={'/letters-of-credit/dashboard/documentary'}>Letters of Credit ({documentaryLetters}) </Link>
         */}
        <Link to={'/letters-of-credit/dashboard/standby'}>Stand by Letters of Credit ({standbyLetters}) </Link>
      </Spacer>

      <Spacer paddingRight={SPACES.DEFAULT} paddingLeft={SPACES.DEFAULT}>
        <Table
          data-test-id="letters-of-credit-table"
          dataTestId="reference"
          data={lettersOfCredit}
          columns={buildColumns()}
          onRowClick={(letter: ILetterOfCredit<IDataLetterOfCredit>) =>
            history.push(`/letters-of-credit/${letter.staticId}`)
          }
          actionsMenu={buildActionsMenu(tasks)}
        />
      </Spacer>
    </>
  )
}
