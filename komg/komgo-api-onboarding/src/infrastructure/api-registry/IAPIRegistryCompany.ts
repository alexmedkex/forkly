import { IX500Name, IEthPubKey, IMessagingPubKey } from '@komgo/types'

export interface IAPIRegistryCompany {
  node: string
  staticId: string
  komgoMnid: string
  x500Name: IX500Name
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean
  komgoMessagingPubKeys: IMessagingPubKey[]
  vaktMessagingPubKeys: IMessagingPubKey[]
  ethPubKeys: IEthPubKey[]
  nodeKeys: string
  vaktStaticId?: string
  vaktMnid?: string
}
