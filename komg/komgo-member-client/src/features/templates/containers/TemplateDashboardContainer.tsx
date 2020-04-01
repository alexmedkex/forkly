import * as React from 'react'
import { compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router'

import { connect } from 'react-redux'
import { ServerError } from '../../../store/common/types'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { WithPermissionsProps, withPermissions } from '../../../components/with-permissions'
import { Unauthorized, ErrorMessage, LoadingTransition } from '../../../components'
import { ApplicationState } from '../../../store/reducers'
import { loadingSelector } from '../../../store/common/selectors'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { clearError } from '../../../store/common/actions'
import { EditorTemplatesActionType } from '../store/templates/types'
import { EditorTemplateBindingsActionType } from '../store/template-bindings/types'
import { Map } from 'immutable'
import { template } from '@komgo/permissions'
import { ITemplate, ITemplateBase, ITemplateBinding } from '@komgo/types'
import { fetchTemplateBindings } from '../store/template-bindings/actions'
import { fetchTemplates, createTemplate, deleteTemplate } from '../store/templates/actions'
import { ConfirmAction, TemplateDashboard } from '../components/TemplateDashboard'
import { IMember } from '../../members/store/types'
import { Confirm } from '../../standby-letter-of-credit-legacy/components/confirm-modal'
import { buildSelection } from '../utils/selectionUtil'

interface TemplateDashboardContainerProps {
  allErrors: Map<string, ServerError>
  requests: Map<string, boolean>
  isSaving: boolean
  savingErrors: ServerError[]
  isDeleting: boolean
  deletingErrors: ServerError[]
  ownerCompanyStaticId: string
  templateBindings: Map<string, Map<keyof ITemplateBinding, ITemplateBinding[keyof ITemplateBinding]>>
  templates: Map<string, Map<keyof ITemplate, ITemplate[keyof ITemplate]>>
  members: Map<string, Map<keyof IMember, IMember[keyof IMember]>>
}

interface TemplateDashboardContainerActions {
  clearError: (action: string) => null
  fetchTemplateBindings: () => void
  fetchTemplates: () => void
  createTemplate: (template: ITemplateBase) => void
  deleteTemplate: (params: { staticId: string }) => void
}

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any>,
    TemplateDashboardContainerProps,
    TemplateDashboardContainerActions {}

export interface IState {
  action?: ConfirmAction
}

const savingActions = [EditorTemplatesActionType.CREATE_TEMPLATE_REQUEST]
const deletingActions = [EditorTemplatesActionType.DELETE_TEMPLATE_REQUEST]

const loadingActions = [
  EditorTemplatesActionType.FETCH_TEMPLATES_REQUEST,
  EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_REQUEST
]

export class TemplateDashboardContainer extends React.Component<IProps, IState> {
  constructor(props) {
    super(props)
    this.state = {
      action: undefined
    }
  }

  componentDidMount() {
    this.props.fetchTemplateBindings()
    this.props.fetchTemplates()
  }

  isAuthorized() {
    const { isAuthorized } = this.props
    return isAuthorized(template.canManageTemplateRead)
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
    if (this.state.action) {
      const wasExecuting = loadingSelector(prevProps.requests, [this.state.action.type], false)
      const isExecuting = loadingSelector(this.props.requests, [this.state.action.type], false)
      const [error] = findErrors(this.props.allErrors, [this.state.action.type])
      if (wasExecuting !== isExecuting && error === undefined && isExecuting === false) {
        this.setState({ action: undefined })
      }
    }
  }

  componentWillUnmount() {
    savingActions.forEach(action => this.props.clearError(action))
    deletingActions.forEach(action => this.props.clearError(action))
  }

  render() {
    const {
      isFetching,
      errors,
      isDeleting,
      deletingErrors,
      isSaving,
      savingErrors,
      ownerCompanyStaticId,
      templateBindings,
      templates,
      createTemplate,
      members,
      requests,
      allErrors,
      location,
      history,
      match,
      staticContext
    } = this.props

    const selection = buildSelection(location.search)
    const { action } = this.state

    if (!this.isAuthorized()) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return <ErrorMessage title="Fetch template error" error={error} />
    }

    if (isFetching) {
      return <LoadingTransition title="Fetching templates" />
    }

    const onConfirm = action => {
      this.setState({
        action
      })
    }

    const onCancel = () => {
      this.props.clearError(action.type)
      this.setState({ action: undefined })
    }

    const actionReducer = action => {
      const { type, params } = action
      switch (type) {
        case EditorTemplatesActionType.DELETE_TEMPLATE_REQUEST:
          return this.props.deleteTemplate(params)
        default:
          throw new Error(`Missing implementation for confirmAction '${this.state.action}'`)
      }
    }
    // TODO LS extract this with the Confirm and the componentDidUpdate
    const isExecuting = action && loadingSelector(requests, [action.type], false)
    const actionErrors = action && findErrors(allErrors, [action.type])

    return (
      <>
        <TemplateDashboard
          isDeleting={isDeleting}
          deletingErrors={deletingErrors}
          staticContext={staticContext}
          match={match}
          location={location}
          history={history}
          selection={selection}
          ownerCompanyStaticId={ownerCompanyStaticId}
          templateBindings={templateBindings}
          templates={templates}
          isCreating={isSaving}
          creatingErrors={savingErrors}
          createTemplate={createTemplate}
          onConfirm={onConfirm}
          members={members}
        />

        {action && (
          <Confirm
            negative={true}
            title={action.title}
            errors={actionErrors}
            isSubmitting={isExecuting}
            open={action !== undefined}
            onCancel={onCancel}
            onSubmit={() => actionReducer(this.state.action)}
          >
            {this.state.action.message()}
          </Confirm>
        )}
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): TemplateDashboardContainerProps => {
  const requests = state.get('loader').get('requests')
  const errors = state.get('errors').get('byAction')

  const isSaving = loadingSelector(requests, savingActions, false)
  const savingErrors = findErrors(errors, savingActions)

  const isDeleting = loadingSelector(requests, deletingActions, false)
  const deletingErrors = findErrors(errors, deletingActions)

  const ownerCompanyStaticId = state.get('uiState').get('profile').company
  const templateBindings = state.get('editorTemplateBindings').get('byStaticId')
  const templates = state.get('editorTemplates').get('byStaticId')
  const members = state.get('members').get('byStaticId')

  return {
    requests,
    allErrors: errors,
    isSaving,
    savingErrors,
    deletingErrors,
    isDeleting,
    ownerCompanyStaticId,
    templateBindings,
    templates,
    members
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  connect<TemplateDashboardContainerProps, TemplateDashboardContainerActions>(mapStateToProps, {
    clearError,
    fetchTemplateBindings,
    fetchTemplates,
    createTemplate,
    deleteTemplate
  }),
  withLoaders({
    actions: loadingActions
  })
)(TemplateDashboardContainer)
