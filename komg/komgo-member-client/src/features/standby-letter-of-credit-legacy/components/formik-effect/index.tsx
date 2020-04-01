import { Component } from 'react'
import { isEqual } from 'lodash'
import { connect, FormikValues, FormikProps } from 'formik'

interface IProps {
  onChange: (values: FormikValues) => void
}

interface IPropsEnhanced extends IProps {
  formik: FormikProps<FormikValues>
}

class FormikEffect extends Component<IPropsEnhanced> {
  onChange = this.props.onChange

  componentDidUpdate(prevProps: IPropsEnhanced) {
    const { formik } = this.props
    const { isValid } = formik

    const hasChanged = !isEqual(prevProps.formik.values, formik.values)
    // TODO LS despite no validation is configured formik is returning false with some values feesPayableBy and DuplicateClause
    // const shouldCallback = isValid && hasChanged
    const shouldCallback = hasChanged
    if (shouldCallback) {
      this.onChange(formik.values)
    }
  }

  render() {
    return null as null
  }
}

export default connect<IProps>(FormikEffect)
