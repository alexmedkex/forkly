import { NewEthPubKey } from '../../data-layer/models/NewEthPubKey'

export interface IEthPubKeyUseCase {
  addEthPubKey(companyEnsDomain: string, ethPubKey: NewEthPubKey): Promise<string>
  revokeEthPubKey(companyEnsDomain: string, ethPubKeyIndex: number): Promise<string>
}
