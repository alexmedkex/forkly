import {
  IMessagingPubKey,
  IEthPubKey,
  ICompanyRequest,
  IBottomSheetId,
  IPublicKeyRequest,
  ICompanyCommonInfo
} from '@komgo/types'

export interface ITxProperties {
  from: string
  gas: number
}

export interface ITextEntry {
  key: string
  value: string
}

export interface IUpdateEthPubKey {
  publicKey: {
    x: string
    y: string
  }
  termDate: number
  isEmpty: boolean
}

export interface IPublicKeys {
  komgoMessagingPubKey: IMessagingPubKey
  ethPubKey: IUpdateEthPubKey
}

export interface IUpdateMessagingPubKey {
  key: string
  termDate: number
  isEmpty: boolean
}

export interface ICompanyInformation {
  textEntries: ITextEntry[]
  staticIdHashed: string
  komgoMessagingPubKey?: IMessagingPubKey
  ethPubKey?: IEthPubKey | IUpdateEthPubKey
  vaktMessagingPubKey?: IMessagingPubKey
}

export interface IUpdateCompany extends ICompanyRequest, IBottomSheetId {}

export interface IUpdateCompanyInfo extends ICompanyCommonInfo {
  staticId: string
}

export interface IOnboardedCompany extends IUpdateCompanyInfo, IPublicKeyRequest {
  komgoMnid: string
}
