import { rdValidator } from '../utils/RDValidator'
import { findFieldFromSchema } from '../../../store/common/selectors/displaySelectors'
import React from 'react'

export class FieldDataProvider {
  private validatorErrors?: any

  constructor(private readonly schema: any, baseObject?: any) {
    if (baseObject) {
      this.validatorErrors = rdValidator.validateAndFormatBySchema(schema, baseObject)
    }
  }

  public getTitle(fieldName: string) {
    const title = findFieldFromSchema('title', fieldName, this.schema)
    if (!this.validatorErrors) {
      return title
    }
    return this.validatorErrors[fieldName] ? `${title} *` : title
  }
}

export const FieldDataContext = React.createContext({})
