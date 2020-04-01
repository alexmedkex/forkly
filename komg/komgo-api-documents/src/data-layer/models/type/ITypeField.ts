import { FieldType } from '../../../FieldTypes'

export interface ITypeField {
  id: string
  name: string
  type: FieldType
  isArray: boolean
}
