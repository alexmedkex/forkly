import { ICreateLCRequest } from '../../src/service-layer/requests/ILetterOfCredit'
import IUser from './IUser'

export interface ILCUseCase {
  createLC(request: ICreateLCRequest, user: IUser)
}
