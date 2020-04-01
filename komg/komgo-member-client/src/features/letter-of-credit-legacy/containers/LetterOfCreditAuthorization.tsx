import * as React from 'react'
import { compose } from 'redux'
import { Unauthorized, withLicenseCheck, WithLicenseCheckProps } from '../../../components'
import { productLC } from '@komgo/products'
import { RouteComponentProps } from 'react-router-dom'

export interface LetterOfCreditAuthorizationProps extends RouteComponentProps<{}>, WithLicenseCheckProps {
  children?: any
}

export class LetterOfCreditAuthorization extends React.Component<LetterOfCreditAuthorizationProps> {
  render() {
    if (!this.props.isLicenseEnabled(productLC)) {
      return <Unauthorized />
    }
    return this.props.children
  }
}

export default compose(withLicenseCheck)(LetterOfCreditAuthorization)
