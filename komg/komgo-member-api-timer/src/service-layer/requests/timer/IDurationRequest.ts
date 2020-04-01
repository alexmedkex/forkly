import { DurationUnit } from '../../../data-layer/models/DurationUnit'

export interface IDurationRequest {
  duration: number
  unit: DurationUnit
}
