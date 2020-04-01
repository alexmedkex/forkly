import * as mongoose from 'mongoose'

import { IEthPubKeyDocument } from './IEthPubKeyDocument'
import { IMessagingPubKeyDocument } from './IMessagingPubKeyDocument'
import { IX500NameDocument } from './IX500NameDocument'

export interface IMemberDocument extends mongoose.Document {
  node: string
  parentNode: string
  label: string
  owner: string
  resolver: string
  address: string
  abi: string
  nodeKeys: string
  staticId: string
  isMember: boolean
  memberType: string
  isFinancialInstitution: boolean
  vaktStaticId: string
  komgoMnid: string
  vaktMnid: string
  x500Name: IX500NameDocument
  text: object
  ethPubKeys: IEthPubKeyDocument[]
  komgoMessagingPubKeys: IMessagingPubKeyDocument[]
  vaktMessagingPubKeys: IMessagingPubKeyDocument[]
  hasSWIFTKey: boolean
  reverseNode: string
}
