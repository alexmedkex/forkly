import { Divider, Header, Segment } from 'semantic-ui-react'
import Ajv from 'ajv'
import * as React from 'react'
import { compose } from 'redux'
import { AMENDMENT_BASE_SCHEMA, ILCAmendmentBase, IDiff, ITrade, ICargo } from '@komgo/types'
import { withPermissions, WithPermissionsProps } from '../../../components/with-permissions'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'
import { TradeActionType } from '../../trades/store/types'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
import { LetterOfCreditActionType } from '../store/types'
import { ErrorMessage } from '../../../components/error-message'
import { getLetterOfCreditWithTradeAndMovements } from '../store/actions'
import { submitLetterOfCreditAmendment } from '../store/amendments/actions'
import { LoadingTransition } from '../../../components/loading-transition'
import { cargoDiff, tradeDiff } from '../utils/DiffUtils'
import { Unauthorized, Wizard } from '../../../components'
import { CreateAmendmentStateMachine, Step } from '../components/amendment/CreateAmendmentFlow'
import TradeStep from '../components/amendment/TradeStep'
import SummaryStep from '../components/amendment/SummaryStep'
import LetterOfCreditAmendmentStep, { amendableFields } from '../components/amendment/LetterOfCreditAmendmentStep'
import { TRANSITION } from '../../../components/wizard'
import { tradeFinanceManager } from '@komgo/permissions'
import { applyPatch } from 'fast-json-patch'
// TODO change to lc schema in komgo-types
import LETTER_OF_CREDIT_SCHEMA from '../schemas/letter-of-credit.schema.json'
import { toFormikErrors } from '../../../utils/validator'
import { FormikErrors, FormikValues } from 'formik'
import { fieldToLabel } from '../constants/fieldsByStep'
import { pathToKey, keyToPath } from '../components/amendment/PropertyEditor'
import { loadingSelector } from '../../../store/common/selectors'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { ServerError } from '../../../store/common/types'
import { LetterOfCreditAmendmentActionType } from '../store/amendments/types'

const validator = new Ajv({ allErrors: true }).addSchema(LETTER_OF_CREDIT_SCHEMA).addSchema(AMENDMENT_BASE_SCHEMA)
const lcValidationSchemaKeyRef = 'http://komgo.io/letter-of-credit'

export const findDiffsByTypes = (diffs: IDiff[], types: string[]) => diffs.filter(d => types.includes(d.type))

export interface CreateAmendmentProps extends WithLoaderProps, WithPermissionsProps, RouteComponentProps<any> {
  tradeId: string
  letterOfCreditId: string
  initialValues: ILCAmendmentBase
  letterOfCredit: ILetterOfCredit
  getLetterOfCreditWithTradeAndMovements: (params: { id: string }) => null
  getTrade: (params: { id: string }) => null
  submitLetterOfCreditAmendment: (values: ILCAmendmentBase, lcStaticId: string) => any
  submitAmendmentLoading: boolean
  submitAmendmentError: ServerError
}

export interface CreateAmendmentState {
  values: ILCAmendmentBase
}

export const LetterOfCreditAmendmentContext = React.createContext({})

export class CreateAmendment extends React.Component<CreateAmendmentProps, CreateAmendmentState> {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.onNext = this.onNext.bind(this)
  }

  componentDidMount(): void {
    this.props.getLetterOfCreditWithTradeAndMovements({ id: this.props.letterOfCreditId })
  }

  onSubmit(values: ILCAmendmentBase) {
    this.props.submitLetterOfCreditAmendment(values, this.props.letterOfCreditId)
  }

  onNext(
    currentValues: ILCAmendmentBase,
    step: string,
    setFieldValue: (field: keyof ILCAmendmentBase, value: any) => void
  ): FormikErrors<FormikValues> {
    const { letterOfCredit } = this.props

    let errors = {}
    if (step === Step.LetterOfCredit) {
      const lcAmendments = findDiffsByTypes(currentValues.diffs, ['ILC'])
      const otherAmendments = findDiffsByTypes(currentValues.diffs, ['ITrade', 'ICargo'])

      // do this first so we don't sanitize any 'magically added' fields which cleanupLetterOfCreditAmendments does...
      const sanitizationErrors = amendmentSanitizationErrors(lcAmendments)
      const actualLcUpdates = buildLetterOfCreditDiffs(lcAmendments)
      const lcSchemaErrors = lcSchemaValidationErrors(letterOfCredit, actualLcUpdates)

      errors = {
        ...sanitizationErrors,
        ...lcSchemaErrors
      }

      if (Object.keys(errors).length === 0) {
        setFieldValue('diffs', [...otherAmendments, ...actualLcUpdates])
      }
    }
    return errors
  }

  render() {
    const { isAuthorized, letterOfCredit, submitAmendmentLoading, errors, submitAmendmentError } = this.props
    if (!isAuthorized(tradeFinanceManager.canManageLCRequests)) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return <ErrorMessage title="Amendment Request" error={error} />
    }

    const initialStep = this.props.initialValues.diffs.length > 0 ? Step.Trade : Step.LetterOfCredit
    const stateMachine = CreateAmendmentStateMachine().transitionTo(TRANSITION.GOTO, { step: initialStep })
    return (
      <React.Fragment>
        <Header>Amendment Request</Header>
        <p>Letter Of Credit / {<em>{this.props.letterOfCredit.reference}</em>}</p>
        <Divider />

        {this.props.isFetching ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading Amendment data" />
          </Segment>
        ) : (
          <LetterOfCreditAmendmentContext.Provider value={letterOfCredit}>
            {submitAmendmentError && <ErrorMessage title={'Amendment submission error'} error={submitAmendmentError} />}
            <Wizard
              initialValues={this.props.initialValues}
              onSubmit={this.onSubmit}
              validator={validator}
              validationSchemaKeyRef={'http://komgo.io/schema/lc/amendment/1/base'}
              fieldToLabel={() => ''}
              initialStateMachine={stateMachine}
              onNext={this.onNext}
              submitting={submitAmendmentLoading}
            >
              <Wizard.Page step={Step.Trade}>
                <TradeStep />
              </Wizard.Page>
              <Wizard.Page step={Step.LetterOfCredit}>
                <LetterOfCreditAmendmentStep />
              </Wizard.Page>
              <Wizard.Page step={Step.Summary}>
                <SummaryStep />
              </Wizard.Page>
            </Wizard>
          </LetterOfCreditAmendmentContext.Provider>
        )}
      </React.Fragment>
    )
  }
}

