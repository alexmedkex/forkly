import { ICompanyRequest } from '@komgo/types'
import { Checkbox, Form } from 'semantic-ui-react'
import * as React from 'react'
import styled from 'styled-components'
import { Field, FormikErrors, FormikTouched } from 'formik'
import { paleGray } from '../../../styles/colors'
import { GridTextController } from '../../letter-of-credit-legacy/components'
import validateRequiredField from '../../../utils/validateRequiredField'
import validateMessagingPublicKey from '../../../utils/validateMessagingPublicKey'

export interface IProps {
  isModification: boolean
  values: ICompanyRequest
  errors: FormikErrors<ICompanyRequest>
  touched: FormikTouched<ICompanyRequest>
  resetVakt: () => void
}

interface IState {
  showVakt: boolean
}

const customStyle = {
  display: 'flex',
  width: '50%'
}

export class VaktRegistration extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showVakt: !!(props.values.vakt && props.values.vakt.staticId)
    }
  }

  toggleCheckbox = (e, { checked }) => {
    this.setState({ showVakt: checked })
    if (!checked) {
      this.props.resetVakt()
    }
  }

  render() {
    const { isModification, errors, touched } = this.props
    const vaktErrors = errors.vakt || {}
    const vaktTouched = touched.vakt || {}
    return (
      <>
        <Form.Field>
          <Checkbox
            disabled={!isModification}
            checked={this.state.showVakt}
            name="showVakt"
            label="Register in VAKT"
            onChange={this.toggleCheckbox}
          />
          <StyledP>If you leave this box unchecked this company won't be accessible in VAKT</StyledP>
        </Form.Field>
        {this.state.showVakt && (
          <>
            <StyledSmallHeader>VAKT REGISTRATION</StyledSmallHeader>
            <Form.Field>
              <Field
                type="text"
                name="vakt.staticId"
                fieldName="Static ID"
                disabled={!isModification}
                component={GridTextController}
                validate={validateRequiredField('Static ID')}
                error={vaktErrors.staticId && vaktTouched.staticId}
              />
              <Field
                type="text"
                name="vakt.mnid"
                fieldName="MNID"
                disabled={!isModification}
                component={GridTextController}
                validate={validateRequiredField('MNID')}
                error={vaktErrors.mnid && vaktTouched.mnid}
              />
              <Field
                data-test-id="vakt-info-messagingPublicKey"
                rows={5}
                type="textarea"
                name="vakt.messagingPublicKey"
                fieldName="Messaging Public Key (JSON)"
                customStyle={customStyle}
                disabled={!isModification}
                component={GridTextController}
                validate={validateMessagingPublicKey}
                error={vaktErrors.messagingPublicKey && vaktTouched.messagingPublicKey}
              />
            </Form.Field>
          </>
        )}
      </>
    )
  }
}

const StyledSmallHeader = styled.h4`
  background-color: ${paleGray};
  margin-bottom: 1.5em;
  margin-top: 1.5em;
  padding: 0.5em;
`
const StyledP = styled.p`
  margin-left: 30px;
  color: #777;
`
