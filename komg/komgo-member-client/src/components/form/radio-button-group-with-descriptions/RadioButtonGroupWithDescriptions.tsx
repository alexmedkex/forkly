import * as React from 'react'
import { Form, Radio, Container } from 'semantic-ui-react'
import styled from 'styled-components'
import { grey, violetBlue } from '../../../styles/colors'
import { FieldAttributes, FormikContext } from 'formik'
import { RequestType } from '@komgo/types'
import { Dimensions } from '../../../features/receivable-discounting-legacy/resources/dimensions'

export interface IRadioButtonWithDescription {
  value: string
  description: string
  label: string
  disabled?: boolean
}

export interface IRadioButtonGroupWithDescriptionsProps {
  groupTitle?: string // TODO: Group title should go here? Need to decide whether to keep in parent
  options: IRadioButtonWithDescription[]
  formik: FormikContext<any>
  name: string
}

export const RadioButtonGroupWithDescriptions: React.FC<
  IRadioButtonGroupWithDescriptionsProps & FieldAttributes<any>
> = ({ field, formik, options, value, name, groupTitle, onRequestTypeSelected }) => {
  const handleRadioOptionChange = (buttonValue: string | boolean) => () => {
    formik.setFieldValue(name, buttonValue)
  }

  const handleRadioOptionBlur = (buttonValue: string | boolean) => () => {
    formik.setFieldValue(name, buttonValue)
    formik.setFieldTouched(name)
  }

  const filteredOptions = options.filter(item => !item.disabled)

  return (
    <>
      {groupTitle && (
        <StyledTitleContainer>{groupTitle && <StyledHeaderTitle>{groupTitle}</StyledHeaderTitle>}</StyledTitleContainer>
      )}
      <StyledContainer>
        {filteredOptions.map((option, idx) => (
          <StyledFormField
            key={`${option.value}-${idx}`}
            checked={value === option.value}
            onClick={handleRadioOptionChange(option.value)}
          >
            <StyledRadio
              data-test-id={`radioButtongroup-${option.value}`}
              id={`radioButtongroup-${option.value}`}
              label={option.label}
              name="radioGroup"
              value={option.value}
              disabled={option.disabled}
              onChange={handleRadioOptionChange(option.value)}
              onBlur={handleRadioOptionBlur(option.value)}
              checked={value === option.value}
            />
            <StyledDescription>{option.description}</StyledDescription>
          </StyledFormField>
        ))}
      </StyledContainer>
    </>
  )
}

const StyledContainer = styled(Container)`
  display: flex !important;
  flex-direction: row;

  padding: 5px;

  & > div {
    margin: 5px !important;
  }
`

export const StyledTitleContainer = styled(Container)`
  display: flex !important;
  flex-direction: row;
  padding: 12px 0px 12px 10px;
`

const StyledFormField = styled(Form.Field)`
  flex-grow: 1;
  padding: 16px;
  width: ${Dimensions.RequestTypeRadioBoxWidth};
  border: 1px solid ${({ checked }) => (checked ? violetBlue : grey)};
  border-radius: 5px;
  justify-content: center;
  cursor: pointer;
`
export const StyledRadio = styled(Radio)`
  padding-bottom: 10px;

  & > label {
    font-weight: bold;
    text-align: bottom;
  }
`

const StyledDescription = styled.p`
  margin-left: 32px;
`

export const StyledHeaderTitle = styled.h3`
  font-size: 21px;
  margin-bottom: 20px;
`
