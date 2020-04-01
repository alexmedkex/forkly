import { getTasksConfigs, ITaskConfig } from './LCTasksConfig'
import { sampleLC } from '../messaging/mock-data/mock-lc'

describe('LCTasksConfig', () => {
  it('should retrieve task configs', () => {
    const configs = getTasksConfigs('urltest')
    for (const config of configs) {
      if (config.check) {
        config.check(sampleLC)
      }
    }
  })

  it('should retrieve task configs non-direct', () => {
    const configs = getTasksConfigs('urltest')
    for (const config of configs) {
      if (config.check) {
        config.check({ ...sampleLC, direct: false, stateHistory: [] })
      }
    }
  })
})
