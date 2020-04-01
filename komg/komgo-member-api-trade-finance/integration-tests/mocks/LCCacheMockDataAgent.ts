import { ILCCacheDataAgent } from '../../src/data-layer/data-agents'
import { ILC } from '../../src/data-layer/models/ILC'
import { LC_STATE } from '../../src/business-layer/events/LC/LCStates'
import { sampleLC } from '../../src/business-layer/messaging/mock-data/mock-lc'

const NonImplementedError = new Error('Not implemented')

export class LCCacheMockDataAgent implements ILCCacheDataAgent {
  async updateLcByReference(reference: string, lc: ILC) {
    throw NonImplementedError
  }
  async saveLC(LC: ILC): Promise<string> {
    throw NonImplementedError
  }

  async updateField(id: string, field: keyof ILC, value: any) {
    throw NonImplementedError
  }

  async updateStatus(id: string, status: LC_STATE): Promise<ILC> {
    throw NonImplementedError
  }

  async getLC(attributes: object): Promise<ILC> {
    return sampleLC
  }

  async getLCs(): Promise<ILC[]> {
    throw NonImplementedError
  }

  async getNonce() {
    return 0
  }

  async count(query?: object): Promise<number> {
    return 1
  }
}
