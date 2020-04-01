import React from 'react'
import { GenericInputFieldWithLabel } from './GenericInputFieldWithLabel'
import { IGenericInputFieldProps } from './GenericInputField'
import { GridTextController } from '../../../letter-of-credit-legacy/components'
import { borderLabelStyling } from '../../utils/styles'

export const PercentageInputField = <T extends object>(props: IGenericInputFieldProps<T>): React.ReactElement => (
  <GenericInputFieldWithLabel
    type="number"
    step="0.01"
    label={{ basic: true, content: '%', style: borderLabelStyling }}
    component={GridTextController}
    inline={false}
    labelPosition="right"
    {...props}
  />
)
