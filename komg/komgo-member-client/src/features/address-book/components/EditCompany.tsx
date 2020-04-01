import { ICompanyRequest, MemberType } from '@komgo/types'
import * as i18nIsoCountries from 'i18n-iso-countries'
import { merge, cloneDeep } from 'lodash'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { compose } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ActionCreator, connect } from 'react-redux'
import styled from 'styled-components'
import { Formik, FormikErrors, FormikTouched } from 'formik'
import * as Yup from 'yup'
import { Button, Segment } from 'semantic-ui-react'
import { withPermissions } from '../../../components/with-permissions'
import { ApplicationState } from '../../../store/reducers'
import { createCompany, getCompany, updateCompany } from '../store/actions'
import { IMember } from '../../members/store/types'
import { HttpRequest } from '../../../utils/http'
import { ImmutableMap } from '../../../utils/types'
import { AddressBookActionType, AddressBookStateProperties } from '../store/types'
import { EditForm } from './EditForm'
import { combineMembers } from './AddressBook'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { ModalPrompt, ModalSize } from '../../../components/modal-prompt/ModalPrompt'
import { LoadingTransition } from '../../../components/loading-transition'
import { clearError } from '../../../store/common/actions'

const validationSchema = Yup.object().shape({
  x500Name: Yup.object().shape({
    O: Yup.string().required("'Company name' should not be empty"),
    C: Yup.string().required("'Country' should not be empty"),
    L: Yup.string().required("'City' should not be empty"),
    STREET: Yup.string().required("'Street' should not be empty"),
    PC: Yup.string().required("'Postal code' should not be empty")
  })
})

interface IEditCompanyActions {
  getCompany: ActionCreator<ThunkAction<void, ImmutableMap<AddressBookStateProperties>, HttpRequest>>
  updateCompany: ActionCreator<ThunkAction<void, ImmutableMap<AddressBookStateProperties>, HttpRequest>>
  createCompany: ActionCreator<ThunkAction<void, ImmutableMap<AddressBookStateProperties>, HttpRequest>>
  clearError: (action: string) => void
}

interface IEditCompanyProps {
  staticId?: string
  isModification?: boolean
  company?: IMember
}

interface MatchParams {
  id: string
}

interface EditCompanyPageProps
  extends RouteComponentProps<MatchParams>,
    WithLoaderProps,
    IEditCompanyActions,
    IEditCompanyProps {}

interface IState {
  openModalDeleteVakt: boolean
}

interface IErrorFields {
  [key: string]: string | string[]
}

const StyledBigHeader = styled.h1`
  margin-bottom: 1.5em;
`
const defaultValues: ICompanyRequest = {
  x500Name: { CN: '', O: '', L: '', STREET: '', PC: '', C: '' },
  isMember: false,
  memberType: MemberType.Empty,
  isFinancialInstitution: false,
  hasSWIFTKey: false,
  companyAdminEmail: ''
}

export class EditCompany extends React.Component<EditCompanyPageProps, IState> {
  constructor(props) {
    super(props)
    this.state = {
      openModalDeleteVakt: false
    }
    i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'))
  }

  componentDidMount() {
    const { staticId, getCompany } = this.props
    if (staticId) {
      getCompany(staticId)
    }
  }

  parse = (value: string) => {
    try {
      return JSON.parse(value)
    } catch {
      return '(parsing error)'
    }
  }

  getInitialValues(): ICompanyRequest | IMember {
    const { company } = this.props
    let vakt = {
      staticId: '',
      mnid: '',
      messagingPublicKey: undefined
    }

    if (company) {
      if (company.vaktStaticId) {
        // use data from ENS (where company has vaktStaticID) first
        const { key, termDate } = company.vaktMessagingPubKeys.find(({ current }) => current)
        const messagingPublicKey = {
          key: this.parse(key),
          validTo: new Date(termDate).toISOString(),
          validFrom: new Date().toISOString() // validFrom is not available in ENS and it's not used anywhere
        }

        vakt = {
          staticId: company.vaktStaticId,
          mnid: company.vaktMnid,
          messagingPublicKey: JSON.stringify(messagingPublicKey, null, 2)
        }
      } else if (company.vakt) {
        vakt = {
          ...company.vakt,
          messagingPublicKey: JSON.stringify(company.vakt.messagingPublicKey, null, 2)
        }
      }
    }
    return { ...defaultValues, ...company, vakt }
  }

  onClose = (): void => {
    this.props.history.push('/address-book')
  }

  onEditClick = (): void => {
    const { history, location } = this.props
    history.push(`${location.pathname}?edit=true`)
  }

  beforeSubmit = (values: ICompanyRequest) => {
    const { company: { vakt = null } = {} } = this.props
    const oldVaktStaticId = vakt ? vakt.staticId : ''
    const { vakt: { staticId: newVaktStaticId = '' } = {} } = values

    // vakt has been unchecked
    if (oldVaktStaticId && !newVaktStaticId) {
      this.setState({ openModalDeleteVakt: true })
    } else {
      this.handleSubmit(values)
    }
  }

