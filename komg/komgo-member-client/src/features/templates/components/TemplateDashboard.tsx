import React, { SyntheticEvent } from 'react'
import styled from 'styled-components'
import { Button, Header, Popup, Dropdown } from 'semantic-ui-react'
import { violetBlue, paleGray, SPACES, Table } from '@komgo/ui-components'
import { ITemplate, ITemplateBase, ITemplateBinding } from '@komgo/types'
import { TEMPLATE_INSTANCE_VERSIONS } from '@komgo/types/dist/template-library/template/TemplateInstanceSchema'
import { ServerError } from '../../../store/common/types'
import { EMPTY_TEMPLATE } from '../utils/constants'
import { Map } from 'immutable'
import { findLatestTemplate } from '../store/selectors'
import { RouteComponentProps, withRouter } from 'react-router'
import { ImmutableObject } from '../../../utils/types'
import { useToggle } from '../hooks/useToggle'
import { findTemplateBindingType } from '../utils/schemaUtils'
import { displayDate } from '../../../utils/date'
import { IMember } from '../../members/store/types'
import { NavLink } from 'react-router-dom'
import { Spacer } from '../../../components/spacer/Spacer'
import { EditorTemplatesActionType } from '../store/templates/types'
import { Action } from 'redux'
import { ConfirmDelete } from './ConfirmDelete'
import { TopHeader } from './TopHeader'
import { ISelection } from '../utils/selectionUtil'
import { toast } from 'react-toastify'
import { ToastContainerIds } from '../../../utils/toast'

export interface ConfirmAction extends Action {
  title: string
  params: any
  message: () => any
}

export interface TemplateDashboardProps extends RouteComponentProps<any> {
  selection?: ISelection
  templateBindings: Map<string, Map<keyof ITemplateBinding, ITemplateBinding[keyof ITemplateBinding]>>
  templates: Map<string, Map<keyof ITemplate, ITemplate[keyof ITemplate]>>
  members: Map<string, Map<keyof IMember, IMember[keyof IMember]>>
  ownerCompanyStaticId: string
  createTemplate: (template: ITemplateBase) => void
  isDeleting: boolean
  deletingErrors: ServerError[]
  isCreating: boolean
  creatingErrors: ServerError[]
  onConfirm: (action: ConfirmAction) => void
}

const Item = styled(Button)`
  &&&& {
    text-align: right;
    &:hover {
      background: ${paleGray} !important;
    }
  }
`

export const Link = props => {
  return (
    <NavLink
      style={{ color: '#000' }}
      activeStyle={{ color: violetBlue, textDecoration: 'none' }}
      isActive={(_, { search, pathname }) => {
        return `${pathname}${search}` === `${props.to}`
      }}
      {...props}
    />
  )
}

