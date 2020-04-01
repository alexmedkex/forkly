import { IX500NameInformation } from './IX500NameInformation'

/**
 * A subset of fields returned by api-registry about a single company.
 */
export interface ICompanyInformation {
  x500Name: IX500NameInformation
  komgoMnid: string
}
