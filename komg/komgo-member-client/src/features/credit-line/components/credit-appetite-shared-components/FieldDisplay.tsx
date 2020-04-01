import React, { Fragment, PropsWithChildren } from 'react'
import styled from 'styled-components'
import { Popup } from 'semantic-ui-react'
import { grey } from '../../../../styles/colors'
import FieldLabel from './FieldLabel'
import { toKebabCase } from '../../../../utils/casings'

export interface IProps {
  label: string
  isOptional?: boolean
  value?: string
  tooltip?: string
  verticalDisplay?: boolean
}

const FieldDisplay: React.FC<IProps> = (props: PropsWithChildren<IProps>) => {
  return (
    <FieldWrapper {...props}>
      <FieldLabelWrapper data-test-id={`${toKebabCase(props.label)}-label`}>
        {props.tooltip ? (
          <Popup
            inverted={true}
            position={'right center'}
            trigger={
              <PopupTriggerText>
                <FieldLabel {...props} />
              </PopupTriggerText>
            }
          >
            {props.tooltip}
          </Popup>
        ) : (
          <FieldLabel {...props} />
        )}
      </FieldLabelWrapper>
      <FieldValue data-test-id={`${toKebabCase(props.label)}-value`}>{props.value || props.children}</FieldValue>
    </FieldWrapper>
  )
}

const FieldWrapper = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;

  ${(props: IProps) => !props.verticalDisplay && `display: flex`};
  align-items: center;
  @media (max-width: 768px) {
    flex-flow: column;
    align-items: unset;
  }
  &:last-child {
    margin-bottom: 0px;
  }
`

const FieldLabelWrapper = styled.div`
  width: 250px;
  margin-right: 10px;
`

const FieldValue = styled.div`
  display: inline-block;
`

const PopupTriggerText = styled.span`
  position: relative;
  &:hover {
    cursor: pointer;
  }
  :after {
    content: '';
    border-bottom: dotted 2px ${grey};
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
  }
`

export default FieldDisplay
