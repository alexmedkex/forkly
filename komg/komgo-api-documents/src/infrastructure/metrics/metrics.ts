import { Result } from './consts'
import { Metric } from './Metric'

/**
 * A factory method to create an instance of "Metric" class.
 *
 * @param metricName name of a metric to record
 */
export function metric(metricName: string): Metric {
  return new Metric(metricName)
}

/**
 * A decorator to record success/error result for an "async" method.
 * If a decorated method returns a result without throwing an exception it records "success"
 * value for the specified metric name.
 * If a decorated method throws an exception it records "error" value for the
 * specified metric name.
 *
 * @param metricName metric for which the outcome will be reported
 */
export function MeterOutcome(metricName: string) {
  const outcomeMetric = metric(metricName)

  return function(target: object, key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value

    descriptor.value = async function(...args: any[]) {
      try {
        const res = await original.apply(this, args)
        outcomeMetric.record(Result.Success)
        return res
      } catch (e) {
        outcomeMetric.record(Result.Error)
        throw e
      }
    }

    return descriptor
  }
}
