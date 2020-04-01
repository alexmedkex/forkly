import * as React from 'react'
import { connect } from 'react-redux'

import { isAuthorized } from '../../utils/is-authorized'
import { PermissionFullId } from '../../features/role-management/store/types'
import { ApplicationState } from '../../store/reducers'

export interface LocalProps {
  permissions: any
}

export interface WithPermissionsProps {
  isAuthorized(requiredPerm: PermissionFullId): boolean
}

// https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
type Subtract<T, K> = Omit<T, keyof K>

/**
 * Returns a higher-order component
 */
export const withPermissions = <P extends WithPermissionsProps>(WrappedComponent: React.ComponentType<any>) => {
  class WithPermissions extends React.Component<Subtract<P, WithPermissionsProps> & LocalProps> {
    static displayName = `WithPermissions(${getDisplayName(WrappedComponent)})`

    isAuthorized = (requiredPerm: PermissionFullId) => isAuthorized(this.props.permissions, requiredPerm)

    render() {
      const { permissions, ...props } = this.props as LocalProps
      if (!permissions) {
        return null
      }

      return <WrappedComponent isAuthorized={this.isAuthorized} {...props} />
    }
  }

  const mapStateToProps: any = (state: ApplicationState): LocalProps => ({
    permissions: state.get('uiState').get('permissions')
  })

  return connect<LocalProps, LocalProps, any>(mapStateToProps)(WithPermissions)
}

function getDisplayName(WrappedComponent: React.ComponentType) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
