import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { PushToMarketContainer, IPushToMarketContainerProps } from './PushToMarketContainer'
import { fakeCounterparty, fakeTrade } from '../../../letter-of-credit-legacy/utils/faker'
import { Counterparty } from '../../../counterparties/store/types'
import { createMemoryHistory } from 'history'
import { shallow } from 'enzyme'
import { Button } from 'semantic-ui-react'
import SubmitConfirm from './components/SubmitConfirm'
import { fakeMemberMarketSelectionItem } from '../../../receivable-discounting-legacy/utils/faker'
import { IMemberMarketSelectionItem } from '../../../receivable-discounting-legacy/store/types'
import { render, fireEvent, wait } from '@testing-library/react'
import { CreditRequirements } from '@komgo/types'

const counterparties: Counterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company', isFinancialInstitution: true, isMember: true }),
  fakeCounterparty({ staticId: '2', commonName: 'C Company', isFinancialInstitution: true, isMember: true })
]

const data: IMemberMarketSelectionItem[] = [
  fakeMemberMarketSelectionItem({ counterparty: counterparties[0] }),
  fakeMemberMarketSelectionItem({ counterparty: counterparties[1] })
]

let testProps: IPushToMarketContainerProps

describe('PushToMarketContainer', () => {
  beforeEach(() => {
    testProps = {
      match: {
        isExact: true,
        path: '',
        url: '',
        params: null
      },
      rdId: '123121',
      tradeTechnicalId: '9494949494',
      trade: fakeTrade({ _id: '123', creditRequirement: CreditRequirements.OpenCredit, sellerEtrmId: '1234' }),
      data,
      counterparties,
      dispatch: jest.fn(),
      createRequestForProposal: jest.fn(),
      createRequestForProposalLoader: false,
      confirmError: undefined,
      fetchConnectedCounterpartiesAsync: jest.fn(),
      fetchRDRequesForProposalMembersData: jest.fn(),
      setCreateRequestForProposalError: jest.fn(),
      isAuthorized: jest.fn(() => true),
      isFetching: false,
      errors: [],
      history: { ...createMemoryHistory(), push: jest.fn() },
      staticContext: undefined,
      isLicenseEnabled: jest.fn(() => true),
      isLicenseEnabledForCompany: jest.fn(() => true),
      location: {
        pathname: '/receivable-discounting/123121/new',
        search: '',
        state: '',
        hash: ''
      }
    }
  })

  it('renders correctly', () => {
    expect(renderer.create(<PushToMarketContainer {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders error message correctly if no counterparties exist', () => {
    const testSpecificTestProps = {
      ...testProps,
      counterparties: []
    }
    expect(renderer.create(<PushToMarketContainer {...testSpecificTestProps} />).toJSON()).toMatchSnapshot()
  })

  describe('componentDidMount', () => {
    it('fetches connected counterparties upon mount', () => {
      shallow(<PushToMarketContainer {...testProps} />)

      expect(testProps.fetchConnectedCounterpartiesAsync).toHaveBeenCalledTimes(1)
      expect(testProps.fetchRDRequesForProposalMembersData).toHaveBeenCalledTimes(1)
    })
  })

  describe('pushToMarket', () => {
    it('disables push to market button when there are no counterparties', () => {
      const wrapper = shallow(<PushToMarketContainer {...testProps} />)

      wrapper.setState({ counterpartySelection: [] })
      const buttons = wrapper.find(Button)

      const buttonProps = buttons.at(1).props()
      expect(buttonProps).toEqual(
        expect.objectContaining({
          disabled: true
        })
      )
    })

    it('enables push to market button when there are counterparties', () => {
      const wrapper = shallow(<PushToMarketContainer {...testProps} />)

      wrapper.setState({ counterpartySelection: [fakeCounterparty()] })
      const buttons = wrapper.find(Button)

      const buttonProps = buttons.at(1).props()
      expect(buttonProps).toEqual(
        expect.objectContaining({
          disabled: false
        })
      )
    })

    it('opens confirmation modal when push to market is called', () => {
      const wrapper = shallow(<PushToMarketContainer {...testProps} />)

      const buttons = wrapper.find(Button)
      buttons.at(1).simulate('click')

      expect(wrapper.state('openConfirm')).toBeTruthy()
    })

    it('submits request for proposal when submit is clicked', () => {
      const rdId = '123rd'
      const staticId = '123staticId'
      const wrapper = shallow(<PushToMarketContainer {...testProps} rdId={rdId} />)
      wrapper.setState({ counterpartySelection: [{ ...fakeCounterparty(), staticId }] })

      const modal = wrapper.find(SubmitConfirm)
      const confirm = modal
        .shallow()
        .find(Button)
        .at(1)
      confirm.simulate('click')

      expect(testProps.createRequestForProposal).toHaveBeenCalledTimes(1)
      expect(testProps.createRequestForProposal).toHaveBeenCalledWith({
        rdId,
        participantStaticIds: [staticId]
      })
    })

    it('removes any present errors if submitted', () => {
      const wrapper = shallow(<PushToMarketContainer {...testProps} confirmError="error" />)

      const modal = wrapper.find(SubmitConfirm)
      const confirm = modal
        .shallow()
        .find(Button)
        .at(1)
      confirm.simulate('click')

      expect(testProps.setCreateRequestForProposalError).toHaveBeenCalledWith(null)
    })

    it('removes any present errors if cancelled', () => {
      const wrapper = shallow(<PushToMarketContainer {...testProps} confirmError="error" />)

      const modal = wrapper.find(SubmitConfirm)
      const cancel = modal
        .shallow()
        .find(Button)
        .at(0)
      cancel.simulate('click')

      expect(testProps.setCreateRequestForProposalError).toHaveBeenCalledWith(null)
      expect(testProps.createRequestForProposal).not.toHaveBeenCalled()
    })

    it('navigates to the Apply for Discounting screen if PREVIOUS clicked', () => {
      const { getByTestId } = render(<PushToMarketContainer {...testProps} />)

      fireEvent.click(getByTestId('button-previous'))

      expect(testProps.history.push).toHaveBeenCalledWith(`/receivable-discounting/${testProps.tradeTechnicalId}/apply`)
    })

    it('excludes non licensed members when submitting', async () => {
      const rdId = '123rd'
      const staticId = '123staticId'
      const staticId2 = '123staticId2'

      testProps.isLicenseEnabledForCompany = jest.fn((_, id) => id !== staticId2)

      const { queryByTestId } = render(
        <PushToMarketContainer
          {...testProps}
          rdId={rdId}
          counterparties={[{ ...fakeCounterparty(), staticId }, { ...fakeCounterparty(), staticId: staticId2 }]}
        />
      )

      const selectAll = queryByTestId('checkbox-select-all-none')
      fireEvent.click(selectAll)

      let pushToMarket: HTMLElement
      await wait(() => {
        pushToMarket = queryByTestId('button-push-to-market')
        expect(pushToMarket).not.toBeDisabled()
      })

      fireEvent.click(pushToMarket)

      let confirm: HTMLElement
      await wait(() => {
        confirm = queryByTestId('button-push-to-market-confirm')
        expect(confirm).toBeVisible()
      })

      fireEvent.click(confirm)

      await wait(() => {
        expect(testProps.createRequestForProposal).toHaveBeenCalledTimes(1)
        expect(testProps.createRequestForProposal).toHaveBeenCalledWith({
          rdId,
          participantStaticIds: [staticId]
        })
      })
    })
  })
})
