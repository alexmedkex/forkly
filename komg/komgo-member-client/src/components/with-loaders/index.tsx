import * as React from 'react'
import { connect } from 'react-redux'
import { clearError } from '../../store/common/actions'
import { loadingSelector } from '../../store/common/selectors'
import { findErrors } from '../../store/common/selectors/errorSelector'
import { ServerError } from '../../store/common/types'
import { ApplicationState } from '../../store/reducers'

interface WithLoadersOptions {
  actions?: string[]
  // use  errors or request only if you want to have different actions for errors and requests
  errors?: string[]
  isFetching?: string[]
}

export interface WithLoaderProps {
  errors?: ServerError[]
  isFetching: boolean
}

interface Actions {
  clearError: (action: string) => any
}

export const withLoaders = ({ actions, errors, isFetching }: WithLoadersOptions) => {
  return Component => {
    class WithLoaders extends React.Component<WithLoaderProps & Actions> {
      componentWillUnmount(): void {
        actions.forEach(action => {
          this.props.clearError(action)
          // TODO clearLoaders too
        })
      }

      render() {
        return <Component {...this.props} />
      }
    }

    const mapStateToProps = (state: ApplicationState) => {
      return {
        errors: findErrors(state.get('errors').get('byAction'), errors || actions),
        isFetching: loadingSelector(state.get('loader').get('requests'), actions || isFetching)
      }
    }

    return connect(mapStateToProps, { clearError })(WithLoaders)
  }
}
