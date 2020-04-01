import * as React from 'react'
import { shallow } from 'enzyme'
import { CreateOrEditCreditLineCounterparty } from './CreateOrEditCreditLineCounterparty'
import { fakeMember } from '../../../../letter-of-credit-legacy/utils/faker'
import { fakeFormikContext } from '../../../../../store/common/faker'
import { Action } from '../../../containers/financial-institution/CreateOrEditCreditLine'
import { LightHeaderWrapper } from '../../../../../components/styled-components/HeaderWrapper'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'
import { createInitialCreditLine } from '../../../utils/factories'
import { CreditLineType } from '../../../store/types'

describe('CreateOrEditRiskCoverBuyer', () => {
  let defaultProps
  const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

  beforeEach(() => {
    defaultProps = {
      members: [fakeMember({ staticId: '123123' })],
      formik: fakeFormikContext(initialRiskCoverValues),
      allRequests: {},
      currentAction: Action.CreateNewRiskCover,
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find p in HeaderWrapper with appropriate text', () => {
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} />)

    const p = wrapper
      .find(LightHeaderWrapper)
      .find('[data-test-id="create-counterparty-text-info"]')
      .shallow()

    expect(p.text()).toBe(
      'The information provided in this section about buyers will only be accessible by your organisation depending on their permissions. However, you may choose to disclose some of these data to your clients using "Visibility to sellers" section below.'
    )
  })

  it('should find p in HeaderWrapper with appropriate text for bank line', () => {
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} feature={CreditLineType.BankLine} />)

    const p = wrapper
      .find(LightHeaderWrapper)
      .find('[data-test-id="create-counterparty-text-info"]')
      .shallow()

    expect(p.text()).toBe(
      'The information provided in this section about issuing banks will only be accessible by your organisation depending on their permissions. However, you may choose to disclose some of these data to your clients using "Visibility to beneficiaries" section below.'
    )
  })

  it('should find h3 with appropriate text', () => {
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} />)

    const h3 = wrapper.find('h3')

    expect(h3.text()).toBe('Buyer information')
  })

  it('should find h3 with appropriate text', () => {
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} feature={CreditLineType.BankLine} />)

    const h3 = wrapper.find('h3')

    expect(h3.text()).toBe('Issuing bank information')
  })

  it('should find BuyerName component instead of field when buyer is predifined', () => {
    const buyer = fakeMember({ commonName: 'Buyer' })
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} buyer={buyer} />)

    const buyerName = wrapper
      .find('FieldDisplay')
      .first()
      .find('[data-test-id="counterparty-name"]')

    expect(buyerName.length).toBe(1)
    expect(buyerName.shallow().text()).toBe('Buyer')
  })

  it('should find 9 fields', () => {
    const wrapper = shallow(<CreateOrEditCreditLineCounterparty {...defaultProps} />)

    const fields = wrapper.find('FieldDisplay')

    expect(fields.length).toBe(10)
  })
})
