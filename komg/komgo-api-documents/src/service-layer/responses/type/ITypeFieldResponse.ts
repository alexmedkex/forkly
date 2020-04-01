import { FieldType } from '../../../FieldTypes'

export interface ITypeFieldResponse {
  id: string
  name: string
  type: FieldType
  isArray: boolean
}