  handleSubmit = (values: ICompanyRequest) => {
    const { staticId, updateCompany, createCompany, history } = this.props
    const data = cloneDeep(values)

    if (data.vakt) {
      if (!data.vakt.staticId) {
        delete data.vakt
      } else {
        data.vakt.messagingPublicKey = JSON.parse(values.vakt.messagingPublicKey.toString())
      }
    }

    if (!data.memberType) {
      delete data.memberType
    }

    if (staticId) {
      updateCompany(staticId, data, history)
    } else {
      createCompany(data, history)
    }
  }

  handleConfirmSubmit = (values: ICompanyRequest) => () => {
    this.handleSubmit(values)
  }

  handleCancel = () => {
    this.setState({ openModalDeleteVakt: false })
  }

  handleClearError = () => {
    if (this.props.errors.length) {
      this.props.clearError(AddressBookActionType.CREATE_COMPANY_REQUEST)
      this.props.clearError(AddressBookActionType.UPDATE_COMPANY_REQUEST)
    }
  }

  getErrorFields = <T extends FormikTouched<ICompanyRequest> | FormikErrors<ICompanyRequest>>(
    cb: (fields: IErrorFields) => T
  ): T | {} =>
    this.props.errors
      ? this.props.errors.reduce((obj, error) => {
          return error.fields
            ? {
                ...obj,
                ...cb(error.fields)
              }
            : obj
        }, {})
      : {}

  getSchemaValidationTouched = (): FormikTouched<ICompanyRequest> =>
    this.getErrorFields(fields => {
      return Object.keys(fields).map(key => ({ [key]: true }))[0]
    })

  getSchemaValidationErrors = (): FormikErrors<ICompanyRequest> =>
    this.getErrorFields(fields => {
      return Object.entries(fields).map(([key, value]) => {
        return Array.isArray(value) ? { [key]: value.join('') } : {}
      })[0]
    })

  actions = (values: ICompanyRequest): JSX.Element => (
    <>
      <Button content="Cancel" onClick={this.handleCancel} />
      <Button negative={true} content="Yes" onClick={this.handleConfirmSubmit(values)} />
    </>
  )

  render(): JSX.Element {
    const { staticId, isModification, company, isFetching } = this.props

    return isFetching && staticId ? (
      <Segment basic={true} padded={true}>
        <LoadingTransition title="Loading Company data" />
      </Segment>
    ) : (
      <>
        {(!staticId || (staticId && company)) && (
          <>
            <StyledBigHeader id="page-header">
              {!staticId ? 'Add company' : `Company: ${company.x500Name.O}`}
            </StyledBigHeader>
            <Formik
              initialValues={this.getInitialValues()}
              onSubmit={this.beforeSubmit}
              validateOnBlur={false}
              validateOnChange={true}
              validationSchema={validationSchema}
            >
              {props => {
                return (
                  <>
                    <EditForm
                      {...props}
                      onEditClick={this.onEditClick}
                      onClose={this.onClose}
                      clearError={this.handleClearError}
                      isModification={isModification}
                      staticId={staticId}
                      errors={merge(props.errors, this.getSchemaValidationErrors())}
                      touched={merge(props.touched, this.getSchemaValidationTouched())}
                    />
                    <ModalPrompt
                      size={ModalSize.Small}
                      open={this.state.openModalDeleteVakt}
                      header=""
                      loading={false}
                      actions={this.actions(props.values)}
                    >
                      By deleting VAKT data, you won’t be able to communicate with VAKT if you choose this option. Do
                      you want to proceed?
                    </ModalPrompt>
                  </>
                )
              }}
            </Formik>
          </>
        )}
      </>
    )
  }
}

const mapDispatchToProps: IEditCompanyActions = {
  getCompany,
  createCompany,
  updateCompany,
  clearError
}

const mapStateToProps = (state: ApplicationState, props: EditCompanyPageProps): IEditCompanyProps => {
  const staticId = props.match.params.id
  const urlSearchParams = new URLSearchParams(props.location.search)
  const isModification = urlSearchParams.get('edit') === 'true' || !staticId
  return {
    isModification,
    staticId,
    company: combineMembers(
      state
        .get('members')
        .get('byStaticId')
        .toJS(),
      state
        .get('onboarding')
        .get('companies')
        .toJS()
    ).find(company => company.staticId === staticId)
  }
}

export default compose(
  withPermissions,
  withLoaders({
    errors: [AddressBookActionType.CREATE_COMPANY_REQUEST, AddressBookActionType.UPDATE_COMPANY_REQUEST],
    actions: [AddressBookActionType.GET_COMPANY_REQUEST]
  }),
  connect(mapStateToProps, mapDispatchToProps)
)(EditCompany)
