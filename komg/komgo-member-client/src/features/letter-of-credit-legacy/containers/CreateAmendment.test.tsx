import * as React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import { CreateAmendment, CreateAmendmentProps } from './CreateAmendment'
import * as renderer from 'react-test-renderer'
import { fakeCargo, fakeLetterOfCredit, fakeParcel, fakeTrade, fakeLetterOfCreditDiff } from '../utils/faker'
import { createMemoryHistory } from 'history'
import { cargoDiff, tradeDiff } from '../utils/DiffUtils'
import { Step } from '../components/amendment/CreateAmendmentFlow'
import { mount, ReactWrapper } from 'enzyme'
import { AVAILABLE_WITH_OPTIONS } from '../constants'
import { buildFakeAmendmentBase } from '@komgo/types'

const setFieldValue = jest.fn()
const submitLetterOfCreditAmendment = jest.fn()
const letterOfCredit = fakeLetterOfCredit()

describe('CreateAmendment', () => {
  let props: CreateAmendmentProps
  beforeEach(() => {
    props = {
      submitLetterOfCreditAmendment,
      submitAmendmentError: undefined,
      submitAmendmentLoading: false,
      isAuthorized: () => true,
      tradeId: '123',
      letterOfCreditId: letterOfCredit._id,
      initialValues: {
        diffs: [],
        lcReference: 'ref',
        lcStaticId: letterOfCredit._id,
        version: 1
      },
      letterOfCredit,
      getLetterOfCreditWithTradeAndMovements: jest.fn(),
      getTrade: jest.fn(),
      errors: [],
      isFetching: false,
      history: createMemoryHistory(),
      location: {
        pathname: '',
        search: '',
        state: '',
        hash: ''
      },
      match: {
        isExact: false,
        path: '',
        url: '',
        params: { id: 'E1243' }
      },
      staticContext: undefined
    }
  })

  describe('renders', () => {
    it('without tradeFinanceManager.canManageLCRequests permission', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateAmendment {...props} isAuthorized={() => false} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })
    it('without data', () => {
      expect(
        renderer
          .create(
            <Router>
              <CreateAmendment {...props} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('with trade diffs', () => {
      const tradeOld = fakeTrade()
      const tradeNew = fakeTrade({ price: 100 })
      const tradeAmendments = tradeDiff(tradeOld, tradeNew)
      expect(
        renderer
          .create(
            <Router>
              <CreateAmendment
                {...props}
                initialValues={{
                  ...props.initialValues,
                  diffs: tradeAmendments
                }}
              />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('with nested cargo diffs', () => {
      const parcel = fakeParcel()
      const cargoOld = fakeCargo({ parcels: [parcel] })
      const cargoNew = fakeCargo({ parcels: [{ ...parcel, vesselName: 'boom!' }] })
      const tradeAmendments = cargoDiff(cargoOld, cargoNew)
      expect(
        renderer
          .create(
            <Router>
              <CreateAmendment
                {...props}
                initialValues={{
                  ...props.initialValues,
                  diffs: tradeAmendments
                }}
              />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('adding a parcel', () => {
      const cargoOld = fakeCargo()
      const cargoNew = fakeCargo({ parcels: [fakeParcel()] })
      const tradeAmendments = cargoDiff(cargoOld, cargoNew)
      expect(
        renderer
          .create(
            <Router>
              <CreateAmendment
                {...props}
                initialValues={{
                  ...props.initialValues,
                  diffs: tradeAmendments
                }}
              />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })
  })
  describe('onNext', () => {
    let wrapper: ReactWrapper
    beforeEach(() => {
      jest.resetAllMocks()
      wrapper = mount(
        <Router>
          <CreateAmendment {...props} />
        </Router>
      )
    })

    it('sets expiryPlace if availableWith is changed', () => {
      const amendments = [
        fakeLetterOfCreditDiff({
          path: '/availableWith',
          oldValue: props.letterOfCredit.availableWith,
          value: AVAILABLE_WITH_OPTIONS.ADVISING_BANK
        })
      ]

      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment
      const errs = createAmendmentInstance.onNext(
        { ...props.initialValues, diffs: amendments },
        Step.LetterOfCredit,
        setFieldValue
      )

      expect(errs).toEqual({})

      expect(setFieldValue).toHaveBeenCalledWith('diffs', [
        amendments[0],
        {
          op: 'replace',
          path: '/expiryPlace',
          value: amendments[0].value,
          oldValue: amendments[0].oldValue,
          type: 'ILC'
        }
      ])
    })
    it('removes expiryPlace if availableWith is not there', () => {
      const amendments = [fakeLetterOfCreditDiff({ path: '/expiryPlace' })]

      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment

      createAmendmentInstance.onNext({ ...props.initialValues, diffs: amendments }, Step.LetterOfCredit, setFieldValue)

      expect(setFieldValue).toHaveBeenCalledWith('diffs', [])
    })
    it('edits expiryPlace if it is already there', () => {
      const amendments = [
        fakeLetterOfCreditDiff({
          path: '/expiryPlace',
          value: AVAILABLE_WITH_OPTIONS.ISSUING_BANK,
          oldValue: AVAILABLE_WITH_OPTIONS.ADVISING_BANK
        }),
        fakeLetterOfCreditDiff({
          path: '/availableWith',
          value: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
          oldValue: AVAILABLE_WITH_OPTIONS.ISSUING_BANK
        })
      ]

      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment

      const errors = createAmendmentInstance.onNext(
        { ...props.initialValues, diffs: amendments },
        Step.LetterOfCredit,
        setFieldValue
      )

      expect(errors).toEqual({})

      expect(setFieldValue).toHaveBeenCalledWith('diffs', [
        {
          op: 'replace',
          path: '/expiryPlace',
          oldValue: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
          value: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
          type: 'ILC'
        },
        {
          op: 'replace',
          path: '/availableWith',
          oldValue: AVAILABLE_WITH_OPTIONS.ISSUING_BANK,
          value: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
          type: 'ILC'
        }
      ])
    })
    it('returns an error if an empty field is present', () => {
      const amendments = [fakeLetterOfCreditDiff({ path: '', value: '', oldValue: '' })]

      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment

      const errors = createAmendmentInstance.onNext(
        { ...props.initialValues, diffs: amendments },
        Step.LetterOfCredit,
        setFieldValue
      )

      expect(errors).toEqual({ '': 'Empty update field(s) are present.' })
    })
    it('returns an error if a field oldValue is equal to new value', () => {
      const amendments = [
        fakeLetterOfCreditDiff({
          path: '/availableWith',
          value: AVAILABLE_WITH_OPTIONS.ISSUING_BANK,
          oldValue: AVAILABLE_WITH_OPTIONS.ISSUING_BANK
        })
      ]

      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment

      const errors = createAmendmentInstance.onNext(
        { ...props.initialValues, diffs: amendments },
        Step.LetterOfCredit,
        setFieldValue
      )

      expect(errors).toEqual({
        availableWith: "'Available with' field was left unchanged. Please remove the update or make a change."
      })
    })
    it('returns an error if an amended LC field change is invalid', () => {
      const amendments = [
        fakeLetterOfCreditDiff({
          path: '/amount',
          value: -100,
          oldValue: props.letterOfCredit.amount
        })
      ]
      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment

      const errors = createAmendmentInstance.onNext(
        { ...props.initialValues, diffs: amendments },
        Step.LetterOfCredit,
        setFieldValue
      )

      expect(errors).toEqual({
        amount: "'Opening amount' should be greater than or equal to 0.01"
      })
    })
  })
  describe('submission', () => {
    let wrapper: ReactWrapper
    beforeEach(() => {
      jest.resetAllMocks()
      wrapper = mount(
        <Router>
          <CreateAmendment {...props} />
        </Router>
      )
    })
    it('calls submitLetterOfCreditAmendment with right args', () => {
      const createAmendmentInstance = wrapper.find(CreateAmendment).instance() as CreateAmendment

      const amendment = buildFakeAmendmentBase()
      createAmendmentInstance.onSubmit(amendment)

      expect(submitLetterOfCreditAmendment).toHaveBeenCalledWith(amendment, letterOfCredit._id)
    })
  })
})
