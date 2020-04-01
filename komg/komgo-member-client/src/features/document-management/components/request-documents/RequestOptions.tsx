import * as React from 'react'
import styled from 'styled-components'
import { Input, Dropdown, DropdownProps, InputOnChangeData } from 'semantic-ui-react'
import { Toggle, ToggleSize, SPACES } from '@komgo/ui-components'
import { connect, FormikProps } from 'formik'
import moment from 'moment'

import { SectionCard } from './SectionCard'
import { violetBlue, dark } from '../../../../styles/colors'
import { CheckboxProps } from 'semantic-ui-react'
import { IRequestDocumentForm } from '../../containers/RequestDocumentsContainer'
import { displayDate } from '../../../../utils/date'
import { isErrorActive } from '../../../trades/utils/isErrorActive'
import FieldError from '../../../../components/error-message/FieldError'
import { getErrorForSpecificField } from '../../../credit-line/utils/validation'

interface WithFormik {
  formik: FormikProps<IRequestDocumentForm>
}

type IProps = WithFormik

export enum DatePeriod {
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months'
}

const DatePeriodOptions = [
  { value: DatePeriod.Days, context: 'Day(s)', text: 'Day(s)' },
  { value: DatePeriod.Weeks, context: 'Week(s)', text: 'Week(s)' },
  { value: DatePeriod.Months, context: 'Month(s)', text: 'Month(s)' }
]

export class RequestOptions extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)

    this.handleToggleDeadLine = this.handleToggleDeadLine.bind(this)
    this.handleChangeDateAmount = this.handleChangeDateAmount.bind(this)
    this.handleChangeDatePeriod = this.handleChangeDatePeriod.bind(this)
    this.calculateDate = this.calculateDate.bind(this)
    this.setFieldValue = this.setFieldValue.bind(this)
  }

  setFieldValue(name: string, value: any) {
    this.props.formik.setFieldValue(name, value)
    this.props.formik.setFieldTouched(name)
  }

  handleToggleDeadLine(_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) {
    this.setFieldValue('isDeadlineOn', data.checked)
  }

  handleChangeDateAmount(_: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) {
    const value = parseInt(data.value, 10)
    if (data.value === '' || value === 0) {
      this.setFieldValue('deadline', undefined)
      this.props.formik.setFieldValue('deadlineDateAmount', value === 0 ? 0 : '')
    } else if (value < 1000 && value > -1000) {
      this.props.formik.setFieldValue('deadlineDateAmount', value)
      if (value > 0) {
        this.calculateDate(value, this.props.formik.values.deadlineDatePeriod)
      }
    }
  }

  handleChangeDatePeriod(_: React.SyntheticEvent<HTMLElement>, data: DropdownProps) {
    this.setFieldValue('deadlineDatePeriod', data.value)
    const { deadlineDateAmount } = this.props.formik.values
    if (deadlineDateAmount > 0) {
      this.calculateDate(deadlineDateAmount, data.value as DatePeriod)
    }
  }

  calculateDate(dateAmount: number, datePeriod: DatePeriod) {
    const deadline = moment().add(dateAmount, datePeriod)
    this.setFieldValue('deadline', deadline.toDate())
  }

  render() {
    const { formik } = this.props
    const { isDeadlineOn, deadlineDateAmount, deadlineDatePeriod, deadline } = formik.values
    return (
      <SectionCard
        style={{ height: '200px' }}
        title="SELECT OPTIONS FOR THIS REQUEST"
        data-test-id="requirements-option-card"
      >
        <Wrapper>
          <LabelWrapper>
            <Toggle
              data-test-id="deadline-toggle"
              size={ToggleSize.Small}
              color={violetBlue}
              onChange={this.handleToggleDeadLine}
              checked={isDeadlineOn}
              style={{ marginBottom: '3px' }}
            />
            <Label>Add a deadline</Label>
          </LabelWrapper>
          {isDeadlineOn ? (
            <React.Fragment>
              <div style={{ position: 'relative' }}>
                <StyledInput
                  data-test-id="deadline-date-amount"
                  type="number"
                  onChange={this.handleChangeDateAmount}
                  name="deadlineDateAmount"
                  value={deadlineDateAmount}
                  onBlur={this.props.formik.handleBlur}
                  id="deadlineDateAmount"
                  error={isErrorActive('deadlineDateAmount', formik.errors, formik.touched)}
                />
                <FieldError
                  show={isErrorActive('deadlineDateAmount', formik.errors, formik.touched)}
                  fieldName={'deadlineDateAmount'}
                  style={{ width: '155px', bottom: '-22px' }}
                >
                  {getErrorForSpecificField('deadlineDateAmount', formik)}
                </FieldError>
              </div>
              <StyledDropdown
                data-test-id="deadline-date-period"
                button={true}
                value={deadlineDatePeriod}
                options={DatePeriodOptions}
                onChange={this.handleChangeDatePeriod}
              />
              {deadline ? <Date data-test-id="deadline">{displayDate(deadline, 'D MMM YYYY')}</Date> : null}
            </React.Fragment>
          ) : null}
        </Wrapper>
      </SectionCard>
    )
  }
}

const Wrapper = styled.div`
  margin-bottom: ${SPACES.DEFAULT};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const Label = styled.span`
  margin-left: ${SPACES.SMALL};
  font-weight: bold;
`

const LabelWrapper = styled.div`
  min-width: 200px;
  height: 32px;
  display: flex;
  align-items: center;
`

const StyledInput = styled(Input)`
  &&& {
    width: 50px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
    &,
    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      -moz-appearance: textfield;
    }
  }
`

const StyledDropdown = styled(Dropdown)`
  &&& {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
    z-index: 2;
    width: 105px;
    .icon {
      float: right;
    }
    .menu {
      margin-top: 3px;
    }
  }
`

const Date = styled.span`
  &&& {
    color: ${dark};
    margin-left: ${SPACES.SMALL};
  }
`

export default connect<{}, IRequestDocumentForm>(RequestOptions)
