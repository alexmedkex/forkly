import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { Metric } from '../../utils/Metrics'

@injectable()
export class CachePopulationStateHolder {
  private logger = getLogger('CachePopulationStateHolder')
  private state: PopulationState

  constructor() {
    this.setState(PopulationState.Initialised)
  }

  public setState(populationState: PopulationState) {
    this.state = populationState
    this.logger.metric({ [Metric.CachePopulationState]: populationState })
  }

  public isComplete(): boolean {
    return this.state === PopulationState.Complete
  }
}

export enum PopulationState {
  Initialised = 'Initialised',
  InProgress = 'InProgress',
  Complete = 'Complete'
}
