import * as React from 'react'
import { connect } from 'react-redux'

import { IProduct } from '@komgo/products'

import { ApplicationState } from '../../store/reducers'
import { User } from '../../store/common/types'
import { MemberState } from '../../features/members/store/types'

import { isLicenseEnabled, isLicenseEnabledForCompany } from '../../utils/is-license-enabled'

export interface LocalProps {
  _licenseCheckUser: User
  _licenseCheckMembers: MemberState
}

export interface WithLicenseCheckProps {
  isLicenseEnabled(product: IProduct): boolean
  isLicenseEnabledForCompany(product: IProduct, companyStaticId: string): boolean
}

// https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
type Subtract<T, K> = Omit<T, keyof K>

/**
 * Returns a higher-order component
 */
export const withLicenseCheck = <P extends WithLicenseCheckProps>(WrappedComponent: React.ComponentType<any>) => {
  class WithLicenseCheck extends React.Component<Subtract<P, WithLicenseCheckProps> & LocalProps> {
    static displayName = `WithLicenseCheck(${getDisplayName(WrappedComponent)})`

    isLicenseEnabled = (product: IProduct) => {
      return isLicenseEnabled(product, this.props._licenseCheckMembers, this.props._licenseCheckUser)
    }

    isLicenseEnabledForCompany = (product: IProduct, companyStaticId: string) => {
      return isLicenseEnabledForCompany(product, this.props._licenseCheckMembers, companyStaticId)
    }

    render() {
      const { _licenseCheckMembers, _licenseCheckUser, ...props } = this.props as LocalProps
      if (!_licenseCheckMembers || !_licenseCheckUser) {
        return null
      }
      return (
        <WrappedComponent
          isLicenseEnabled={this.isLicenseEnabled}
          isLicenseEnabledForCompany={this.isLicenseEnabledForCompany}
          {...props}
        />
      )
    }
  }

  const mapStateToProps: any = (state: ApplicationState): LocalProps => ({
    _licenseCheckMembers: state.get('members'),
    _licenseCheckUser: state.get('uiState').get('profile')
  })

  return connect<LocalProps, LocalProps, any>(mapStateToProps)(WithLicenseCheck)
}

function getDisplayName(WrappedComponent: React.ComponentType) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
