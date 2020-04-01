import logger from '@komgo/logging'

/**
 * A helper class to record values for a provided metric
 */
export class Metric {
  /**
   * @param metricName name of a metric for which we record value
   */
  constructor(private readonly metricName: string) {}

  /**
   * Record a metric value
   * @param value value to record
   */
  record(value: any) {
    logger.metric({
      [this.metricName]: value
    })
  }
}
