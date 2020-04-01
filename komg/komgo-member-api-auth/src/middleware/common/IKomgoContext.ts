import { AxiosInstance } from 'axios'
import { Request } from 'express'

import IDecodedJWT from '../../utils/IDecodedJWT'

import { IPermission } from './IPermission'

export interface IKomgoContext {
  tenant?: {
    staticID: string
    decodedToken: IDecodedJWT
    keycloakInstance: any
    tenantAwareAxios: AxiosInstance
  }
  route?: {
    isSignedIn: boolean
    permissions: IPermission[]
  }
}

export interface IKomgoContextAwareRequest extends Request {
  komgoContext?: IKomgoContext
}
