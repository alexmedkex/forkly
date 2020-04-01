import { Allow } from 'class-validator'
export class CompanyRequest {
  @Allow()
  node?: string | object

  @Allow()
  parentNode?: string

  @Allow()
  label?: string

  @Allow()
  owner?: string

  @Allow()
  resolver?: string

  @Allow()
  komgoMnid?: string

  @Allow()
  hasSWIFTKey?: boolean

  @Allow()
  isFinancialInstitution?: boolean

  @Allow()
  isMember?: boolean

  @Allow()
  staticId?: string

  @Allow()
  vaktMnid?: string

  @Allow()
  vaktStaticId?: string

  @Allow()
  address?: string

  @Allow()
  abi?: string
}
