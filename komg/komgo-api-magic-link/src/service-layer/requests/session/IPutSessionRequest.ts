import { ISessionUpdateMongo } from './ISessionRequest'

export interface IPutSessionRequest extends ISessionUpdateMongo {
  staticId: string
}