const amendmentSanitizationErrors = (input: IDiff[]) => {
  const unchangedFields = input.filter(i => i.oldValue === i.value)

  if (unchangedFields.length !== 0) {
    return unchangedFields.map(unchangedFieldsToErrors).reduce(toObject, {})
  }
  return {}
}

const lcSchemaValidationErrors = (lc: ILetterOfCredit, input: IDiff[]) => {
  const newLetterOfCredit = applyPatch(lc, input as any).newDocument

  if (!validator.validate(lcValidationSchemaKeyRef, newLetterOfCredit)) {
    const currentKeys = input.map(a => pathToKey(a.path))

    const errorsOnAmendableFields = Object.entries(toFormikErrors(validator.errors)).filter(
      ([fieldName]) => currentKeys.includes(fieldName) && amendableFields.includes(fieldName as keyof ILetterOfCredit)
    )

    if (errorsOnAmendableFields.length > 0) {
      return errorsOnAmendableFields.map(replaceFieldNameWithLabel).reduce(toObject, {})
    }
  }
  return {}
}

const replaceFieldNameWithLabel = ([fieldName, message]: [string, string]) => [
  fieldName,
  message.replace(fieldName, fieldToLabel(fieldName))
]
const unchangedFieldsToErrors = field =>
  field.path === ''
    ? ['', 'Empty update field(s) are present.']
    : [
        pathToKey(field.path),
        `'${fieldToLabel(pathToKey(field.path))}' field was left unchanged. Please remove the update or make a change.`
      ]
const toObject = (memo, [fieldName, message]) => ({
  ...memo,
  [fieldName]: message
})

const buildLetterOfCreditDiffs = (input: IDiff[]) => {
  const expiryPlacePath = keyToPath('expiryPlace')

  const availableWithAmendment = input.find(u => u.path === '/availableWith')
  const expiryPlaceAmendment = input.find(u => u.path === expiryPlacePath)

  if (availableWithAmendment) {
    if (expiryPlaceAmendment) {
      return input.map(u => (u.path === expiryPlacePath ? { ...u, value: availableWithAmendment.value } : u))
    } else {
      return [...input, { ...availableWithAmendment, path: expiryPlacePath }]
    }
  } else if (expiryPlaceAmendment) {
    return input.filter(u => u.path !== expiryPlacePath)
  }
  return input.filter(i => i.path !== '')
}

const mapStateToProps = (state: ApplicationState, ownProps: CreateAmendmentProps) => {
  const letterOfCreditId = ownProps.match.params.id
  const letterOfCredit: ILetterOfCredit =
    state
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[letterOfCreditId] || {}

  if (ownProps.isFetching) {
    return {
      letterOfCreditId,
      letterOfCredit,
      initialValues: {
        diffs: []
      }
    }
  }

  const submitAmendmentLoading = loadingSelector(
    state.get('loader').get('requests'),
    [LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_REQUEST],
    false
  )

  const [submitAmendmentError] = findErrors(state.get('errors').get('byAction'), [
    LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_REQUEST
  ])

  const tradeAndCargoSnapshot: any = letterOfCredit.tradeAndCargoSnapshot || { trade: {}, cargo: {} }

  const newTrade: ITrade = state
    .get('trades')
    .get('trades')
    .toJS()[tradeAndCargoSnapshot.trade._id]

  const [newCargo]: ICargo[] = state
    .get('trades')
    .get('tradeMovements')
    .toJS()
    .filter(cargo => cargo._id === tradeAndCargoSnapshot.cargo._id)

  const oldTrade = tradeAndCargoSnapshot.trade
  const oldCargo = tradeAndCargoSnapshot.cargo

  const tradeDiffs = tradeDiff(oldTrade, newTrade)
  const cargoDiffs = cargoDiff(oldCargo, newCargo)

  const initialValues: ILCAmendmentBase = {
    diffs: [...tradeDiffs, ...cargoDiffs],
    version: 1,
    lcStaticId: letterOfCreditId,
    lcReference: letterOfCredit.reference
  }

  return {
    letterOfCreditId,
    letterOfCredit,
    initialValues,
    submitAmendmentLoading,
    submitAmendmentError
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST,
      TradeActionType.TRADE_REQUEST,
      TradeActionType.TRADE_MOVEMENTS_REQUEST
    ]
  }),
  withPermissions,
  withRouter,
  connect(mapStateToProps, {
    getLetterOfCreditWithTradeAndMovements,
    submitLetterOfCreditAmendment
  })
)(CreateAmendment)
