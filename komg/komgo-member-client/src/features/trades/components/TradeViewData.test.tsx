import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { Accordion } from 'semantic-ui-react'
import BasicPanel from './BasicPanel'
import { Field, FieldWithLabel } from './Field'
import {
  TradeViewData,
  DocumentaryRequirements,
  DeliveryTerms,
  PANELS,
  UploadedDocuments,
  TradeViewDataProps,
  CommodityAndPrice
} from './TradeViewData'
import { fakeCargo, fakeTrade } from '../../letter-of-credit-legacy/utils/faker'
import Label from './Label'
import { fakeUploadedDocument } from '../faker'
import { FeatureProvider } from '../../../components/feature-toggles'
import { FeatureToggle } from '../../../utils/featureToggles'
import { DocumentListItem } from './DocumentListItem'
import { TradeSource, buildFakeTrade, buildFakeCargo, PaymentTermsOption } from '@komgo/types'
import { HideableLabelledField } from './HideableLabelledField'
import * as renderer from 'react-test-renderer'

describe('TradeViewData', () => {
  let defaultProps: TradeViewDataProps
  beforeEach(() => {
    defaultProps = {
      uploadedDocuments: [],
      trade: fakeTrade(),
      tradeMovements: [fakeCargo()],
      hideDropdownIcon: true,
      role: 'Buyer',
      handleClick: () => null,
      company: 'Raul Bank',
      actives: {
        [PANELS.Basic]: true,
        [PANELS.Goods]: true,
        [PANELS.Contract]: true,
        [PANELS.Terms]: true,
        [PANELS.Documents]: true,
        [PANELS.UploadedDocuments]: true,
        [PANELS.Cargo]: true
      }
    }
  })

  it('should show uploaded documents', () => {
    const doc1Data = {
      name: 'doc1',
      typeName: 'type1'
    }
    const doc2Data = {
      name: 'doc2',
      typeName: 'type2'
    }
    const doc1 = fakeUploadedDocument(doc1Data)
    const doc2 = fakeUploadedDocument(doc2Data)
    const props = {
      ...defaultProps,
      uploadedDocuments: [doc1, doc2]
    }

    const tradeViewData = mount(<TradeViewData {...props} />)

    const documentListItem = tradeViewData.find(UploadedDocuments).find(DocumentListItem)
    expect(documentListItem.exists()).toBeTruthy()
    expect(documentListItem.length).toBe(2)
    expect(documentListItem.at(0).contains(doc1.name)).toBeTruthy()
    expect(documentListItem.at(0).contains(doc1.type.name)).toBeTruthy()
    expect(documentListItem.at(1).contains(doc2.name)).toBeTruthy()
    expect(documentListItem.at(1).contains(doc2.type.name)).toBeTruthy()
  })

  it('should not show uploaded documents', () => {
    const component = mount(<TradeViewData {...defaultProps} />)

    expect(component.find(UploadedDocuments).exists()).toBeFalsy()
  })

  it('should add documentary requirements', () => {
    const component = shallow(<TradeViewData {...defaultProps} />)

    expect(component.find(DocumentaryRequirements).exists()).toBe(true)
  })

  it('should not add empty documentary requirements', () => {
    const props = {
      ...defaultProps,
      trade: { ...defaultProps.trade, requiredDocuments: [] }
    }
    const component = shallow(<TradeViewData {...props} />)

    expect(component.find(DocumentaryRequirements).exists()).toBe(false)
  })

  it('should not display cargoId for Komgo trade', () => {
    const props = {
      ...defaultProps,
      trade: { ...defaultProps.trade, source: TradeSource.Komgo, requiredDocuments: [] }
    }
    const fields = shallow(<TradeViewData {...props} />)
      .find(DeliveryTerms)
      .shallow()
      .find(Accordion.Content)
      .shallow()
      .find(BasicPanel)
      .shallow()
      .find(HideableLabelledField)

    expect(fields.findWhere(f => f.dive().contains(<Label>Cargo Id</Label>)).exists()).toBeFalsy()
  })

  it('should display cargoId for Vakt trade', () => {
    const props = {
      ...defaultProps,
      trade: { ...defaultProps.trade, source: TradeSource.Vakt, requiredDocuments: [] }
    }
    const fields = shallow(<TradeViewData {...props} />)
      .find(DeliveryTerms)
      .shallow()
      .find(Accordion.Content)
      .shallow()
      .find(BasicPanel)
      .shallow()
      .find(HideableLabelledField)

    expect(fields.length).toBe(7)
    expect(
      fields
        .at(6)
        .dive()
        .contains(<Label>Cargo Id</Label>)
    ).toBeTruthy()
  })

  it('should not add empty laytime and demurrage delivery terms', () => {
    const props = {
      ...defaultProps,
      trade: {
        ...defaultProps.trade,
        laytime: undefined,
        demurrageTerms: undefined
      }
    }
    const fields = shallow(<TradeViewData {...props} />)
      .find(DeliveryTerms)
      .shallow()
      .find(Accordion.Content)
      .shallow()
      .find(BasicPanel)
      .shallow()
      .find(Field)

    expect(fields.length).toBe(2)
    expect(fields.contains(<Label>Laytime</Label>)).toBe(false)
    expect(fields.contains(<Label>Demurrage terms</Label>)).toBe(false)
  })
})

describe('CommodityAndPrice', () => {
  it('matches snapshot to have no nulls when paymentTerms is full of nulls', () => {
    const trade = buildFakeTrade({ paymentTermsOption: PaymentTermsOption.Sight })
    trade.paymentTerms = { eventBase: null, when: null, time: null, timeUnit: null, dayType: null }
    const cargo = buildFakeCargo()

    expect(
      renderer
        .create(
          <CommodityAndPrice
            tradeMovements={[cargo]}
            trade={trade}
            actives={{
              [PANELS.Basic]: true,
              [PANELS.Goods]: true,
              [PANELS.Contract]: true,
              [PANELS.Terms]: true,
              [PANELS.Documents]: true,
              [PANELS.UploadedDocuments]: true,
              [PANELS.Cargo]: true
            }}
            company="Raul Bank"
          />
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
