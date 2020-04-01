import { IVakt, Status, IMessagingPublicKey, IEthereumPublicKey, IX500Name, MemberType } from '@komgo/types'

export interface IHarborCredentials {
  harborUser?: string
  harborEmail?: string
  harborPassword?: string
}

export interface IRMQCredentials {
  rabbitMQCommonUser?: string
  rabbitMQCommonPassword?: string
}

export interface ICompanyModel extends IRMQCredentials, IHarborCredentials {
  status: Status
  staticId: string
  komgoMnid: string
  x500Name: IX500Name
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean
  companyAdminEmail?: string
  memberType?: MemberType
  messagingPublicKey?: IMessagingPublicKey
  ethereumPublicKey?: IEthereumPublicKey
  keycloakUserId?: string
  nodeKeys?: string
  addedToENS?: boolean
  addedToMQ?: boolean
  vakt?: IVakt
  isDeactivated?: boolean
}

export interface IMemberPackage extends IRMQCredentials, IHarborCredentials {
  ensAddress: string
  staticId: string
  komgoMnid: string
}