export const TemplateDashboard = ({
  selection = {} as any,
  history,
  location,
  ownerCompanyStaticId,
  templateBindings,
  templates,
  createTemplate,
  isDeleting,
  deletingErrors,
  isCreating,
  creatingErrors,
  onConfirm,
  members
}: TemplateDashboardProps) => {
  const [creatingError] = creatingErrors
  const [deletingError] = deletingErrors

  const onCreateClick = (templateBinding: ImmutableObject<ITemplateBinding>, _) => {
    const template: ITemplateBase = {
      version: TEMPLATE_INSTANCE_VERSIONS.V1,
      name: 'Untitled Template',
      commodity: '',
      ownerCompanyStaticId,
      templateBindingStaticId: templateBinding.get('staticId'),
      productId: templateBinding.get('productId'),
      subProductId: templateBinding.get('subProductId'),
      revision: 1,
      template: EMPTY_TEMPLATE
    }
    createTemplate(template)
  }

  const onSelectClick = (template: ITemplate, e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    history.push(`${selection.redirectTo}&templateId=${template.staticId}`)
  }

  const buildColumns = (selection: ISelection) => {
    const columns = [
      { accessor: 'name' },
      {
        accessor: 'ownerCompanyStaticId',
        title: 'Owned by',
        cell: t => {
          const member = members.get(t.ownerCompanyStaticId)
          const commonName = member
            ? (member.get('x500Name') as any).get('CN')
            : `Member ${t.ownerCompanyStaticId} not found`
          return <span>{commonName}</span>
        }
      },
      { accessor: 'createdAt', title: 'Created on', cell: t => <span>{displayDate(t.createdAt)}</span> },
      { accessor: 'createdBy', cell: t => <span>{t.createdBy}</span> },
      { accessor: 'updatedAt', title: 'Last modified', cell: t => <span>{displayDate(t.updatedAt)}</span> },
      { accessor: 'updatedBy', cell: t => <span>{t.updatedBy}</span> }
    ]

    const selectColumn = {
      accessor: 'createdAt',
      title: '​ ',
      align: 'right',
      cell: t => (
        <span>
          <Button data-test-id={`select-${t.staticId}`} onClick={onSelectClick.bind(undefined, t)}>
            Select
          </Button>
        </span>
      )
    }

    return columns.concat(selection && selection.select ? [selectColumn] : [])
  }

  const buildActionsMenu = (selection: ISelection) => {
    return selection && selection.select
      ? undefined
      : t => [
          <Dropdown.Item
            date-test-id={`open-${t.staticId}`}
            key={`${t.staticId}-open`}
            onClick={() => history.push(`/templates/${t.staticId}`)}
          >
            Open
          </Dropdown.Item>,
          <Dropdown.Item
            date-test-id={`delete-${t.staticId}`}
            key={`${t.staticId}-delete`}
            onClick={() =>
              onConfirm({
                title: 'Delete Template',
                type: EditorTemplatesActionType.DELETE_TEMPLATE_REQUEST,
                params: { staticId: t.staticId },
                message: () => <ConfirmDelete template={t.name} />
              })
            }
          >
            Delete
          </Dropdown.Item>
        ]
  }

  useToggle(isCreating, () => {
    if (creatingError) {
      return toast.error(creatingError.message, { containerId: ToastContainerIds.Default })
    }
    const latestTemplate = findLatestTemplate(templates)
    const url = `/templates/${latestTemplate.staticId}`
    return history.push(url)
  })

  useToggle(isDeleting, () => {
    if (deletingError) {
      return
    }
    return toast.success('Template deleted', { containerId: ToastContainerIds.Default })
  })

  const options = templateBindings.toList().map(tb => {
    // FIXME LS temporary until we don't have a name for the templateBindings
    const label = findTemplateBindingType(tb.get('templateSchemaId'))
    return {
      key: tb.get('templateSchemaId'),
      text: label,
      value: tb,
      content: label
    }
  })

  const data = templates.toList().toJS()

  return (
    <>
      <TopHeader>
        <Header as="h1" style={{ margin: 0 }}>
          {/* TODO LS keep until we decide <Breadcrumb as="small">Financial Instruments</Breadcrumb>*/}
          Templates
        </Header>

        {!selection.select && (
          <Popup
            style={{ border: 0, margin: `${SPACES.EXTRA_SMALL} 0`, padding: 0 }}
            trigger={
              <Button primary={true} loading={isCreating}>
                Create
              </Button>
            }
            flowing={true}
            hoverable={true}
            position="bottom right"
          >
            <Button.Group basic={true} vertical={true} style={{ margin: 0, padding: 0 }}>
              {options.map(({ key, value, text }) => (
                <Item key={key} onClick={onCreateClick.bind(undefined, value)}>
                  {text}
                </Item>
              ))}
            </Button.Group>
          </Popup>
        )}
      </TopHeader>

      <Spacer marginBottom={SPACES.DEFAULT} paddingRight={SPACES.DEFAULT} paddingLeft={SPACES.DEFAULT}>
        {selection.select ? (
          <p>Choose an {selection.type} template to begin your application</p>
        ) : (
          templateBindings.toList().map(tb => {
            // TODO LS add the templateSchemaId in the URL once we have multiple template-bindings
            // return <Link key={tb.get('templateSchemaId')} to={`/templates?templateSchemaId=${tb.get('templateSchemaId')}}`}>Stand by Letters of Credit ({data.length}) </Link>
            return (
              <Link key={tb.get('templateSchemaId')} to={'/templates'}>
                Stand by Letters of Credit ({data.length}){' '}
              </Link>
            )
          })
        )}
      </Spacer>

      <Spacer paddingRight={SPACES.DEFAULT} paddingLeft={SPACES.DEFAULT}>
        <Table
          data-test-id="templates-table"
          dataTestId="staticId"
          data={data}
          columns={buildColumns(selection)}
          onRowClick={(template: ITemplate) => {
            history.push({
              pathname: `/templates/${template.staticId}`,
              search: location.search
            })
          }}
          actionsMenu={buildActionsMenu(selection)}
        />
      </Spacer>
    </>
  )
}
