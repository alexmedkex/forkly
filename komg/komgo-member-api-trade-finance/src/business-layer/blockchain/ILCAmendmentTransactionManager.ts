import { ILCAmendment } from '@komgo/types'
import { ILC } from '../../data-layer/models/ILC'

export interface ILCAmendmentTransactionManager {
  deployInitial(lc: ILC, amendment: ILCAmendment, parties: string[]): Promise<string>
  approveByIssuingBank(
    contractAddress: string,
    parties: string[],
    documentHash: string,
    documentReference: string
  ): Promise<string>
  rejectByIssuingBank(contractAddress: string, parties: string[], comments: string): Promise<string>
}
