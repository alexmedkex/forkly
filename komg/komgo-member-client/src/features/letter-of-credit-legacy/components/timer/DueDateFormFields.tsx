import * as React from 'react'
import styled from 'styled-components'
import { Field, connect } from 'formik'
import { Header, Radio, CheckboxProps } from 'semantic-ui-react'
import { LetterOfCreditValues, TIME_UNIT_DUE_DATE } from '../../constants'
import { GridTextController, DropdownController, enumToDropdownOptions } from '../InputControllers'
import { LetterOfCreditTypeStepProps } from '../LetterOfCreditTypeStep'
import ExpiredDateForm from './ExpiredDateForm'
import { isErrorActive } from '../../../trades/utils/isErrorActive'

const dropdownStyling = { margin: '0', minWidth: '100px', marginLeft: '5px', verticalAlign: 'top' }

export class DueDateFormFields extends React.Component<LetterOfCreditTypeStepProps> {
  toggleDueDate = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.props.formik.setFieldValue('issueDueDateActive', data.checked)
    this.setTimerDefaultProps(data.checked)
  }

  setTimerDefaultProps = (checked: boolean) => {
    this.props.formik.setFieldValue('issueDueDateDuration', checked ? 1 : undefined)
    this.props.formik.setFieldValue('issueDueDateUnit', checked ? TIME_UNIT_DUE_DATE.DAYS : undefined)
  }

  isExpiredDateSet(): boolean {
    const { errors, values } = this.props.formik
    return !errors.issueDueDateDuration && values.issueDueDateUnit && values.issueDueDateDuration ? true : false
  }

  render() {
    const { formik } = this.props
    return (
      <div>
        <Header content="Deadline for response" block={true} />
        <DateWrapper>
          <p>
            Select a deadline for response, this will serve as an incentive for Bank(s) to address your request in a
            timely manner. The timer will start upon your submission of the request
          </p>
          <DueDateWrapper>
            <DueDateFlexWrapper>
              <Label>Set deadline</Label>
              <Radio
                toggle={true}
                onChange={this.toggleDueDate}
                checked={formik.values.issueDueDateActive}
                name="issueDueDateActive"
                style={{ height: '32px', paddingTop: '5px' }}
              />
              {formik.values.issueDueDateActive && (
                <React.Fragment>
                  <Field
                    type="number"
                    name="issueDueDateDuration"
                    fieldName="Duration"
                    value={formik.values.issueDueDateDuration}
                    fieldStyle={{
                      display: 'inline-block',
                      width: '80px',
                      verticalAlign: 'top',
                      margin: '0 5px 0 30px'
                    }}
                    component={GridTextController}
                    error={isErrorActive('issueDueDateDuration', formik.errors, formik.touched)}
                    style={{ width: '100%' }}
                    hideLabel={true}
                  />
                  <Field
                    name="issueDueDateUnit"
                    style={dropdownStyling}
                    selection={true}
                    search={true}
                    compact={true}
                    options={enumToDropdownOptions(TIME_UNIT_DUE_DATE, true)}
                    component={DropdownController}
                  />
                </React.Fragment>
              )}
              {this.isExpiredDateSet() && (
                <ExpiredDateForm time={formik.values.issueDueDateDuration} timeUnit={formik.values.issueDueDateUnit} />
              )}
            </DueDateFlexWrapper>
          </DueDateWrapper>
        </DateWrapper>
      </div>
    )
  }
}

const Label = styled.label`
  display: inline-flex;
  font-weight: bold;
  min-width: 200px;
  vertical-align: middle;
  height: 32px;
  padding: 7px 0;
`

const DueDateWrapper = styled.div`
  height: 52px;
`

const DateWrapper = styled.div`
  padding: 0 10px;
`

const DueDateFlexWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
`

export default connect<{}, LetterOfCreditValues>(DueDateFormFields)
