import * as React from 'react'
import { ExtraOptionsMenu, ExtraOptionsMenuAllProps } from './ExtraOptionsMenu'
import { Link } from 'react-router-dom'
import { ShallowWrapper } from 'enzyme'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import { tradeFinanceManager } from '@komgo/permissions'
import { RDStatus } from '@komgo/types'

const defaultProps: ExtraOptionsMenuAllProps = {
  isAuthorized: jest.fn(() => true),
  tradeTechnicalId: undefined,
  rdMenuProps: {
    rdStatus: RDStatus.Requested,
    rdId: 'test-rd-id'
  },
  role: undefined
}

describe('ExtraOptionsMenu', () => {
  let props: ExtraOptionsMenuAllProps

  describe('as a trader', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        role: ReceivablesDiscountingRole.Trader
      }
    })

    it('hides review request', () => {
      const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} tradeTechnicalId="test-trade-id" />)

      const reviewRequest = wrapper.find("[data-test-id='reviewRequest']")

      expect(reviewRequest.exists()).toBeFalsy()
    })

    describe('Apply for discounting', () => {
      it('should show apply for discounting, if there is a trade but no RD', () => {
        const wrapper = new ShallowWrapper(
          <ExtraOptionsMenu {...props} tradeTechnicalId="test-trade-id" rdMenuProps={undefined} />
        )

        const apply = wrapper.find("[data-test-id='applyforDiscounting']")
        const links = wrapper.find(Link)

        expect(apply.exists()).toBeTruthy()
        expect(links.length).toBe(1)
        expect(links.at(0).props().to).toEqual('/receivable-discounting/test-trade-id/apply')
      })

      it('should show disabled apply for discounting if there is a requested RD', () => {
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} />)

        const apply = wrapper.find("[data-test-id='applyforDiscounting']")
        const links = wrapper.find(Link)

        expect(apply.exists()).toBeTruthy()
        expect(
          links
            .at(0)
            .parent()
            .props().disabled
        ).toBeTruthy()
      })
    })

    describe('View quotes', () => {
      it('should show view quotes when rd status is requested', () => {
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} />)
        const viewQuotes = wrapper.find("[data-test-id='viewQuotes']")

        expect(viewQuotes.exists()).toBeTruthy()
      })

      it('should disable view quotes if not canReadRD', () => {
        const isAuthorized = jest.fn(permission => permission !== tradeFinanceManager.canReadRD)
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} isAuthorized={isAuthorized} />)
        const viewQuotes = wrapper.find("[data-test-id='viewQuotes']")

        expect(
          viewQuotes
            .at(0)
            .parent()
            .props().disabled
        ).toBeTruthy()
      })
    })

    describe('view request', () => {
      it('should show a view request button that leads to the discounting request if can read RD and RD is requested', () => {
        const isAuthorized = jest.fn(permission => permission === tradeFinanceManager.canReadRD)
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} isAuthorized={isAuthorized} />)

        const viewRequest = wrapper.find("[data-test-id='viewRequest']")
        const links = viewRequest.find(Link)

        expect(viewRequest.exists()).toBeTruthy()
        expect(links.length).toBe(1)
        expect(links.at(0).props().to).toEqual('/receivable-discounting/test-rd-id')
        expect(links.at(0).props().children).toEqual('View request')
      })

      it('should disable view request button if cannot read RD', () => {
        const isAuthorized = jest.fn(permission => permission !== tradeFinanceManager.canReadRD)
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} isAuthorized={isAuthorized} />)

        const viewRequest = wrapper.find("[data-test-id='viewRequest']")

        expect(
          viewRequest
            .at(0)
            .parent()
            .props().disabled
        ).toBeTruthy()
      })

      it('should hide view request button if RD pending request', () => {
        const rdMenuProps = {
          rdStatus: RDStatus.PendingRequest
        }
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} rdMenuProps={rdMenuProps as any} />)
        const viewRequest = wrapper.find("[data-test-id='viewRequest']")

        expect(viewRequest.exists()).toBeFalsy()
      })
    })
  })

  describe('as a bank', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        role: ReceivablesDiscountingRole.Bank
      }
    })

    it('hides view quotes and apply for discounting', () => {
      const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} tradeTechnicalId="test-trade-id" />)

      const viewQuotes = wrapper.find("[data-test-id='viewQuotes']")
      const applyforDiscounting = wrapper.find("[data-test-id='applyforDiscounting']")

      expect(viewQuotes.exists()).toBeFalsy()
      expect(applyforDiscounting.exists()).toBeFalsy()
    })

    describe('view and review request', () => {
      it('should show a view request button that leads to the discounting request', () => {
        const isAuthorized = jest.fn(permission => permission === tradeFinanceManager.canReadRDRequests)
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} isAuthorized={isAuthorized} />)

        const view = wrapper.find("[data-test-id='viewRequest']")
        const links = wrapper.find(Link)

        expect(view.exists()).toBeTruthy()
        expect(links.length).toBe(1)
        expect(links.at(0).props().to).toEqual('/receivable-discounting/test-rd-id')
        expect(links.at(0).props().children).toEqual('View request')
      })

      it('should not show a view request button if canCrudRDRequests', () => {
        const isAuthorized = jest.fn(
          permission =>
            permission === tradeFinanceManager.canReadRDRequests || permission === tradeFinanceManager.canCrudRDRequests
        )
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} isAuthorized={isAuthorized} />)

        const view = wrapper.find("[data-test-id='viewRequest']")

        expect(view.exists()).toBeFalsy()
      })

      it('should show a Review request button leading to the discounting request if canCrudRDRequests', () => {
        const isAuthorized = jest.fn(
          permission =>
            permission === tradeFinanceManager.canReadRDRequests || permission === tradeFinanceManager.canCrudRDRequests
        )
        const wrapper = new ShallowWrapper(<ExtraOptionsMenu {...props} isAuthorized={isAuthorized} />)
        const view = wrapper.find("[data-test-id='viewRequest']")
        const review = wrapper.find("[data-test-id='reviewRequest']")
        const links = wrapper.find(Link)

        expect(view.exists()).toBeFalsy()
        expect(review.exists()).toBeTruthy()
        expect(links.length).toBe(1)
        expect(links.at(0).props().to).toEqual('/receivable-discounting/test-rd-id')
        expect(links.at(0).props().children).toEqual('Review request')
      })
    })
  })
})
