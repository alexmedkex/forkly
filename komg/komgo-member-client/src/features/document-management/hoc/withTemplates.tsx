import { connect } from 'react-redux'
import { TemplateActions } from '../store'
import { ApplicationState } from '../../../store/reducers'

const mapStateToProps = (state: ApplicationState) => {
  const templatesState = state.get('templates')
  return {
    templates: templatesState.get('templates')
  }
}

const withTemplates = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, {
    fetchTemplatesAsync: TemplateActions.fetchTemplatesAsync,
    fetchTemplateById: TemplateActions.fetchTemplatebyIdAsync,
    createTemplateAsync: TemplateActions.createTemplateAsync,
    updateTemplateAsync: TemplateActions.updateTemplateAsync,
    deleteTemplateAsync: TemplateActions.deleteTemplateAsync
  })(Wrapped)

export default withTemplates
