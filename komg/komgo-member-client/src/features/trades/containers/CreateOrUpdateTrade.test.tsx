jest.mock('uuid', () => {
  const uuid = jest.requireActual('uuid')
  return {
    ...uuid,
    v4: jest.fn(() => uuid.v4())
  }
})

import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { v4 } from 'uuid'
import { CreateOrUpdateTrade, IProps } from './CreateOrUpdateTrade'
import { shallow, mount, render, ShallowWrapper, ReactWrapper } from 'enzyme'
import { FormikProps, Formik } from 'formik'
import { ICreateOrUpdateTrade, TradeActionType } from '../store/types'
import { fakeMember, fakeLetterOfCredit, fakeTrade, fakeTradeSeller } from '../../letter-of-credit-legacy/utils/faker'
import { Unauthorized, LoadingTransition, ErrorMessage } from '../../../components'
import { Header, Button } from 'semantic-ui-react'
import { initialTradeData, initialCargoData, TradingRole } from '../constants'
import {
  TradeSource,
  CreditRequirements,
  Law,
  Commodity,
  PaymentTermsEventBase,
  DeliveryTerms,
  buildFakeParcel,
  buildFakeTradeBase,
  buildFakeCargoBase,
  ICargoBase,
  ITradeBase,
  TRADE_SCHEMA_VERSION,
  buildFakeTrade,
  ITrade,
  PriceUnit,
  Currency,
  PaymentTermsOption,
  PriceOption,
  PaymentTermsDayType,
  PaymentTermsWhen,
  PaymentTermsTimeUnit,
  buildFakeCargo,
  ModeOfTransport,
  InvoiceQuantity,
  buildFakeStandByLetterOfCredit,
  IReceivablesDiscountingInfo,
  RDStatus
} from '@komgo/types'
import { createMemoryHistory } from 'history'
import { User } from '../../../store/common/types'
import { MemoryRouter as Router } from 'react-router-dom'
import { fakeRdInfo } from '../../receivable-discounting-legacy/utils/faker'
import { replaceEmptyStringsAndNullWithUndefined } from '../utils/formatters'
import { ReturnContext } from '../../receivable-discounting-legacy/utils/constants'

const testValues: ICreateOrUpdateTrade = {
  documents: [],
  lawOther: '',
  trade: initialTradeData as any,
  cargo: initialCargoData as any
}

const fakeFormik: FormikProps<ICreateOrUpdateTrade> = {
  values: testValues,
  errors: {},
  touched: {},
  isValidating: false,
  isSubmitting: false,
  submitCount: 0,
  setStatus: () => null,
  setError: () => null,
  setErrors: () => null,
  setSubmitting: () => null,
  setTouched: () => null,
  setValues: () => null,
  setFieldValue: jest.fn(),
  setFieldTouched: () => null,
  setFieldError: () => null,
  validateForm: async () => ({}),
  validateField: async () => ({}),
  resetForm: () => null,
  submitForm: () => null,
  setFormikState: () => null,
  handleSubmit: () => null,
  handleReset: () => null,
  handleBlur: () => () => null,
  handleChange: () => () => null,
  dirty: false,
  isValid: true,
  initialValues: testValues,
  registerField: jest.fn(),
  unregisterField: jest.fn()
}

export const fakeDocumentType = {
  id: 'letterOfIndemnity',
  name: 'LOI',
  sourceId: 'LETTER_OF_INDEMNITY',
  fields: null,
  predefined: true,
  product: {
    id: 'tradeFinance',
    name: 'TRADE FINANCE'
  },
  category: {
    id: 'trade-documents',
    name: 'Trade Documents',
    product: {
      id: 'tradeFinance',
      name: 'TRADE FINANCE'
    }
  }
}

