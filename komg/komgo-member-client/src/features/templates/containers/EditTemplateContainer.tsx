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
import { EditorTemplatesActionType } from '../../templates/store/templates/types'
import { EditorTemplateBindingsActionType } from '../../templates/store/template-bindings/types'
import { fromJS } from 'immutable'
import { template, tradeFinanceManager } from '@komgo/permissions'
import { EditTemplate } from '../components/EditTemplate'
import { ITemplate, ITemplateBinding } from '@komgo/types'
import { updateTemplate } from '../store/templates/actions'
import { getTemplateWithTemplateBinding } from '../store/actions'
import { ImmutableObject } from '../../../utils/types'
import { Spacer } from '../../../components/spacer/Spacer'
import { SPACES } from '@komgo/ui-components'
import { buildSelection } from '../utils/selectionUtil'

interface CreateProps {
  template: ImmutableObject<ITemplate>
  templateBinding: ImmutableObject<ITemplateBinding>
  ownerCompanyStaticId: string
  isSaving: boolean
  savingErrors: ServerError[]
}

interface CreateActions {
  clearError: (action: string) => null
  updateTemplate: (template: ITemplate) => void
  getTemplateWithTemplateBinding: (params: { staticId: string }) => void
}

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any>,
    CreateProps,
    CreateActions {}

const SAVING_ACTIONS = [EditorTemplatesActionType.UPDATE_TEMPLATE_REQUEST]

const LOADING_ACTIONS = [
  EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_REQUEST,
  EditorTemplatesActionType.GET_TEMPLATE_REQUEST
]

export class EditTemplateContainer extends React.Component<IProps> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.getTemplateWithTemplateBinding(this.props.match.params)
  }

  componentDidUpdate(prevProps: IProps) {
    const { staticId } = this.props.match.params
    if (staticId !== prevProps.match.params.staticId) {
      this.props.getTemplateWithTemplateBinding(this.props.match.params)
    }
  }

  isAuthorized() {
    const { isAuthorized } = this.props
    return isAuthorized(template.canManageTemplateRead)
  }

  componentWillUnmount() {
    SAVING_ACTIONS.forEach(action => this.props.clearError(action))
  }

  render() {
    const {
      isFetching,
      location,
      history,
      match,
      staticContext,
      errors,
      isSaving,
      savingErrors,
      template,
      templateBinding,
      getTemplateWithTemplateBinding,
      updateTemplate
    } = this.props

    const selection = buildSelection(location.search)

    if (!this.isAuthorized()) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return (
        <Spacer padding={SPACES.DEFAULT}>
          <ErrorMessage title="Template error" error={error} />
        </Spacer>
      )
    }

    if (isFetching) {
      return (
        <Spacer padding={SPACES.DEFAULT}>
          <LoadingTransition title="Loading template" />
        </Spacer>
      )
    }

    return (
      <EditTemplate
        staticContext={staticContext}
        history={history}
        location={location}
        match={match}
        selection={selection}
        isUpdating={isSaving}
        updatingErrors={savingErrors}
        templateBinding={templateBinding}
        template={template}
        updateTemplate={updateTemplate}
        getTemplateWithTemplateBindings={getTemplateWithTemplateBinding}
      />
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): CreateProps => {
  const { staticId } = ownProps.match.params

  const isSaving = loadingSelector(state.get('loader').get('requests'), SAVING_ACTIONS, false)
  const savingErrors = findErrors(state.get('errors').get('byAction'), SAVING_ACTIONS)

  const ownerCompanyStaticId = state.get('uiState').get('profile').company
  const template =
    state
      .get('editorTemplates')
      .get('byStaticId')
      .get(staticId) || fromJS({})
  const templateBindingStaticId = template.get('templateBindingStaticId')

  const templateBinding =
    state
      .get('editorTemplateBindings')
      .get('byStaticId')
      .get(templateBindingStaticId) || fromJS({})

  return {
    ownerCompanyStaticId,
    isSaving,
    savingErrors,
    template,
    templateBinding
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  connect<CreateProps, CreateActions>(mapStateToProps, {
    clearError,
    getTemplateWithTemplateBinding,
    updateTemplate
  }),
  withLoaders({
    actions: LOADING_ACTIONS
  })
)(EditTemplateContainer)
