import React, { Fragment } from 'react'
import CounterpartyBox from '../../credit-appetite-shared-components/CounterpartyBox'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import CompanyRow from './CompanyRow'
import { IExtendedCreditLine, CreditLineType } from '../../../store/types'
import { dictionary } from '../../../dictionary'
import { ROUTES } from '../../../routes'
import { CounterpartyCreditLineDataView } from './CounterpartyCreditLineDataView'
import { LightHeaderWrapper } from '../../../../../components/styled-components'

export interface IProps {
  creditLine: IExtendedCreditLine
  feature: CreditLineType
}

export class CreditLineView extends React.Component<IProps> {
  render() {
    const { creditLine, feature } = this.props
    const { view } = dictionary[feature].financialInstitution

    return (
      <Fragment>
        <h1>{creditLine.counterpartyName}</h1>

        <RedirectToEditLink
          to={`${ROUTES[feature].financialInstitution.dashboard}/${creditLine.staticId}/edit`}
          className="ui button"
        >
          Edit information
        </RedirectToEditLink>

        <CounterpartyBox>
          <LightHeaderWrapper>
            <h3>{view.counterpartyTitle}</h3>
            <p>{view.counterpartyText}</p>
          </LightHeaderWrapper>

          <CounterpartyCreditLineDataView {...this.props} />
        </CounterpartyBox>

        <CompanyWrapper>
          <LightHeaderWrapper>
            <h3>{view.companyTitle}</h3>
            <p>{view.companyText}</p>
          </LightHeaderWrapper>

          {creditLine.sharedCreditLines
            ? creditLine.sharedCreditLines.map(item => (
                <CompanyRow key={item.sharedWithStaticId} sharedCreditLine={item} feature={feature} />
              ))
            : null}
        </CompanyWrapper>
      </Fragment>
    )
  }
}

export default CreditLineView

const CompanyWrapper = styled.div`
  margin-top: 40px;
  ${LightHeaderWrapper} {
    margin-bottom: 20px;
  }
`

const RedirectToEditLink = styled(Link)`
  &&& {
    margin-bottom: 25px;
  }
`