describe('CreateOrUpdateTrade container', () => {
  let defaultProps: IProps
  let trade: ITrade
  let defaultEditTradeProps: IProps
  let matchWithId
  let rdInfo: IReceivablesDiscountingInfo

  beforeEach(() => {
    defaultProps = {
      history: createMemoryHistory(),
      staticContext: {},
      confirmError: null,
      documentTypesError: null,
      tradeMovements: [],
      deleteTradeLoader: false,
      createEditLoader: false,
      isUploadingDocs: false,
      isAuthorized: () => true,
      company: fakeMember(),
      members: [
        fakeMember(),
        fakeMember({ isFinancialInstitution: false, isMember: true, staticId: 'abc', commonName: 'A Trader' })
      ],
      documentTypes: [fakeDocumentType as any],
      match: {
        isExact: true,
        path: '',
        url: '',
        params: {}
      },
      location: {
        pathname: '',
        search: '',
        state: '',
        hash: ''
      },
      profile: { id: 'abc', username: 'aaa', firstName: 'a', lastName: 'aa', email: 'b', createdAt: 0, company: 'c' },
      uploadedDocuments: [],
      isFetching: false,
      fetchMembers: jest.fn(),
      createTrade: jest.fn(),
      dispatch: jest.fn(),
      fetchDocumentTypesAsync: jest.fn(),
      fetchTradesDashboardData: jest.fn(),
      editTrade: jest.fn(),
      fetchMovements: jest.fn(),
      deleteTrade: jest.fn(),
      fetchTradeWithDocuments: jest.fn(),
      clearError: jest.fn(),
      errors: []
    }

    matchWithId = { ...defaultProps.match, params: { id: '123' } }

    trade = fakeTrade({
      source: TradeSource.Komgo,
      sourceId: 'E1243'
    })

    rdInfo = fakeRdInfo()

    const rdInfoWithTradeShapshot = {
      ...rdInfo,
      tradeSnapshot: {
        ...rdInfo.tradeSnapshot,
        trade
      }
    }

    defaultEditTradeProps = {
      ...defaultProps,
      trade,
      rdInfo: rdInfoWithTradeShapshot,
      tradeMovements: [],
      match: matchWithId
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render unauthorized', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} isAuthorized={() => false} />)

    expect(wrapper.find(Unauthorized).length).toBe(1)
  })

  it('should render trade loading', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} match={matchWithId} isFetching={true} />)

    expect(wrapper.find(LoadingTransition).length).toBe(1)
  })

  it('should render trade fetching error', () => {
    const matchWithId = { ...defaultProps.match, params: { id: '123' } }
    const wrapper = shallow(
      <CreateOrUpdateTrade
        {...defaultProps}
        errors={[{ message: 'Error', errorCode: '1', origin: 'origin', requestId: '1' }]}
        match={matchWithId}
      />
    )

    expect(wrapper.find(ErrorMessage).length).toBe(1)
  })

  it('should clear errors on unmount', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)

    wrapper.unmount()

    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.EDIT_TRADE_REQUEST)
    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.EDIT_CARGO_REQUEST)
    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.CREATE_CARGO_REQUEST)
    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.CREATE_TRADE_REQUEST)
    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.DELETE_CARGO_REQUEST)
    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.DELETE_TRADE_REQUEST)
    expect(defaultProps.clearError).toHaveBeenCalledWith(TradeActionType.UPLOAD_TRADE_DOCUMENT_REQUEST)
  })

  it('should open confirm when handleSubmit is called', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrUpdateTrade
    instance.handleSubmit(testValues, fakeFormik)

    expect(instance.state.openConfirm).toBe(true)
  })

  it('should open confirm and then close when closed is clicked', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrUpdateTrade
    instance.handleSubmit(testValues, fakeFormik)
    instance.handleCancelSubmit()

    expect(instance.state.openConfirm).toBe(false)
  })

  it('should open confirm for delete trade', () => {
    const wrapper = mount(
      <Router>
        <CreateOrUpdateTrade {...defaultEditTradeProps} />
      </Router>
    )

    const instance = wrapper.find(CreateOrUpdateTrade).instance() as CreateOrUpdateTrade
    const deleteButton = wrapper.find('button[data-test-id="delete-trade"]').first()

    deleteButton.simulate('click')

    expect(instance.state.confirmDeleteTradeOpen).toBe(true)
  })

  it('should call delete trade function when confirm deleting', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} />)

    const instance = wrapper.instance() as CreateOrUpdateTrade
    instance.toggleLcInfoProps()

    expect(instance.state.lcInfoPromp).toBe(false)
  })

  it('should call deleteTrade', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} />)

    const instance = wrapper.instance() as CreateOrUpdateTrade
    instance.deleteTrade()

    expect(defaultProps.deleteTrade).toHaveBeenCalled()
  })

  it('should call createTrade function when submit is confirmed and trade id does not exists', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrUpdateTrade

    instance.setState({
      values: { ...instance.state.values, trade: { ...instance.state.values.trade, sourceId: 'test-source-id-1' } }
    })
    instance.handleConfirmSubmit()

    expect(defaultProps.createTrade).toHaveBeenCalledWith(
      expect.objectContaining({ trade: expect.objectContaining({ sourceId: 'test-source-id-1' }) }),
      expect.anything(),
      expect.anything()
    )
  })

  describe('OTHER field overrides', () => {
    describe('law', () => {
      describe('createTrade', () => {
        it('should be called with the cleaned up law value if law is OTHER', () => {
          const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
          const instance = wrapper.instance() as CreateOrUpdateTrade

          instance.setState({
            values: {
              ...instance.state.values,
              lawOther: 'someOtherLaw',
              trade: { ...instance.state.values.trade, law: Law.Other }
            }
          })
          instance.handleConfirmSubmit()

          expect(defaultProps.createTrade).toHaveBeenCalledWith(
            expect.objectContaining({ trade: expect.objectContaining({ law: 'someOtherLaw' }) }),
            expect.anything(),
            expect.anything()
          )
        })

        it('should be called with a normal law value if given', () => {
          const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
          const instance = wrapper.instance() as CreateOrUpdateTrade

          instance.setState({
            values: {
              ...instance.state.values,
              trade: { ...instance.state.values.trade, law: Law.NewYorkLaw }
            }
          })
          instance.handleConfirmSubmit()

          expect(defaultProps.createTrade).toHaveBeenCalledWith(
            expect.objectContaining({ trade: expect.objectContaining({ law: Law.NewYorkLaw }) }),
            expect.anything(),
            expect.anything()
          )
        })
      })

      it('should call editTrade with the cleaned up law value if law is OTHER', () => {
        const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} />)
        const instance = wrapper.instance() as CreateOrUpdateTrade

        instance.setState({
          values: {
            ...instance.state.values,
            lawOther: 'someOtherLaw',
            trade: { ...instance.state.values.trade, law: Law.Other }
          }
        })
        instance.handleConfirmSubmit()

        expect(defaultEditTradeProps.editTrade).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ trade: expect.objectContaining({ law: 'someOtherLaw' }) }),
          'E1243',
          expect.anything(),
          expect.anything(),
          undefined
        )
      })
    })
    it('should call createTrade with commodity from commodityOther if commodity OTHER dropdown is selected', () => {
      const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
      const instance = wrapper.instance() as CreateOrUpdateTrade

      instance.setState({
        values: {
          ...instance.state.values,
          commodityOther: 'wood',
          trade: { ...instance.state.values.trade, commodity: Commodity.Other }
        }
      })
      instance.handleConfirmSubmit()

      expect(defaultProps.createTrade).toHaveBeenCalledWith(
        expect.objectContaining({ trade: expect.objectContaining({ commodity: 'wood' }) }),
        expect.anything(),
        expect.anything()
      )
    })
    it('should call createTrade with eventBase from eventBaseOther if eventBase OTHER dropdown is selected', () => {
      const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
      const instance = wrapper.instance() as CreateOrUpdateTrade

      instance.setState({
        values: {
          ...instance.state.values,
          eventBaseOther: 'ABCDEF',
          trade: {
            ...instance.state.values.trade,
            paymentTermsOption: PaymentTermsOption.Deferred,
            paymentTerms: { ...instance.state.values.trade.paymentTerms, eventBase: PaymentTermsEventBase.Other }
          }
        }
      })
      instance.handleConfirmSubmit()

      expect(defaultProps.createTrade).toHaveBeenCalledWith(
        expect.objectContaining({
          trade: expect.objectContaining({ paymentTerms: expect.objectContaining({ eventBase: 'ABCDEF' }) })
        }),
        expect.anything(),
        expect.anything()
      )
    })
    it('should call createTrade with deliveryTerms from deliveryTermsOther if deliveryTerms OTHER dropdown is selected', () => {
      const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
      const instance = wrapper.instance() as CreateOrUpdateTrade

      instance.setState({
        values: {
          ...instance.state.values,
          deliveryTermsOther: 'ONTIME',
          trade: {
            ...instance.state.values.trade,
            deliveryTerms: DeliveryTerms.Other
          }
        }
      })
      instance.handleConfirmSubmit()

      expect(defaultProps.createTrade).toHaveBeenCalledWith(
        expect.objectContaining({
          trade: expect.objectContaining({ deliveryTerms: 'ONTIME' })
        }),
        expect.anything(),
        expect.anything()
      )
    })
  })

  it('should call editTrade function when submit is confirmed and trade id exists', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} />)
    const instance = wrapper.instance() as CreateOrUpdateTrade

    instance.setState({
      values: { ...instance.state.values, trade: { ...instance.state.values.trade, sourceId: 'test-source-id-2' } }
    })

    instance.handleConfirmSubmit()

    expect(defaultEditTradeProps.editTrade).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ trade: expect.objectContaining({ sourceId: 'test-source-id-2' }) }),
      'E1243',
      expect.anything(),
      expect.anything(),
      undefined
    )
  })

  it('should call editTrade function when submit is confirmed and trade id exists with custom return params', () => {
    const returnId = 'returnId'
    const location: any = {
      search: `?returnContext=${ReturnContext.RDViewRequest}&returnId=${returnId}`
    }
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} location={location} />)
    const instance = wrapper.instance() as CreateOrUpdateTrade

    instance.setState({
      values: { ...instance.state.values, trade: { ...instance.state.values.trade, sourceId: 'test-source-id-2' } }
    })

    instance.handleConfirmSubmit()

    expect(defaultEditTradeProps.editTrade).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ trade: expect.objectContaining({ sourceId: 'test-source-id-2' }) }),
      'E1243',
      expect.anything(),
      expect.anything(),
      `/receivable-discounting/${returnId}`
    )
  })

  it('should render add trade title', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
    const title = wrapper
      .find(Formik)
      .shallow()
      .find(Header)
      .shallow()

    expect(title.text()).toBe('Create trade')
  })

  it('should render edit trade title', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} />)
    const title = wrapper
      .find(Formik)
      .shallow()
      .find(Header)
      .shallow()

    expect(title.text()).toBe('Edit trade')
  })

  it('should render Submit button', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultProps} />)
    const button = wrapper
      .find(Formik)
      .shallow()
      .find(Button)
      .at(1)
      .shallow()

    expect(button.text()).toBe('Create trade')
  })

  it('should render Update button', () => {
    const wrapper = shallow(<CreateOrUpdateTrade {...defaultEditTradeProps} />)
    const button = wrapper
      .find(Formik)
      .shallow()
      .find(Button)
      .at(2)
      .shallow()

    expect(button.text()).toBe('Update trade')
  })

  it('should find Delete button', () => {
    const wrapper = mount(
      <Router>
        <CreateOrUpdateTrade {...defaultEditTradeProps} />
      </Router>
    )
    const deleteButton = wrapper.find('button[data-test-id="delete-trade"]').first()

    expect(deleteButton.text()).toBe('Delete')
  })

  it('should not find Delete button with a trade with an associated letter of credit', () => {
    const wrapper = mount(
      <Router>
        <CreateOrUpdateTrade {...defaultEditTradeProps} letterOfCredit={fakeLetterOfCredit()} />
      </Router>
    )
    const deleteButton = wrapper.find('button[data-test-id="delete-trade"]')

    expect(deleteButton.length).toBe(0)
  })

  it('should allow to edit trade with credit requirement Open Credit and trade status something other than TO_BE_DISCOUNTED', () => {
    const sellerCompany: User = {
      company: 'seller',
      id: 'abc',
      username: 'aaa',
      firstName: 'a',
      lastName: 'aa',
      email: 'b',
      createdAt: 0
    }

    const props: IProps = {
      ...defaultEditTradeProps,
      profile: sellerCompany,
      trade: {
        seller: sellerCompany.company,
        ...defaultEditTradeProps.trade,
        creditRequirement: CreditRequirements.OpenCredit,
        status: 'REQUESTED'
      }
    }

    const wrapper = shallow(<CreateOrUpdateTrade {...props} />)

    const error = wrapper.find(ErrorMessage)

    expect(error.length).toBe(0)
  })

  describe('Editing a trade with RD Status', () => {
    let props: IProps

    beforeEach(() => {
      const sellerCompany: User = {
        company: 'seller',
        id: 'abc',
        username: 'aaa',
        firstName: 'a',
        lastName: 'aa',
        email: 'b',
        createdAt: 0
      }

      props = {
        ...defaultEditTradeProps,
        profile: sellerCompany,
        trade: {
          ...fakeTradeSeller({ source: TradeSource.Komgo }),
          seller: sellerCompany.company,
          creditRequirement: CreditRequirements.OpenCredit,
          tradingRole: TradingRole.SELLER,
          status: 'TO_BE_DISCOUNTED'
        },
        rdInfo: {
          ...defaultEditTradeProps.rdInfo,
          status: RDStatus.QuoteAccepted
        }
      }
    })

    it('should render correctly all fields', () => {
      ;(v4 as any).mockImplementationOnce(() => 'some-id')
      expect(
        renderer
          .create(
            <Router>
              <CreateOrUpdateTrade {...defaultEditTradeProps} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('is editable when RDStatus is QuoteAccepted', () => {
      const wrapper = shallow(<CreateOrUpdateTrade {...props} />)

      const error = wrapper.find(ErrorMessage)

      expect(error.length).toBe(0)
    })

    it('is editable when RDStatus is PendingRequest', () => {
      props.rdInfo.status = RDStatus.PendingRequest
      const wrapper = shallow(<CreateOrUpdateTrade {...props} />)

      const error = wrapper.find(ErrorMessage)

      expect(error.length).toBe(0)
    })

    it('is NOT editable when RDStatus is Requested', () => {
      props.rdInfo.status = RDStatus.Requested
      const wrapper = shallow(<CreateOrUpdateTrade {...props} />)
      const error = wrapper.find(ErrorMessage)

      expect(error.props().error).toBe("Can't edit this trade")
    })

    it('is NOT editable when RDStatus is QuoteSubmitted', () => {
      props.rdInfo.status = RDStatus.QuoteSubmitted
      const wrapper = shallow(<CreateOrUpdateTrade {...props} />)

      const error = wrapper.find(ErrorMessage)

      expect(error.props().error).toBe("Can't edit this trade")
    })

    it('should allow editing all editable fields for QuoteAccepted', () => {
      props.profile.company = props.trade.seller
      props.trade.paymentTermsOption = PaymentTermsOption.Deferred
      const component = mount(
        <Router>
          <CreateOrUpdateTrade {...props} />
        </Router>
      )

      for (const field of [
        'trade.buyerEtrmId',
        'trade.contractReference',
        'trade.contractDate',
        'trade.generalTermsAndConditions',
        'trade.quantity',
        'trade.price',
        'trade.law',
        'trade.deliveryPeriod.startDate',
        'trade.deliveryPeriod.endDate',
        'trade.paymentTerms.when',
        'trade.paymentTerms.dayType',
        'trade.paymentTerms.timeUnit',
        'trade.paymentTerms.eventBase',
        'cargo.quality',
        'cargo.originOfGoods'
      ]) {
        expect(
          component
            .find(`[name="${field}"]`)
            .first()
            .prop('disabled')
        ).toBeFalsy()
      }
    })

    it('should disallow editing all non-editable fields for QuoteAccepted', () => {
      props.profile.company = props.trade.seller
      const component = mount(
        <Router>
          <CreateOrUpdateTrade {...props} />
        </Router>
      )

      for (const field of [
        'trade.buyer',
        'trade.seller',
        'trade.sellerEtrmId',
        'trade.minTolerance',
        'trade.maxTolerance',
        'trade.deliveryLocation',
        'trade.creditRequirement',
        'trade.commodity',
        'trade.invoiceQuantity',
        'trade.priceUnit',
        'trade.priceOption',
        'trade.priceFormula',
        'trade.currency',
        'trade.paymentTermsOption',
        'trade.deliveryTerms',
        // NOTE cargoId temporary removed from ui
        // 'cargo.cargoId',
        'cargo.grade'
      ]) {
        expect(
          component
            .find(`[name="${field}"]`)
            .first()
            .prop('disabled')
        ).toBeTruthy()
      }

      expect(component.find(`[name="cargo.cargoId"]`).exists()).toBeFalsy()
    })
  })

  it('should allow submission after all mandatory fields are filled in for buyer trade', done => {
    const wrapper = mount(
      <Router>
        <CreateOrUpdateTrade {...defaultProps} />
      </Router>
    )

    const seller = defaultProps.members[1]

    const trade = buildFakeTradeBase({
      seller: seller.staticId,
      commodity: Commodity.CrudeOil,
      version: TRADE_SCHEMA_VERSION.V2
    })
    const cargo = buildFakeCargoBase({ parcels: [buildFakeParcel({ _id: '1234' })] })

    wrapper
      .find('input[name="trade.dealDate"]')
      .simulate('change', { target: { value: trade.dealDate, name: 'trade.dealDate' } })

    wrapper
      .find('div[name="trade.seller"]')
      .find(`[value="${trade.seller}"]`)
      .find('div[role="option"]')
      .simulate('click')

    wrapper.find('input[name="trade.price"]').simulate('focus')
    wrapper
      .find('input[name="trade.price"]')
      .simulate('change', { target: { value: `${trade.price}`, name: 'trade.price' } })
    wrapper.find('input[name="trade.price"]').simulate('blur')

    wrapper.find('input[name="trade.quantity"]').simulate('focus')
    wrapper
      .find('input[name="trade.quantity"]')
      .simulate('change', { target: { value: trade.quantity, name: 'trade.quantity' } })
    wrapper.find('input[name="trade.quantity"]').simulate('blur')

    wrapper
      .find('div[name="trade.commodity"]')
      .find(`[value="${trade.commodity}"]`)
      .find('div[role="option"]')
      .simulate('click')

    wrapper
      .find('div[name="trade.invoiceQuantity"]')
      .find(`[value="${trade.invoiceQuantity}"]`)
      .find('div[role="option"]')
      .simulate('click')

    wrapper
      .find('input[name="trade.deliveryPeriod.startDate"]')
      .simulate('change', { target: { value: trade.deliveryPeriod.startDate, name: 'trade.deliveryPeriod.startDate' } })

    wrapper
      .find('input[name="trade.deliveryPeriod.endDate"]')
      .simulate('change', { target: { value: trade.deliveryPeriod.endDate, name: 'trade.deliveryPeriod.endDate' } })

    wrapper
      .find('input[name="trade.buyerEtrmId"]')
      .simulate('change', { target: { value: trade.buyerEtrmId, name: 'trade.buyerEtrmId' } })

    // cargoId temporary hidden
    // wrapper
    //   .find('input[name="cargo.cargoId"]')
    //   .simulate('change', { target: { value: cargo.cargoId, name: 'cargo.cargoId' } })

    wrapper
      .find('input[name="cargo.grade"]')
      .simulate('change', { target: { value: cargo.grade, name: 'cargo.grade' } })

    wrapper
      .find('input[name="trade.deliveryLocation"]')
      .simulate('change', { target: { value: trade.deliveryLocation, name: 'trade.deliveryLocation' } })

    wrapper
      .find('button[type="submit"]')
      .first()
      .simulate('click')

    setTimeout(() => {
      // not ideal to open this manually, not sure why it doesnt open...
      wrapper.setState({ openConfirm: true })

      wrapper.find('button[data-test-id="submit-trade-form"]').simulate('click')

      const extectedCargo = {
        ...replaceEmptyStringsAndNullWithUndefined(initialCargoData),
        grade: cargo.grade,
        cargoId: expect.stringMatching(
          /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
        )
      } as ICargoBase

      expect(defaultProps.createTrade).toHaveBeenCalledWith(
        {
          cargo: extectedCargo,
          commodityOther: '',
          deliveryTermsOther: '',
          documents: [],
          eventBaseOther: '',
          lawOther: '',
          trade: replaceEmptyStringsAndNullWithUndefined({
            ...initialTradeData,
            buyerEtrmId: trade.buyerEtrmId,
            deliveryPeriod: trade.deliveryPeriod,
            invoiceQuantity: trade.invoiceQuantity,
            commodity: trade.commodity,
            quantity: trade.quantity,
            price: trade.price,
            seller: trade.seller,
            dealDate: trade.dealDate,
            buyer: defaultProps.members[0].staticId,
            creditRequirement: CreditRequirements.StandbyLetterOfCredit,
            priceFormula: undefined,
            paymentTerms:
              initialTradeData.paymentTermsOption === PaymentTermsOption.Deferred
                ? initialTradeData.paymentTerms
                : undefined,
            deliveryLocation: trade.deliveryLocation
          } as ITradeBase)
        },
        defaultProps.profile,
        TradingRole.BUYER
      )

      done()
    }, 0)
  })

  it('should allow submission after all mandatory fields are filled in for seller trade', done => {
    const wrapper = mount(
      <Router>
        <CreateOrUpdateTrade {...defaultProps} />
      </Router>
    )

    const buyer = defaultProps.members[1]

    const trade = buildFakeTradeBase({
      buyer: buyer.staticId,
      sellerEtrmId: 'seller id',
      commodity: Commodity.Gas,
      version: TRADE_SCHEMA_VERSION.V2
    })

    wrapper
      .find('[label="Seller"]')
      .find('input')
      .simulate('click')

    wrapper
      .find('input[name="trade.dealDate"]')
      .simulate('change', { target: { value: trade.dealDate, name: 'trade.dealDate' } })

    wrapper
      .find('div[name="trade.buyer"]')
      .find(`[value="${trade.buyer}"]`)
      .find('div[role="option"]')
      .simulate('click')

    wrapper.find('input[name="trade.price"]').simulate('focus')
    wrapper
      .find('input[name="trade.price"]')
      .simulate('change', { target: { value: `${trade.price}`, name: 'trade.price' } })
    wrapper.find('input[name="trade.price"]').simulate('blur')

    wrapper.find('input[name="trade.quantity"]').simulate('focus')
    wrapper
      .find('input[name="trade.quantity"]')
      .simulate('change', { target: { value: trade.quantity, name: 'trade.quantity' } })
    wrapper.find('input[name="trade.quantity"]').simulate('blur')

    wrapper
      .find('div[name="trade.invoiceQuantity"]')
      .find(`[value="${trade.invoiceQuantity}"]`)
      .find('div[role="option"]')
      .simulate('click')

    wrapper
      .find('input[name="trade.deliveryPeriod.startDate"]')
      .simulate('change', { target: { value: trade.deliveryPeriod.startDate, name: 'trade.deliveryPeriod.startDate' } })

    wrapper
      .find('input[name="trade.deliveryPeriod.endDate"]')
      .simulate('change', { target: { value: trade.deliveryPeriod.endDate, name: 'trade.deliveryPeriod.endDate' } })

    wrapper
      .find('input[name="trade.sellerEtrmId"]')
      .simulate('change', { target: { value: trade.sellerEtrmId, name: 'trade.sellerEtrmId' } })

    wrapper
      .find('div[name="trade.commodity"]')
      .find(`[value="${trade.commodity}"]`)
      .find('div[role="option"]')
      .simulate('click')

    wrapper
      .find('input[name="trade.deliveryLocation"]')
      .simulate('change', { target: { value: trade.deliveryLocation, name: 'trade.deliveryLocation' } })

    wrapper
      .find('button[type="submit"]')
      .first()
      .simulate('click')

    setTimeout(() => {
      // not ideal to open this manually, not sure why it doesnt open...
      wrapper.setState({ openConfirm: true })

      wrapper.find('button[data-test-id="submit-trade-form"]').simulate('click')

      expect(defaultProps.createTrade).toHaveBeenCalledWith(
        {
          cargo: expect.objectContaining({
            ...replaceEmptyStringsAndNullWithUndefined(initialCargoData),
            cargoId: expect.stringMatching(
              /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
            ) // match autogenerated cargoId on create, if no data entered
          }),
          commodityOther: '',
          deliveryTermsOther: '',
          documents: [],
          eventBaseOther: '',
          lawOther: '',
          trade: replaceEmptyStringsAndNullWithUndefined({
            ...initialTradeData,
            sellerEtrmId: trade.sellerEtrmId,
            deliveryPeriod: trade.deliveryPeriod,
            invoiceQuantity: trade.invoiceQuantity,
            commodity: trade.commodity,
            quantity: trade.quantity,
            price: trade.price,
            buyer: trade.buyer,
            dealDate: trade.dealDate,
            seller: defaultProps.members[0].staticId,
            creditRequirement: CreditRequirements.OpenCredit,
            paymentTermsOption: undefined,
            paymentTerms:
              initialTradeData.paymentTermsOption === PaymentTermsOption.Deferred
                ? initialTradeData.paymentTerms
                : undefined,
            priceFormula: undefined,
            deliveryLocation: trade.deliveryLocation
          } as ITradeBase)
        },
        defaultProps.profile,
        TradingRole.SELLER
      )

      done()
    }, 0)
  })
  it('should keep the right set of parcels when one is removed', () => {
    const id1 = v4()
    const id2 = v4()

    const wrapper = mount(
      <Router>
        <CreateOrUpdateTrade {...defaultProps} />
      </Router>
    )

    wrapper.find('button[data-test-id="addParcel"]').simulate('click')

    wrapper.find('button[data-test-id="addParcel"]').simulate('click')

    expect(wrapper.find('input[name="id"]').length).toEqual(2)

    wrapper
      .find('input[name="id"]')
      .first()
      .simulate('change', { target: { value: id1, name: 'id' } })

    wrapper
      .find('input[name="id"]')
      .last()
      .simulate('change', { target: { value: id2, name: 'id' } })

    wrapper.find('i[data-test-id="parcelForm-0-removeParcel"]').simulate('click')
    wrapper.find('button[data-test-id="confirm-remove-parcel"]').simulate('click')

    expect(wrapper.find('input[name="id"]').length).toEqual(1)
    expect(wrapper.find('input[name="id"]').prop('value')).toEqual(id2)
  })
  describe('update trade', () => {
    it('matches snapshot', () => {
      const seller = defaultProps.members[1]

      const inputTrade: ITrade = {
        ...buildFakeTrade({
          seller: seller.staticId,
          sellerEtrmId: 'sellerEtrm',
          buyerEtrmId: 'buyerEtrm',
          commodity: Commodity.CrudeOil,
          version: TRADE_SCHEMA_VERSION.V2,
          dealDate: '2019-07-02',
          invoiceQuantity: InvoiceQuantity.Load,
          minTolerance: 1,
          maxTolerance: 4,
          priceUnit: PriceUnit.DMT,
          price: 400.33,
          currency: Currency.AED,
          paymentTermsOption: PaymentTermsOption.Deferred,
          deliveryPeriod: { startDate: '2019-06-01', endDate: '2019-08-02' },
          deliveryTerms: 'OTHER DELIVERY TERMS' as DeliveryTerms,
          deliveryLocation: 'PARIS',
          creditRequirement: CreditRequirements.StandbyLetterOfCredit
        }),
        priceOption: PriceOption.Fix,
        paymentTerms: {
          eventBase: PaymentTermsEventBase.NoticeOfReadiness,
          time: 44,
          when: PaymentTermsWhen.After,
          timeUnit: PaymentTermsTimeUnit.Years,
          dayType: PaymentTermsDayType.Calendar
        },
        contractReference: 'myRef',
        contractDate: '2017-04-05',
        generalTermsAndConditions: 'some tcs',
        law: Law.SingaporeLaw
      }
      const inputCargo = buildFakeCargo({
        parcels: [
          {
            ...buildFakeParcel({
              _id: 'abc',
              id: 'myParcelId',
              startDate: '2019-01-01',
              endDate: '2019-03-01',
              modeOfTransport: ModeOfTransport.Warehouse,
              deemedBLDate: '2020-03-04',
              loadingPlace: 'TIMBUKTU',
              destinationPlace: 'POGGIBONSI',
              quantity: 66
            }),
            tankFarmOperatorName: 'JIMMY'
          }
        ],
        grade: 'myGrade',
        quality: 'highQuality',
        originOfGoods: 'Barbados',
        cargoId: 'myCargoId'
      })

      expect(
        renderer.create(
          <Router>
            <CreateOrUpdateTrade {...defaultEditTradeProps} trade={inputTrade} tradeMovements={[inputCargo]} />
          </Router>
        )
      ).toMatchSnapshot()
    })

    it('does info about trade not updating version in financial instrument if no financial instrument is provided', () => {
      const wrapper = mount(
        <Router>
          <CreateOrUpdateTrade
            {...defaultEditTradeProps}
            letterOfCredit={undefined}
            standbyLetterOfCredit={undefined}
          />
        </Router>
      )

      expect(wrapper.find('div[data-test-id="live-financial-instruments-warning"]').length).toEqual(0)
    })
    it('shows info about trade not updating version in financial instrument if an lc is provided', () => {
      const wrapper = mount(
        <Router>
          <CreateOrUpdateTrade {...defaultEditTradeProps} letterOfCredit={fakeLetterOfCredit()} />
        </Router>
      )

      expect(wrapper.find('div[data-test-id="live-financial-instruments-warning"]').length).toEqual(1)
    })
    it('shows info about trade not updating version in financial instrument if an SBLC is provided', () => {
      const wrapper = mount(
        <Router>
          <CreateOrUpdateTrade {...defaultEditTradeProps} standbyLetterOfCredit={buildFakeStandByLetterOfCredit()} />
        </Router>
      )

      expect(wrapper.find('div[data-test-id="live-financial-instruments-warning"]').length).toEqual(1)
    })
  })
})
