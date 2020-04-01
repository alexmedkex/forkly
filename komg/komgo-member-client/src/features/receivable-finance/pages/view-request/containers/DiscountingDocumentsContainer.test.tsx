import React from 'react'
import { fakeCommercialContractDocumentWithExtension } from '../../../../trades/components/documents-form-fields/faker'
import { BottomSheetStatus } from '../../../../bottom-sheet/store/types'
import { fakeRdInfo } from '../../../../receivable-discounting-legacy/utils/faker'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import { RDStatus, buildFakeTradeSnapshot, IReceivablesDiscountingInfo } from '@komgo/types'
import { shallow, ShallowWrapper } from 'enzyme'
import { DiscountingDocumentsContainer, IDiscountingDocumentsContainerProps } from './DiscountingDocumentsContainer'
import DiscountingDocuments from '../../../../receivable-discounting-legacy/components/receivable-discounting-application/documents/DiscountingDocuments'
import { CachedDataProvider } from '../../../../../components/cached-data-provider'
import { fakeTradeSeller } from '../../../../letter-of-credit-legacy/utils/faker'

describe('Document Upload section', () => {
  let testProps: IDiscountingDocumentsContainerProps
  let wrapper: ShallowWrapper<DiscountingDocumentsContainer>
  let rdDoc: any
  let tradeDoc: any

  beforeEach(() => {
    const discountingRequest: IReceivablesDiscountingInfo = fakeRdInfo()

    const discountingRequestWithTrade: IReceivablesDiscountingInfo = {
      ...discountingRequest,
      tradeSnapshot: { ...discountingRequest.tradeSnapshot, trade: fakeTradeSeller() }
    }

    tradeDoc = {
      ...fakeCommercialContractDocumentWithExtension,
      state: BottomSheetStatus.REGISTERED,
      context: { vaktId: discountingRequestWithTrade.rd.tradeReference.sourceId }
    }
    rdDoc = { ...tradeDoc, context: { rdId: discountingRequest.rd.staticId } }

    testProps = {
      discountingRequest: discountingRequestWithTrade,
      role: ReceivablesDiscountingRole.Trader,
      companyStaticId: 'company',
      documents: [tradeDoc, rdDoc],
      documentTypes: [],
      fetchDocumentTypesAsync: jest.fn(),
      fetchDocumentsWithParamsAsync: jest.fn(),
      history: { push: jest.fn() } as any
    }
  })

  describe('RD status is QuoteAccepted', () => {
    beforeEach(() => {
      testProps.discountingRequest.status = RDStatus.QuoteAccepted
    })

    it('should show registered RD documents - TRADER', () => {
      testProps.documents = [rdDoc, rdDoc]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('registeredDocuments')).toEqual([rdDoc, rdDoc])
    })

    it('should show registered trade documents', () => {
      testProps.documents = [tradeDoc]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('registeredDocuments')).toEqual([tradeDoc])
    })

    it('should show registered Trade and RD documents', () => {
      testProps.documents = [tradeDoc, rdDoc]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('registeredDocuments')).toEqual([tradeDoc, rdDoc])
    })

    it('should only show registered trade and RD documents', () => {
      const pendingRDDoc = { ...rdDoc, state: BottomSheetStatus.PENDING }
      const pendingTradeDoc = { ...tradeDoc, state: BottomSheetStatus.PENDING }
      testProps.documents = [pendingRDDoc, pendingTradeDoc, tradeDoc, rdDoc]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('registeredDocuments')).toEqual([tradeDoc, rdDoc])
    })

    it('should not show documents which do not match the RD id or Trade ID', () => {
      testProps.documents = [{ ...rdDoc, context: { subproductId: 'tradeFinance' } }]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('registeredDocuments')).toEqual([])
    })

    it('should select the tradeSnapshot.seller as the counterparty ID if role is BANK', () => {
      testProps.role = ReceivablesDiscountingRole.Bank

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('counterpartyId')).toEqual(
        testProps.discountingRequest.tradeSnapshot.trade.seller
      )
    })

    it('should select the acceptedParticipantStaticId as the counterparty ID if role is TRADER', () => {
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('counterpartyId')).toEqual(
        testProps.discountingRequest.acceptedParticipantStaticId
      )
    })
  })

  describe('RD status is not accepted', () => {
    beforeEach(() => {
      testProps = {
        ...testProps,
        role: ReceivablesDiscountingRole.Trader,
        discountingRequest: {
          ...testProps.discountingRequest,
          status: RDStatus.QuoteSubmitted
        }
      }
    })

    it('should add the DiscountingDocuments section if there are trade documents', () => {
      testProps.documents = [tradeDoc]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper).prop('registeredDocuments')).toEqual([tradeDoc])
    })

    it('should not add the DiscountingDocuments section if there are no registered documents', () => {
      testProps.documents = [{ ...tradeDoc, state: BottomSheetStatus.PENDING }]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(wrapper.find(CachedDataProvider)).toEqual({})
    })

    it('should not add the DiscountingDocuments section if there are no docuements for this RD', () => {
      testProps.documents = [{ ...rdDoc, context: { rdId: 'differentRDId' } }]

      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(wrapper.find(CachedDataProvider)).toEqual({})
    })

    it('should not add the DiscountingDocuments section if there are no documents', () => {
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)

      expect(findCachedDiscountingDocuments(wrapper)).toEqual({})
    })
  })

  describe('changes', () => {
    beforeEach(() => {
      testProps = {
        ...testProps,
        documents: [tradeDoc],
        role: ReceivablesDiscountingRole.Trader,
        discountingRequest: {
          ...testProps.discountingRequest,
          status: RDStatus.QuoteAccepted
        }
      }
    })

    it('should indicate a change if documents are seen for the first time and there is a document present', () => {
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)
      mountCache(wrapper)
      toggleAccordion(wrapper)

      const discountingDocuments = findCachedDiscountingDocuments(wrapper)

      expect(discountingDocuments.prop('isDocumentsAccordionOpen')).toBeTruthy()
      expect(discountingDocuments.prop('changed')).toBeTruthy()
    })

    it('should not indicate a change if documents are seen for the first time and there are no documents', () => {
      testProps.documents = []
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)
      mountCache(wrapper)
      toggleAccordion(wrapper)

      const discountingDocuments = findCachedDiscountingDocuments(wrapper)

      expect(discountingDocuments.prop('isDocumentsAccordionOpen')).toBeTruthy()
      expect(discountingDocuments.prop('changed')).toBeFalsy()
    })

    it('should indicate a change if the section is seen and then a new document is uploaded', () => {
      testProps.documents = [{ ...tradeDoc, registrationDate: new Date('2019-01-01') }]
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)
      toggleAccordion(wrapper)
      mountCache(wrapper)

      wrapper.setProps({
        ...testProps,
        documents: [...testProps.documents, { ...rdDoc, registrationDate: new Date('2019-01-02') }]
      } as any)
      const discountingDocuments = findCachedDiscountingDocuments(wrapper)

      expect(discountingDocuments.prop('isDocumentsAccordionOpen')).toBeTruthy()
      expect(discountingDocuments.prop('changed')).toBeTruthy()
    })

    it('should indicate a change if the section is seen and then a new document is received', () => {
      testProps.documents = [{ ...tradeDoc, registrationDate: new Date('2019-01-01') }]
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)
      toggleAccordion(wrapper)
      mountCache(wrapper)

      wrapper.setProps({
        ...testProps,
        documents: [...testProps.documents, { ...rdDoc, receivedDate: new Date('2019-01-02') }]
      } as any)
      const discountingDocuments = findCachedDiscountingDocuments(wrapper)

      expect(discountingDocuments.prop('isDocumentsAccordionOpen')).toBeTruthy()
      expect(discountingDocuments.prop('changed')).toBeTruthy()
    })

    it('should not indicate a change if documents are seen and then seen again', () => {
      testProps.documents = [{ ...tradeDoc, registrationDate: new Date('2019-01-01') }]
      wrapper = shallow(<DiscountingDocumentsContainer {...testProps} />)
      toggleAccordion(wrapper)
      mountCache(wrapper)

      wrapper.setProps({
        ...testProps
      } as any)
      const discountingDocuments = findCachedDiscountingDocuments(wrapper)

      expect(discountingDocuments.prop('isDocumentsAccordionOpen')).toBeTruthy()
      expect(discountingDocuments.prop('changed')).toBeFalsy()
    })
  })
  function toggleAccordion(wrapper: ShallowWrapper<DiscountingDocumentsContainer>) {
    findCachedDiscountingDocuments(wrapper).prop('handleClick')()
  }
  function mountCache(wrapper: ShallowWrapper<DiscountingDocumentsContainer>) {
    wrapper
      .find(CachedDataProvider)
      .shallow()
      .instance()
      .componentDidMount()
  }
  function findCachedDiscountingDocuments(wrapper: ShallowWrapper<DiscountingDocumentsContainer>) {
    return wrapper
      .find(CachedDataProvider)
      .shallow()
      .find(DiscountingDocuments)
  }
})
